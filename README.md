# 📘 Mini AI Analyst as a Service (AaaS) — Othor AI Assignment

This is a take-home assignment for the **Full Stack AI Developer** role at Othor AI. It demonstrates the ability to build an end-to-end AI-powered microservice using Django and machine learning tools. The system enables users to upload business-related CSVs, automatically profile the data, train an AutoML model, and return insights and predictions via API endpoints and a frontend dashboard.

---

## 🚀 Features

* ✅ Upload CSV files (up to 50MB)
* ✅ Automatic schema detection and data profiling
* ✅ Outlier detection, skewness, correlation, and leakage detection
* ✅ AutoML model training (classification or regression)
* ✅ Evaluation metrics and model persistence
* ✅ Natural language summaries and insights
* ✅ Frontend dashboard (React-based or HTML optional)
* ✅ RESTful API for prediction and summary

---

## 🧰 Tech Stack

| Layer      | Tools                                   |
| ---------- | --------------------------------------- |
| Backend    | Django, Django REST Framework           |
| ML         | Pandas, NumPy, Scikit-learn, XGBoost    |
| Storage    | Local file system                       |
| Model IO   | Joblib                                  |
| Frontend   | React.js                                |            

--

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/othor-ai-mini-analyst.git
cd othor-ai-mini-analyst
```

### 2. Create Virtual Environment & Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Apply Migrations

```bash
python manage.py migrate
```

### 4. Create Required Directories

```bash
mkdir models
```

### 5. Run the Server

```bash
python manage.py runserver
```

---

## 🧪 How to Use

### 1. 📤 Upload CSV

**Endpoint:** `POST /api/upload/`
**Content-Type:** `multipart/form-data`

| Field | Type | Description                   |
| ----- | ---- | ----------------------------- |
| file  | File | CSV file to upload (max 50MB) |

**Example:**

```bash
curl -X POST -F "file=@sample.csv" http://localhost:8000/api/upload/
```

**Response:**

```json
{
  "session_id": "e0533047-cea9-4119-85e8-5e90e47db5d1"
}
```

---

### 2. 🧠 Profile the Data

**Endpoint:** `GET /api/profile/<session_id>/`

**Response:**

```json
{
  "session_id": "...",
  "metadata": {
    "columns": [...],
    "row_count": 75,
    "correlations": {...},
    "imbalanced_columns": {...}
  }
}
```

---

### 3. 🧠 Train a Model

**Endpoint:** `POST /api/train/<session_id>/`
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "target_column": "Status"
}
```

**Response:**

```json
{
  "model_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "metrics": {
    "accuracy": 0.85,
    "precision": 0.83,
    "recall": 0.85,
    "f1_score": 0.84
  },
  "feature_importance": {
    "Budget_Spent_M": 0.31,
    "Patent_Applications": 0.21
  }
}
```

---

### 4. 🔮 Predict (Optional - Part 3)

**Endpoint:** `POST /api/predict/<model_id>/`
(You can implement this for Part 3: Inference)

---

### 5. 🗾️ Summary Report (Optional)

**Endpoint:** `GET /api/summary/<model_id>/`
Returns a natural-language summary about the dataset, model, and top predictors.

---

## 🧠 Sample Use Case

* A user uploads a product R\&D dataset.
* The system profiles columns like `Budget`, `Timeline`, and `Status`.
* It trains a classification model to predict project `Status`.
* It returns accuracy and feature importance, and allows making future predictions.

---

## 🧰 Sample CSV Included

Check the `sample_data/` folder for a `sample_projects.csv` file for testing and demo purposes.

---

## ✅ Assumptions

* If no target is provided, system tries to infer based on column name (`status`, `target`, etc.)
* High-cardinality categorical columns (e.g., IDs) are excluded from model training.
* Uses RandomForest as the default model for classification/regression.
* No frontend deployment included, but a React dashboard is under progress (optional).

---

## 🛁 Project Structure

```
mini_ai_analyst/
├── api/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── utils/
│       ├── data_profiling.py
│       └── ml_pipeline.py
├── models/                # trained model storage
├── uploads/               # uploaded CSVs
├── sample_data/           # sample CSVs for testing
├── requirements.txt
├── manage.py
└── README.md
```

---

## 🧟️ Known Limitations

* CSV size limit: 50MB
* Models are stored locally (`models/` folder); replace with S3 in production
* No frontend state sync or model/token UI yet
* Inference endpoints not yet implemented (pending Part 3)

---

## ⏱ Time Taken

| Task                        | Time Estimate |
| --------------------------- | ------------- |
| Part 1: Upload + Profiling  | \~2 hours     |
| Part 2: AutoML + Training   | \~3–4 hours   |
| Part 3: predict and summary | \~1-2 hours   |
| Frontend (optional)         | \~1-2 hours   |
| others + README             | \~1 hour      |
 approx 10 - 11

---

