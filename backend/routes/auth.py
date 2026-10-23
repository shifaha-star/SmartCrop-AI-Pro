"""
routes/auth.py
--------------
Authentication blueprint.
Phase 2, Step 1: POST /api/auth/register

Placement: backend/routes/auth.py
"""

import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from sqlalchemy.exc import IntegrityError

from models import db
from models.user import User


# All routes in this file are prefixed with /api/auth in app.py
auth_bp = Blueprint("auth", __name__)


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _missing_fields(data, required):
    """
    Returns a list of field names that are absent or blank in `data`.

    Args:
        data (dict): Parsed JSON request body.
        required (list[str]): Field names that must be present and non-empty.

    Returns:
        list[str]: Names of missing/blank fields. Empty list means all present.
    """
    return [f for f in required if not data.get(f, "").strip()]


def _validate_email(email):
    """
    Lightweight email format check — confirms there is exactly one '@'
    with at least one character on each side and a '.' after the '@'.

    Not a full RFC 5321 check, but sufficient to catch obvious typos
    before they hit the database unique constraint.

    Args:
        email (str): Email address to validate.

    Returns:
        bool: True if format looks valid.
    """
    parts = email.strip().split("@")
    if len(parts) != 2:
        return False
    local, domain = parts
    return bool(local) and "." in domain and not domain.startswith(".")


def _validate_password(password):
    """
    Enforces a minimum password policy:
      - At least 8 characters
      - At least one digit
      - At least one letter

    Args:
        password (str): Plain-text password to check.

    Returns:
        str | None: An error message string if invalid, or None if valid.
    """
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not any(c.isdigit() for c in password):
        return "Password must contain at least one number."
    if not any(c.isalpha() for c in password):
        return "Password must contain at least one letter."
    return None


# ---------------------------------------------------------------------------
# POST /api/auth/register
# ---------------------------------------------------------------------------

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new user account.

    Expected JSON body:
        {
            "name":     "Ravi Kumar",          (required)
            "email":    "ravi@example.com",    (required)
            "password": "Secure123",           (required, min 8 chars)
            "location": "Maharashtra"          (optional)
        }

    Success response — 201 Created:
        {
            "message": "Account created successfully.",
            "user": {
                "id":         1,
                "name":       "Ravi Kumar",
                "email":      "ravi@example.com",
                "location":   "Maharashtra",
                "created_at": "2025-01-15T10:30:00"
            }
        }

    Error responses:
        400 — missing fields, invalid email format, weak password
        409 — email already registered
        500 — unexpected database error
    """

    # ------------------------------------------------------------------
    # 1. Parse request body
    # ------------------------------------------------------------------
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body must be JSON.",
            "code":  "INVALID_CONTENT_TYPE",
        }), 400

    # ------------------------------------------------------------------
    # 2. Check required fields are present and non-empty
    # ------------------------------------------------------------------
    required = ["name", "email", "password"]
    missing = _missing_fields(data, required)

    if missing:
        return jsonify({
            "error":  f"Missing required fields: {', '.join(missing)}.",
            "code":   "MISSING_FIELDS",
            "fields": missing,
        }), 400

    # ------------------------------------------------------------------
    # 3. Sanitise inputs
    #    Strip whitespace from all string fields.
    #    Do NOT strip the password — spaces in passwords are intentional.
    # ------------------------------------------------------------------
    name     = data["name"].strip()
    email    = data["email"].strip().lower()  # normalise to lowercase
    password = data["password"]               # do not strip
    location = data.get("location", "").strip()

    # ------------------------------------------------------------------
    # 4. Validate name length
    # ------------------------------------------------------------------
    if len(name) < 2:
        return jsonify({
            "error": "Name must be at least 2 characters long.",
            "code":  "INVALID_NAME",
        }), 400

    if len(name) > 100:
        return jsonify({
            "error": "Name must not exceed 100 characters.",
            "code":  "INVALID_NAME",
        }), 400

    # ------------------------------------------------------------------
    # 5. Validate email format
    # ------------------------------------------------------------------
    if not _validate_email(email):
        return jsonify({
            "error": "Invalid email address format.",
            "code":  "INVALID_EMAIL",
        }), 400

    # ------------------------------------------------------------------
    # 6. Validate password strength
    # ------------------------------------------------------------------
    password_error = _validate_password(password)
    if password_error:
        return jsonify({
            "error": password_error,
            "code":  "WEAK_PASSWORD",
        }), 400

    # ------------------------------------------------------------------
    # 7. Check for duplicate email
    #    Explicit query before insert — gives a clear 409 rather than
    #    relying on catching an IntegrityError from the DB constraint.
    #    We keep the IntegrityError catch below as a safety net for
    #    race conditions (two simultaneous registrations with same email).
    # ------------------------------------------------------------------
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({
            "error": "An account with this email address already exists.",
            "code":  "EMAIL_TAKEN",
        }), 409

    # ------------------------------------------------------------------
    # 8. Hash the password with bcrypt
    #    bcrypt.hashpw() expects bytes, so we encode the password first.
    #    gensalt() default work factor is 12 — secure and fast enough
    #    for a college project without noticeable delay.
    # ------------------------------------------------------------------
    password_bytes = password.encode("utf-8")
    salt           = bcrypt.gensalt()
    password_hash  = bcrypt.hashpw(password_bytes, salt).decode("utf-8")

    # ------------------------------------------------------------------
    # 9. Create and persist the new User record
    # ------------------------------------------------------------------
    new_user = User(
        name          = name,
        email         = email,
        password_hash = password_hash,
        location      = location,
    )

    try:
        db.session.add(new_user)
        db.session.commit()

    except IntegrityError:
        # Race condition: another request inserted the same email
        # between our duplicate check (step 7) and this commit.
        db.session.rollback()
        return jsonify({
            "error": "An account with this email address already exists.",
            "code":  "EMAIL_TAKEN",
        }), 409

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error":   "An unexpected error occurred. Please try again.",
            "code":    "DB_ERROR",
            "details": str(e),
        }), 500

    # ------------------------------------------------------------------
    # 10. Return success — 201 Created
    #     Never return the password_hash in any response.
    # ------------------------------------------------------------------
    return jsonify({
        "message": "Account created successfully.",
        "user":    new_user.to_dict(),
    }), 201


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticates an existing user and returns a JWT access token.

    Expected JSON body:
        {
            "email":    "ravi@example.com",    (required)
            "password": "Secure123"            (required)
        }

    Success response — 200 OK:
        {
            "message":      "Login successful.",
            "access_token": "<JWT string>",
            "user": {
                "id":         1,
                "name":       "Ravi Kumar",
                "email":      "ravi@example.com",
                "location":   "Maharashtra",
                "created_at": "2025-01-15T10:30:00"
            }
        }

    Error responses:
        400 — missing fields or non-JSON body
        401 — email not found, or password does not match
        500 — unexpected error
    """

    # ------------------------------------------------------------------
    # 1. Parse request body
    # ------------------------------------------------------------------
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body must be JSON.",
            "code":  "INVALID_CONTENT_TYPE",
        }), 400

    # ------------------------------------------------------------------
    # 2. Check required fields are present and non-empty
    # ------------------------------------------------------------------
    missing = _missing_fields(data, ["email", "password"])

    if missing:
        return jsonify({
            "error":  f"Missing required fields: {', '.join(missing)}.",
            "code":   "MISSING_FIELDS",
            "fields": missing,
        }), 400

    # ------------------------------------------------------------------
    # 3. Sanitise inputs
    # ------------------------------------------------------------------
    email    = data["email"].strip().lower()
    password = data["password"]              # do not strip

    # ------------------------------------------------------------------
    # 4. Look up user by email
    #
    #    Return 401 (not 404) regardless of whether the email exists or
    #    the password is wrong. Giving different errors for "email not
    #    found" vs "wrong password" lets attackers enumerate valid emails.
    #    A single generic message prevents that.
    # ------------------------------------------------------------------
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "error": "Invalid email or password.",
            "code":  "INVALID_CREDENTIALS",
        }), 401

    # ------------------------------------------------------------------
    # 5. Verify password against the stored bcrypt hash
    #
    #    bcrypt.checkpw() compares the plain-text password (as bytes)
    #    against the stored hash (as bytes). Returns True if they match.
    #    This is intentionally slow — bcrypt's cost factor makes brute
    #    force attacks impractical.
    # ------------------------------------------------------------------
    password_matches = bcrypt.checkpw(
        password.encode("utf-8"),
        user.password_hash.encode("utf-8"),
    )

    if not password_matches:
        return jsonify({
            "error": "Invalid email or password.",
            "code":  "INVALID_CREDENTIALS",
        }), 401

    # ------------------------------------------------------------------
    # 6. Generate JWT access token
    #
    #    identity must be a string — we use the user's integer id
    #    converted to str. Flask-JWT-Extended stores this as the
    #    token's `sub` (subject) claim.
    #    Token expiry is controlled by JWT_ACCESS_TOKEN_EXPIRES in
    #    config.py (currently set to 24 hours).
    # ------------------------------------------------------------------
    access_token = create_access_token(identity=str(user.id))

    # ------------------------------------------------------------------
    # 7. Return token + safe user object — 200 OK
    #    Never return password_hash.
    # ------------------------------------------------------------------
    return jsonify({
        "message":      "Login successful.",
        "access_token": access_token,
        "user":         user.to_dict(),
    }), 200


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """
    Returns the profile of the currently authenticated user.

    This endpoint is protected — the caller must supply a valid JWT
    access token in the Authorization header:
        Authorization: Bearer <access_token>

    The token is validated by @jwt_required() before this function body
    runs. If the token is missing, expired, or tampered with,
    Flask-JWT-Extended automatically returns a 401 response and this
    function is never called.

    Success response — 200 OK:
        {
            "user": {
                "id":         1,
                "name":       "Ravi Kumar",
                "email":      "ravi@example.com",
                "location":   "Maharashtra",
                "created_at": "2025-01-15T10:30:00"
            }
        }

    Error responses:
        401 — token missing, expired, or invalid (handled by JWT-Extended)
        404 — token is valid but the user_id inside it no longer exists
              in the database (e.g. account was deleted after token was issued)
        500 — unexpected database error
    """
    # ------------------------------------------------------------------
    # 1. Extract user identity from the validated JWT
    #
    #    get_jwt_identity() returns the `identity` string we passed
    #    to create_access_token() during login — which is str(user.id).
    #    Convert it back to int for the database query.
    # ------------------------------------------------------------------
    user_id_str = get_jwt_identity()

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        return jsonify({
            "error": "Token contains an invalid user identity.",
            "code":  "INVALID_TOKEN_IDENTITY",
        }), 401

    # ------------------------------------------------------------------
    # 2. Fetch the user from the database
    #
    #    We re-query on every /me call rather than encoding user data
    #    into the token itself. This ensures the response always
    #    reflects the current database state — if the user updates
    #    their name or location, /me returns the updated values
    #    immediately without requiring a new token.
    # ------------------------------------------------------------------
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "User account not found. It may have been deleted.",
            "code":  "USER_NOT_FOUND",
        }), 404

    # ------------------------------------------------------------------
    # 3. Return the safe user profile — 200 OK
    #    to_dict() never includes password_hash.
    # ------------------------------------------------------------------
    return jsonify({
        "user": user.to_dict(),
    }), 200