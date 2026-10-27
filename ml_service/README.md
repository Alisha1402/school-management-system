# Academic Performance Prediction - FastAPI Microservice

This microservice provides machine-learning-driven academic trajectory predictions and early risk identification for the **School Management System**.

## 🧠 Model Architecture & Specification

- **Algorithm**: `RandomForestRegressor` (Scikit-Learn 1.9+)
- **Estimators**: 120 trees with max depth 7
- **Model Version**: `1.0.0-rf-academic`
- **Trained Performance**:
  - Hold-out $R^2$: `0.9155`
  - 5-Fold Cross-Validation $R^2$: `0.9001`
  - Mean Absolute Error (MAE): `2.77%`
  - Root Mean Squared Error (RMSE): `3.55%`
- **Features Used**:
  1. `attendance_rate`: Student overall classroom attendance percentage ($0 - 100\%$)
  2. `assignment_completion_rate`: Percentage of scheduled assignments submitted ($0 - 100\%$)
  3. `assignment_avg_score`: Mean accuracy on submitted and graded coursework ($0 - 100\%$)
  4. `midterm_exam_score`: Baseline marks achieved in term assessments ($0 - 100\%$)
  5. `study_consistency`: Continuous engagement score ($1 - 10$)

---

## 🚀 Running Locally

```bash
cd ml_service
pip install -r requirements.txt
python train_model.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🌐 Deploying to Render (Cloud Hosting)

1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your repository.
3. Configure settings:
   - **Root Directory**: `ml_service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python train_model.py`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `AI_SERVICE_API_KEY`: *(Optional)* Secret key matching Node.js backend.
5. Copy the deployed service URL (e.g., `https://sms-ai-prediction.onrender.com`) and paste it into `server/.env` as `FASTAPI_AI_URL`.

---

## 📡 API Endpoints

- `GET /health`: Health and model readiness status.
- `GET /model-info`: Evaluation metrics ($R^2$, MAE, RMSE) and feature importances.
- `POST /predict`: Single student academic trajectory inference.
- `POST /batch-predict`: Batch inference for entire classroom rosters.
