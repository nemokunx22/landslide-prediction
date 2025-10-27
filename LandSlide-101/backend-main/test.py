import pickle

# Load both ML models safely
import pandas as pd

df = pd.read_excel('R-factor Distribution.xlsx')
print(df.head())
print(df['Average R_Factor'][2])

erosion = df['Average R_Factor'][2]

def load_model(path):
    try:
        with open(path, "rb") as model_file:
            return pickle.load(model_file)
    except Exception as e:
        print(f"Error loading model {path}: {e}")
        return None

model2 = load_model("mark_1_Landslide2.pkl")  # New second model
print(model2)
print(f" Model 2 Type: {type(model2)}")

import numpy as np
weather_array2 = np.array([1, 2, 3, erosion], dtype=float).reshape(1, -1)

prediction2 = model2.predict(weather_array2)[0]

print(f"Prediction 2: {prediction2}")