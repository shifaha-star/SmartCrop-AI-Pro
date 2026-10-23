"""
config.py
---------
Centralised configuration for the Flask application.
All sensitive values are read from the .env file via python-dotenv.
Never hardcode passwords or secret keys in this file.
 
Placement: backend/config.py
"""
 
import os
from dotenv import load_dotenv
 
# Load variables from .env into os.environ
load_dotenv()
 
 
class Config:
    """
    Base configuration shared by all environments.
    """
 
    # -------------------------------------------------------------------
    # Flask core
    # -------------------------------------------------------------------
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
 
    # -------------------------------------------------------------------
    # SQLAlchemy / MySQL
    # -------------------------------------------------------------------
    _DB_USER     = os.environ.get("DB_USER", "root")
    _DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    _DB_HOST     = os.environ.get("DB_HOST", "localhost")
    _DB_PORT     = os.environ.get("DB_PORT", "3306")
    _DB_NAME     = os.environ.get("DB_NAME", "aicrop_db")
 
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{_DB_USER}:{_DB_PASSWORD}"
        f"@{_DB_HOST}:{_DB_PORT}/{_DB_NAME}"
    )
 
    # Disable SQLAlchemy event system overhead — not needed here
    SQLALCHEMY_TRACK_MODIFICATIONS = False
 
    # Echo SQL statements to terminal in debug mode (useful while building)
    SQLALCHEMY_ECHO = os.environ.get("FLASK_DEBUG", "0") == "1"
 
    # -------------------------------------------------------------------
    # JWT
    # -------------------------------------------------------------------
    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY", "dev-jwt-secret-change-in-production"
    )
    # Tokens expire after 24 hours — sufficient for a college project
    from datetime import timedelta
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
 
    # -------------------------------------------------------------------
    # External APIs
    # -------------------------------------------------------------------
    WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "")
 
    # -------------------------------------------------------------------
    # CORS
    # -------------------------------------------------------------------
    # React dev server origin — update this if your React runs on a
    # different port or if you deploy to a different domain.
    CORS_ORIGINS = ["http://localhost:3000"]
 
 
class DevelopmentConfig(Config):
    """
    Development-specific overrides.
    """
    DEBUG = True
 
 
class ProductionConfig(Config):
    """
    Production overrides.
    Set FLASK_ENV=production in your deployment environment.
    """
    DEBUG = False
    SQLALCHEMY_ECHO = False
 
 
# -------------------------------------------------------------------
# Config selector — used by app.py
# -------------------------------------------------------------------
config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
}
 
def get_config():
    """
    Returns the correct config class based on FLASK_ENV.
    Defaults to DevelopmentConfig if FLASK_ENV is not set.
    """
    env = os.environ.get("FLASK_ENV", "development")
    return config_map.get(env, DevelopmentConfig)
 