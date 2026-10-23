"""
models/__init__.py
------------------
Creates the single shared SQLAlchemy instance (db).

IMPORTANT: This instance is created here without binding it to any Flask
app yet. It gets bound to the actual app inside app.py via db.init_app().
This pattern (called the "application factory pattern") lets models be
imported without needing a running Flask app — which avoids circular imports.

Placement: backend/models/__init__.py
"""

from flask_sqlalchemy import SQLAlchemy

# Single shared db instance — imported by every model file and by app.py
db = SQLAlchemy()