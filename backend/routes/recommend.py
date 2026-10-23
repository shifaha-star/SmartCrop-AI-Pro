"""
routes/recommend.py
-------------------
Crop recommendation API.

Endpoint:
POST /api/recommend

Uses the trained ML model to predict the top 6 most suitable crops
with suitability percentages.
"""

from flask import Blueprint, request, jsonify

from ml.predict import predict_top_crops

recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.route("/recommend", methods=["POST"])
def recommend():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body must be JSON."
        }), 400

    # ------------------------------------------------------------------
    # Required fields — used directly by the ML model
    # ------------------------------------------------------------------
    required_fields = [
        "N",
        "P",
        "K",
        "temperature",
        "humidity",
        "ph",
        "rainfall",
    ]

    missing = [field for field in required_fields if field not in data]

    if missing:
        return jsonify({
            "error": f"Missing fields: {', '.join(missing)}"
        }), 400

    # ------------------------------------------------------------------
    # Optional fields — accepted from the React form, reserved for
    # history saving and enrichment in a later phase
    # ------------------------------------------------------------------
    location  = data.get("location", "")
    season    = data.get("season", "")
    farm_size = data.get("farm_size", None)

    # ------------------------------------------------------------------
    # Run prediction
    # ------------------------------------------------------------------
    try:
        recommendations = predict_top_crops(
            float(data["N"]),
            float(data["P"]),
            float(data["K"]),
            float(data["temperature"]),
            float(data["humidity"]),
            float(data["ph"]),
            float(data["rainfall"]),
        )

        return jsonify({
            "recommendations": recommendations
        }), 200

    except ValueError as e:
        return jsonify({
            "error": f"Invalid numeric value in input: {e}"
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500