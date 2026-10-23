"""
app.py
------
Flask application entry point.

Uses the application factory pattern:
  create_app() builds and configures the Flask app.
  Running this file directly starts the development server.

Placement: backend/app.py
Run with:  python app.py
           (or: flask run, with FLASK_APP=app.py set in .env)
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import get_config
from models import db

# Import all models so SQLAlchemy knows about them when create_all() is called.
# Even if the models aren't used directly in this file, the import registers
# them with the db metadata. Do not remove these imports.
from models.user import User                              # noqa: F401
from models.recommendation import (                       # noqa: F401
    RecommendationHistory,
    GeneratedReport,
)


def create_app():
    """
    Application factory.
    Creates and fully configures the Flask app instance.
    Returns the configured app — does not run it.
    """

    app = Flask(__name__)

    # ------------------------------------------------------------------
    # 1. Load configuration from config.py (which reads from .env)
    # ------------------------------------------------------------------
    app.config.from_object(get_config())

    # ------------------------------------------------------------------
    # 2. Initialise extensions
    #    Each extension is bound to the app here via init_app().
    #    This is why db was created without an app in models/__init__.py.
    # ------------------------------------------------------------------

    # SQLAlchemy — connects to MySQL using SQLALCHEMY_DATABASE_URI
    db.init_app(app)

    # CORS — allows React (http://localhost:3000) to make API calls
    CORS(app, resources={
        r"/api/*": {
            "origins":        app.config["CORS_ORIGINS"],
            "methods":        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers":  ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    })

    # JWT — for token-based auth (routes registered in Phase 2)
    JWTManager(app)

    # ------------------------------------------------------------------
    # 3. Create database tables
    #    db.create_all() inspects every imported model and issues
    #    CREATE TABLE IF NOT EXISTS statements. Safe to run repeatedly.
    # ------------------------------------------------------------------
    with app.app_context():
        db.create_all()
        print("[Phase 1] Database tables created (or already exist).")

    # ------------------------------------------------------------------
    # 4. Register route blueprints
    #    Phase 1 has no routes yet. Each phase adds a blueprint here.
    #    The comments below show exactly where each phase plugs in.
    # ------------------------------------------------------------------

    # Phase 2 — Authentication
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Phase 4 — Crop Recommendation
    from routes.recommend import recommend_bp
    app.register_blueprint(recommend_bp, url_prefix="/api")

    # Phase 5 — Weather API
    # from routes.weather import weather_bp
    # app.register_blueprint(weather_bp, url_prefix="/api")

    # Phase 6 — Recommendation History
    # from routes.history import history_bp
    # app.register_blueprint(history_bp, url_prefix="/api")

    # Phase 7 — PDF Report Generation
    # from routes.report import report_bp
    # app.register_blueprint(report_bp, url_prefix="/api")

    # ------------------------------------------------------------------
    # 5. Health-check endpoint
    #    Visit http://localhost:5000/api/health to confirm Flask is running
    #    and the DB connection is alive.
    # ------------------------------------------------------------------
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """
        Confirms the server is running and the DB connection is alive.
        Returns:
            200 { status: "ok", database: "connected" }
            500 { status: "error", database: "unreachable", message: "..." }
        """
        try:
            # Execute a trivial query to confirm MySQL is reachable.
            # db.session.execute() runs raw SQL; text() is required by SQLAlchemy 2.x.
            from sqlalchemy import text
            db.session.execute(text("SELECT 1"))
            return jsonify({
                "status":   "ok",
                "database": "connected",
                "message":  "AI Crop Recommendation System backend is running.",
            }), 200
        except Exception as e:
            return jsonify({
                "status":   "error",
                "database": "unreachable",
                "message":  str(e),
            }), 500

    # ------------------------------------------------------------------
    # 6. Global error handlers
    #    Return JSON errors instead of Flask's default HTML error pages.
    #    React expects JSON — HTML responses would silently break the frontend.
    # ------------------------------------------------------------------
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()  # Roll back any failed transaction
        return jsonify({"error": "An internal server error occurred."}), 500

    return app


# ------------------------------------------------------------------
# Entry point
# Run with: python app.py
# ------------------------------------------------------------------
if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",   # Accessible on local network (useful for testing on phone)
        port=5000,
        debug=True,
    )