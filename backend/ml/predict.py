"""
ml/predict.py
-------------
Loads the trained crop recommendation model and provides a helper
function for making predictions.
"""

import joblib
from pathlib import Path

# Path to the saved model
MODEL_PATH = Path(__file__).parent / "model" / "crop_recommendation_model.pkl"

# Load the model only once when this file is imported
model = joblib.load(MODEL_PATH)


def predict_crop(n, p, k, temperature, humidity, ph, rainfall):
    """
    Predicts the most suitable crop.

    Args:
        n, p, k, temperature, humidity, ph, rainfall (float)

    Returns:
        str: Predicted crop name
    """

    prediction = model.predict([[
        n,
        p,
        k,
        temperature,
        humidity,
        ph,
        rainfall
    ]])

    return prediction[0]


def predict_top_crops(n, p, k, temperature, humidity, ph, rainfall, top_n=6):
    """
    Returns the top N most suitable crops with suitability percentages.

    Uses predict_proba() to obtain the probability for each of the 22
    crop classes, maps them to crop names via model.classes_, sorts from
    highest to lowest probability, and returns the top N results.

    Args:
        n, p, k, temperature, humidity, ph, rainfall (float): Farm inputs.
        top_n (int): Number of top crops to return. Defaults to 6.

    Returns:
        list[dict]: Each dict has exactly two keys:
            "crop"        (str)   — crop name as labelled in the training data
            "suitability" (float) — probability as a percentage, rounded to 2dp
                                    e.g. 87.32 means 87.32% confidence

    Example return value:
        [
            {"crop": "rice",      "suitability": 87.32},
            {"crop": "maize",     "suitability": 6.14},
            {"crop": "cotton",    "suitability": 2.50},
            {"crop": "jute",      "suitability": 1.98},
            {"crop": "lentil",    "suitability": 1.06},
            {"crop": "chickpea",  "suitability": 1.00},
        ]
    """
    # predict_proba() returns a 2D array of shape (1, 22) for a single row.
    # [0] selects the first (only) row — a flat array of 22 probabilities.
    probabilities = model.predict_proba([[
        n,
        p,
        k,
        temperature,
        humidity,
        ph,
        rainfall
    ]])[0]

    # model.classes_ is the ordered list of crop name strings that maps
    # index-for-index to the probabilities array.
    crops = model.classes_

    # Pair each crop name with its probability, sort descending, take top N.
    ranked = sorted(
        zip(crops, probabilities),
        key=lambda pair: pair[1],
        reverse=True,
    )

    return [
        {
            "crop":        crop,
            "suitability": round(float(probability) * 100, 2),
        }
        for crop, probability in ranked[:top_n]
    ]