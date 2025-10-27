from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

from reportGeneration import ReportGeneration
rG = ReportGeneration()

from inputData import InputData
iD = InputData()

# Load erosion factor data
df = pd.read_excel('R-factor Distribution.xlsx')

# ✅ Create Flask app
app = Flask(__name__)  # 🔧 Corrected from _name_ to __name__
CORS(app, resources={r"/*": {"origins": "*"}})  # 🔧 Corrected CORS path and wildcard origins

# ✅ Load models safely
def load_model(path):
    try:
        with open(path, "rb") as model_file:
            return pickle.load(model_file)
    except Exception as e:
        print(f"❌ Error loading model {path}: {e}")
        return None

model1 = load_model("random_forest_model.pkl")  # Flood model
model2 = load_model("mark_1_Landslide2.pkl")    # Landslide model

print(f"✅ Model 1 Type: {type(model1)}")
print(f"✅ Model 2 Type: {type(model2)}")

@app.route("/", methods=["GET"])
def home():
    return "Flask backend is running!"

@app.route("/predict", methods=["POST"])
def predict():
    if model1 is None or model2 is None:
        print("❌ One or both ML models failed to load!")
        return jsonify({"error": "One or both ML models are missing"}), 500

    data = request.get_json()
    print(f"📥 Received Data: {data}")

    if not data or "weather" not in data or "district" not in data or "state" not in data:
        print("❌ Invalid input format")
        return jsonify({"error": "Invalid input"}), 400

    weather_features = data["weather"]
    district = data["district"]
    state = data["state"]
    elevation = data.get("elevation", 0)

    rain = weather_features[0]  

    print(f"📍 District: {district}, State: {state}")
    print(f"📏 Elevation received: {elevation}")

    if not isinstance(weather_features, list) or len(weather_features) != 3:
        print(f"❌ Invalid input shape: {weather_features}")
        return jsonify({"error": "Weather data must be a list of 3 numerical values"}), 400

    try:
        # ✅ Landslide model input
        weather_array1 = np.array(weather_features, dtype=float).reshape(1, -1)
        erosion = df['Average R_Factor'][2]  # Static value for now
        weather_array2 = np.append(weather_array1, erosion).reshape(1, -1)

        print(f"✅ Model 2 Input (Landslide): {weather_array2}")

        # ✅ Flood model input (using InputData helper)
        wl, rd = iD.getData(state=state, district=district)  # Water Level, River Discharge
        flood_input = np.array([[rain, wl, rd]])
        print(f"✅ Model 1 Input (Flood): {flood_input}")

        # ✅ Predictions
        prediction1 = model1.predict(flood_input)[0]     # Flood
        prediction2 = model2.predict(weather_array2)[0]  # Landslide

        print(f"✅ Prediction 1 (Flood): {prediction1}")
        print(f"✅ Prediction 2 (Landslide): {prediction2}")

        # ✅ Save report
        rG.generateReport([{
            "Rain": rain,
            "Water Level": wl,
            "River Discharge": rd,
            "district": district,
            "state": state,
            "elevation": elevation
        }], prediction1, prediction2, 'output1.csv')

        # ✅ Send back predictions
        return jsonify({
            "prediction1": str(prediction1),
            "prediction2": str(prediction2)
        })

    except Exception as e:
        print(f"❌ Prediction failed: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# ✅ Correct main function
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
