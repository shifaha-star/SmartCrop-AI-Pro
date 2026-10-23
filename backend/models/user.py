"""
models/user.py
--------------
ORM model for the `users` table.

Columns match the database schema defined in the roadmap.
Password is never stored as plain text — bcrypt hashing is handled
in the auth routes (Phase 2). This model only stores the hash.

Placement: backend/models/user.py
"""

from datetime import datetime
from models import db


class User(db.Model):
    """
    Represents a registered farmer/user of the system.
    """

    __tablename__ = "users"

    # ------------------------------------------------------------------
    # Columns
    # ------------------------------------------------------------------
    id            = db.Column(db.Integer,     primary_key=True, autoincrement=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # Default farm location — prefills the location field in the React form
    location      = db.Column(db.String(100), nullable=True, default="")

    created_at    = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    # One user → many recommendation history entries
    recommendations = db.relationship(
        "RecommendationHistory",
        back_populates="user",
        cascade="all, delete-orphan",  # deleting a user removes their history
        lazy="dynamic",                # don't load all rows unless queried
    )

    # One user → many generated PDF reports
    reports = db.relationship(
        "GeneratedReport",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def to_dict(self):
        """
        Returns a safe dictionary representation of this user.
        Never includes password_hash.
        Used by auth routes to build JSON responses.
        """
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "location":   self.location,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"