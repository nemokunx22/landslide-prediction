# Flask ML Service

Machine Learning microservice for disaster prediction.

## Models
- `random_forest_model.pkl` - Flood prediction (binary: 0=SAFE, 1=DANGER)
- `mark_1_Landslide2.pkl` - Landslide prediction (probability: 0.0-1.0)

## Features
**Flood Model:** [Rainfall, Water Level, River Discharge]
**Landslide Model:** [Rainfall, Humidity (%), Erosion Index]

## Run
```bash
pip install -r requirements.txt
python app.py
