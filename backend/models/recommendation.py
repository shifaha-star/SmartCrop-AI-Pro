"""
models/recommendation.py
------------------------
ORM models for:
  - RecommendationHistory  →  `recommendation_history` table
  - GeneratedReport        →  `generated_reports` table

Why both in one file:
  GeneratedReport has a FK into recommendation_history.
  Keeping them together avoids a circular import between two model files.

Placement: backend/models/recommendation.py
"""

import json
from datetime import datetime
from models import db


class RecommendationHistory(db.Model):
    """
    Stores every crop recommendation run made by a user.

    The 7 numeric farm inputs (N, P, K, temperature, humidity, pH, rainfall)
    are stored as individual columns so they can be queried and filtered later
    (e.g. "show me all runs where pH < 6.5").

    The full recommendations array returned by the ML model is stored as a
    JSON string in `results_json` — this avoids needing a separate crops table
    at this stage, while still letting us reconstruct the full result on demand.
    """

    __tablename__ = "recommendation_history"

    # ------------------------------------------------------------------
    # Primary key + foreign key
    # ------------------------------------------------------------------
    id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------
    # Farm input parameters (mirrors inputData in React App.js)
    # ------------------------------------------------------------------
    nitrogen     = db.Column(db.Float, nullable=False)
    phosphorus   = db.Column(db.Float, nullable=False)
    potassium    = db.Column(db.Float, nullable=False)
    temperature  = db.Column(db.Float, nullable=False)
    humidity     = db.Column(db.Float, nullable=False)
    ph           = db.Column(db.Float, nullable=False)
    rainfall     = db.Column(db.Float, nullable=False)
    location     = db.Column(db.String(100), nullable=False, default="")
    season       = db.Column(db.String(20),  nullable=False, default="Kharif")
    farm_size    = db.Column(db.Float, nullable=False, default=1.0)

    # ------------------------------------------------------------------
    # ML output — stored as serialised JSON string
    # ------------------------------------------------------------------
    results_json = db.Column(db.Text, nullable=False, default="[]")

    # ------------------------------------------------------------------
    # Timestamp
    # ------------------------------------------------------------------
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    user = db.relationship("User", back_populates="recommendations")

    reports = db.relationship(
        "GeneratedReport",
        back_populates="history_entry",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def get_results(self):
        """
        Deserialises results_json back into a Python list.
        Always use this instead of accessing results_json directly.
        """
        try:
            return json.loads(self.results_json)
        except (json.JSONDecodeError, TypeError):
            return []

    def set_results(self, results_list):
        """
        Serialises a Python list into results_json.
        Always use this when saving ML output.

        Example:
            entry.set_results([{"crop": "Rice", "suitability": 87.3, ...}])
        """
        self.results_json = json.dumps(results_list)

    def top_crop(self):
        """
        Returns the name of the highest-ranked crop, or None if no results.
        Useful for displaying a summary in the history list view.
        """
        results = self.get_results()
        if results:
            return results[0].get("crop")
        return None

    def to_dict(self, include_results=False):
        """
        Returns a dictionary for JSON serialisation.

        Args:
            include_results (bool): If True, includes the full ML results array.
                                    Use False for list views, True for detail views.
        """
        data = {
            "id":          self.id,
            "user_id":     self.user_id,
            "nitrogen":    self.nitrogen,
            "phosphorus":  self.phosphorus,
            "potassium":   self.potassium,
            "temperature": self.temperature,
            "humidity":    self.humidity,
            "ph":          self.ph,
            "rainfall":    self.rainfall,
            "location":    self.location,
            "season":      self.season,
            "farm_size":   self.farm_size,
            "top_crop":    self.top_crop(),
            "created_at":  self.created_at.isoformat(),
        }
        if include_results:
            data["recommendations"] = self.get_results()
        return data

    def __repr__(self):
        return (
            f"<RecommendationHistory id={self.id} "
            f"user_id={self.user_id} top_crop={self.top_crop()}>"
        )


class GeneratedReport(db.Model):
    """
    Tracks PDF reports generated by users.

    Each report is tied to one RecommendationHistory entry — the PDF
    is always generated from a specific past recommendation run.
    The file is saved on the server and `file_path` records its location.
    """

    __tablename__ = "generated_reports"

    # ------------------------------------------------------------------
    # Primary key + foreign keys
    # ------------------------------------------------------------------
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id    = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    history_id = db.Column(
        db.Integer,
        db.ForeignKey("recommendation_history.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------
    # File location
    # ------------------------------------------------------------------
    # Relative path from the backend root, e.g. "reports/user_3_run_42.pdf"
    file_path  = db.Column(db.String(255), nullable=False)

    # ------------------------------------------------------------------
    # Timestamp
    # ------------------------------------------------------------------
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    user          = db.relationship("User", back_populates="reports")
    history_entry = db.relationship(
        "RecommendationHistory", back_populates="reports"
    )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def to_dict(self):
        return {
            "id":         self.id,
            "user_id":    self.user_id,
            "history_id": self.history_id,
            "file_path":  self.file_path,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return (
            f"<GeneratedReport id={self.id} "
            f"user_id={self.user_id} history_id={self.history_id}>"
        )