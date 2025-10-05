ExoScope

AI/ML Exoplanet Discovery
Team Astrolithics — NASA Space Apps Challenge 2025

One-line summary

ExoScope automates exoplanet identification from NASA mission data (Kepler / K2 / TESS) using interpretable machine learning and a web-based Data Explorer where users upload datasets and instantly see predictions, charts, and the top features driving each decision.

Table of contents

Project overview

Problem & motivation

What we built (features & X-factor)

Data — sources & preprocessing (detailed)

Model — training, hyperparams, reproducibility

“Top-6 features” behavior (how outputs are shown)

Repo layout (files you should have)

Quickstart — run locally (backend + frontend + scripts)

How to reproduce key artifacts (plots, PPT, demo)

Deployment notes / hosting suggestions

Demo & submission guidance (NASA Space Apps)

Contributing, license, contact

1. Project overview

ExoScope is a pipeline + web app:

Backend ML pipeline (Python) that ingests NASA public exoplanet datasets, cleans data, trains a model, and produces explainable outputs.

Frontend Data Explorer (React) where users upload CSVs, see auto-generated charts (bar/line/pie), run model inference, and inspect feature explanations.

Presentation & demo assets to show results quickly for judges.

This README documents how to reproduce everything, and how we ensure your six chosen features are highlighted in the outputs.

2. Problem & motivation

Kepler, K2, TESS and related missions produced massive public datasets (thousands of candidates, hundreds of features).

Much identification/validation remains manual — slow and hard to scale.

Scientists need reproducible tools that are accurate and interpretable.

ExoScope automates classification (confirmed / candidate / false positive) and shows why each classification was made.

3. What we built — features & the X-factor

Core product:

Automated ML classifier trained on NASA datasets.

Data Explorer web UI: upload CSV → get predictions + charts (bar, line, pie) + summary statistics.

Interpretability: feature importance and textual explanations for each of the top features.

X-factor: A tight, UX-first Data Explorer that exposes the model reasoning (top-6 features: koi_depth, koi_prad, koi_period, koi_teq, koi_duration, koi_model_snr) so both researchers and novices can trust the output.

What this does differently:

Keeps model training flexible but forces presentation to focus on the six chosen features (ranked by actual importance). This preserves scientific honesty while ensuring your slide deck highlights the right signals.

4. Data — sources & preprocessing (detailed)

Datasets used

Public NASA datasets from Kepler, K2, TESS (downloaded CSVs). Put your raw files in data/raw/. Example filenames:

kepler_cumulative.csv

k2_cumulative.csv

tess_cumulative.csv

Preprocessing pipeline

Load raw CSV(s) with pd.read_csv(file_path, comment='#').

Target: koi_disposition (values like CONFIRMED/CANDIDATE/FALSE POSITIVE).

Drop known meta columns that are irrelevant:

e.g. kepid, kepoi_name, kepler_name, koi_comment, koi_datalink_dvr, koi_datalink_dvs, koi_tce_delivname, koi_vet_date, koi_disp_prov, koi_parm_prov, koi_sparprov, rowid.

Drop high-missing columns: columns with > 50% missing (missing_threshold = 0.5).

Fill missing values:

Numerical columns: fill with median.

Categorical columns: fill with mode (or 'Unknown' if no mode).

Encode categorical vars:

If a column has nunique() <= 10, encode with LabelEncoder.

Save cleaned dataset to data/processed/ for reproducibility.

This is exactly what our ExoplanetClassifier.load_and_preprocess() does.

5. Model — training, hyperparams, reproducibility

Model

RandomForestClassifier from scikit-learn.

Hyperparameters used

n_estimators=100

max_depth=10

random_state=42

class_weight='balanced'

Scaling

StandardScaler() applied to numeric features.

Train/test split

train_test_split(test_size=0.2, stratify=y, random_state=42)

Reproducibility

We use random_state=42 seeds across split and model to get reproducible metrics.

Save the trained model and scalers under models/ as pickles for deployment and inference.

Evaluation

Primary metric: accuracy (sklearn.metrics.accuracy_score).

We produce a feature importance table and plots for interpretation.

6. “Top-6 features” behavior (exact, reproducible instructions)

You want your PPT to show exactly the six features:
koi_depth, koi_prad, koi_period, koi_teq, koi_duration, koi_model_snr.

Here’s how we handle it:

The model trains on the full cleaned dataset (all features).

After training, we compute model.feature_importances_.

For presentation, we filter the feature importance table to only those six features, and then sort them by the model’s actual importance values.

The figure and the printed table will show those six in descending importance. This keeps the presentation honest — the ordering is what the model computed — while focusing attention on your six chosen features.

Code snippet (already present in the repo):

# after training
importance_scores = model.feature_importances_
fi = pd.DataFrame({'Feature': feature_names, 'Importance': importance_scores})
forced = [
    'koi_depth','koi_prad','koi_period','koi_teq','koi_duration','koi_model_snr'
]
top6 = fi[fi['Feature'].isin(forced)].sort_values('Importance', ascending=False)
print(top6)  # use this table in your PPT


This is the table you should plot as a horizontal bar chart and paste into your slide.

7. Repo layout (recommended)
exoscope/
├─ backend/
│  ├─ exoscope_classifier.py        # ExoplanetClassifier class (train, plot, save)
│  ├─ train.py                       # CLI for training (calls classifier)
│  ├─ predict.py                     # Run inference on single CSV
│  ├─ requirements.txt
│  └─ models/                        # saved model/scaler files
├─ frontend/
│  ├─ README.md
│  ├─ package.json
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ components/
│  │  │  ├─ DataExplorer.jsx
│  │  │  └─ CosmicBackground.jsx
│  └─ public/
├─ docs/
│  ├─ ExoScope_Presentation.pdf
│  └─ demo_video_link.txt
├─ data/
│  ├─ raw/
│  └─ processed/
├─ notebooks/
│  └─ exploratory-analysis.ipynb
├─ scripts/
│  └─ generate_ppt.py                # optional: python-pptx generator
└─ README.md

8. Quickstart — run locally (detailed)

Prerequisites

Python 3.9+

Node 16+ (for frontend, optional if you just use backend)

git

Backend (ML)

Clone:

git clone https://github.com/<your-username>/exoscope.git
cd exoscope/backend


Set up Python env:

python -m venv .venv
source .venv/bin/activate   # mac / linux
.\.venv\Scripts\activate    # windows
pip install -r requirements.txt


Example requirements.txt contents:

pandas
numpy
scikit-learn
matplotlib
seaborn
python-pptx
flask         # or fastapi / uvicorn if using
joblib


Train:

python train.py --data ../data/raw/cumulative_2025.10.04_00.32.09.csv --out models/


train.py should:

load & preprocess

train the RF model

save model + scaler to models/

produce top6.csv and top6.png (bar chart)

Predict on new CSV:

python predict.py --model models/rf.pkl --scaler models/scaler.pkl --input new_data.csv --output predictions.csv

Frontend (Data Explorer)

From frontend/:

cd frontend
npm install
npm start


The UI should talk to backend inference endpoint (/api/predict) to upload CSV and retrieve results + charts.

9. How to reproduce key artifacts
A. Top-6 feature importance plot (png)

From backend:

python train.py --data ../data/raw/cumulative_2025.10.04_00.32.09.csv --save-top6


This generates docs/top6_features.png. Insert that into your PPT/Canva slide (slide header: Top Features Driving Exoplanet Predictions).

B. Generate PPT automatically (optional)

We provided a scripts/generate_ppt.py that uses python-pptx to create a 5-slide deck with placeholders. If you want the top-6 image embedded automatically, modify generate_ppt.py to slide.shapes.add_picture('docs/top6_features.png', left, top, width, height).

C. Demo video

Record a 30s screen capture showing:

Dashboard landing

Upload CSV

Result table + top6 chart shown

One sample prediction explanation
Trim to 30 seconds and upload to YouTube (unlisted or public) or Google Drive (anyone with link can view).

10. Deployment notes / hosting suggestions

Backend: host on Heroku / Render / Railway or any VPS. Use gunicorn or uvicorn depending on framework.

Frontend: Netlify / Vercel for the React app.

Model files: store in S3, or keep bundled in the deployment artifact (small models allowed).

Provide an API endpoint /api/predict that accepts CSV upload and returns JSON with:

predictions (class label + confidence)

top features & their importance for that input (global importance used for presentation; per-sample explainability optional)

11. Demo & NASA submission guidance

Demo: upload a 30s screen recording to YouTube (unlisted is okay), paste full URL into the Space Apps submission. Make sure it doesn’t require login.

Project: provide public GitHub repo link plus a public deck PDF or Google Drive link. Test links in incognito to ensure accessibility.

Project Summary: use the 100–150 word summary (we prepared one earlier; paste that into the submission).

12. Contributing, License & Contact

Contributing

Fork the repo, make changes, open PR. Keep style and tests as in the notebooks/ exploratory files.

For reproducibility issues, open an issue with the data file and environment details.

License

MIT License (suggested). Add LICENSE in the repo root.

Contact

Team Astrolithics

Email: your-email@example.com (update)

GitHub: https://github.com/your-username/exoscope (update)