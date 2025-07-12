import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error, r2_score
import joblib
import os
import uuid

def train_model(file_path, target_column=None):
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise ValueError(f"Failed to read CSV file: {str(e)}")
    
    df.columns = [col.lower() for col in df.columns]
    if target_column:
        target_column = target_column.lower()
    
    if not target_column:
        target_candidates = [col for col in df.columns if col.lower() in ['target', 'label', 'churn', 'status']]
        if target_candidates:
            target_column = target_candidates[0]
        else:
            raise ValueError("No target column specified and none inferred (tried 'target', 'label', 'churn', 'status')")
    
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset. Available columns: {list(df.columns)}")
    
    high_cardinality_cols = [col for col in df.columns if df[col].dtype == 'object' and df[col].nunique() > 0.5 * len(df)]
    features = [col for col in df.columns if col != target_column and col not in high_cardinality_cols]
    
    X = df[features]
    y = df[target_column]
    
    for col in X.columns:
        if pd.api.types.is_datetime64_any_dtype(X[col]):
            X[col + '_year'] = X[col].dt.year
            X[col + '_month'] = X[col].dt.month
            X = X.drop(columns=[col])
    
    numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = [col for col in X.select_dtypes(include=['object']).columns]
    
    if numerical_cols.size:
        num_imputer = SimpleImputer(strategy='mean')
        X[numerical_cols] = num_imputer.fit_transform(X[numerical_cols])
    
    if categorical_cols:
        cat_imputer = SimpleImputer(strategy='constant', fill_value='missing')
        X[categorical_cols] = cat_imputer.fit_transform(X[categorical_cols])
    
    if categorical_cols:
        try:
            encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
            encoded_cats = encoder.fit_transform(X[categorical_cols])
            encoded_cols = encoder.get_feature_names_out(categorical_cols)
            X_encoded = pd.DataFrame(encoded_cats, columns=encoded_cols, index=X.index)
            X = pd.concat([X[numerical_cols], X_encoded], axis=1)
        except Exception as e:
            raise ValueError(f"Error encoding categorical columns: {str(e)}")
    else:
        X = X[numerical_cols]
    
    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    except Exception as e:
        raise ValueError(f"Error splitting data: {str(e)}")
    
    is_classification = df[target_column].dtype in ['object', 'category'] or df[target_column].nunique() < 10
    if is_classification:
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        metrics = {
            'accuracy': float(accuracy_score(y_test, y_pred)),
            'precision': float(precision_score(y_test, y_pred, average='weighted', zero_division=0)),
            'recall': float(recall_score(y_test, y_pred, average='weighted', zero_division=0)),
            'f1_score': float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        }
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        metrics = {
            'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
            'r2': float(r2_score(y_test, y_pred))
        }
    
    feature_importance = {col: float(imp) for col, imp in zip(X.columns, model.feature_importances_)}
    
    model_path = f'models/model_{uuid.uuid4()}.joblib'
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, model_path)
    
    preprocessing_steps = {
        'numerical_cols': list(numerical_cols),
        'categorical_cols': list(categorical_cols),
        'encoded_cols': list(encoded_cols) if categorical_cols else [],
        'num_imputer_strategy': 'mean',
        'cat_imputer_strategy': 'constant',
        'encoder': joblib.dump(encoder, model_path.replace('.joblib', '_encoder.joblib')) if categorical_cols else None,
        'target_column': target_column,
        'training_features': list(X.columns)
    }
    
    return model_path, metrics, feature_importance, preprocessing_steps

import pandas as pd
import joblib
from sklearn.impute import SimpleImputer

def predict(model_path, preprocessing_steps, input_data):
    try:
        model = joblib.load(model_path)
    except Exception as e:
        raise ValueError(f"Failed to load model: {str(e)}")
    
    # Convert input_data to DataFrame
    if isinstance(input_data, dict):
        df = pd.DataFrame([input_data])
    elif isinstance(input_data, pd.DataFrame):
        df = input_data
    else:
        raise ValueError("Input data must be a dictionary or DataFrame")
    
    # Normalize column names to lowercase
    df.columns = [col.lower() for col in df.columns]
    
    target_column = preprocessing_steps.get('target_column', None)
    
    # Raw features expected (numerical + categorical)
    numerical_cols = preprocessing_steps.get('numerical_cols', [])
    categorical_cols = preprocessing_steps.get('categorical_cols', [])
    
    raw_features = numerical_cols + categorical_cols
    if target_column and target_column in raw_features:
        raw_features.remove(target_column)
    
    # Keep only raw_features columns, fill missing ones with 0
    for col in raw_features:
        if col not in df.columns:
            df[col] = 0
    df = df[raw_features]
    
    # Re-evaluate column types based on current data to avoid type mismatches
    current_numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    current_categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    # Only apply numerical imputation to columns that are actually numerical in current data
    existing_num_cols = [col for col in numerical_cols if col in current_numerical_cols]
    if existing_num_cols:
        num_imputer = SimpleImputer(strategy=preprocessing_steps.get('num_imputer_strategy', 'mean'))
        df[existing_num_cols] = num_imputer.fit_transform(df[existing_num_cols])
    
    # Only apply categorical imputation to columns that are actually categorical in current data
    existing_cat_cols = [col for col in categorical_cols if col in current_categorical_cols]
    if existing_cat_cols:
        cat_imputer = SimpleImputer(strategy=preprocessing_steps.get('cat_imputer_strategy', 'constant'), fill_value='missing')
        df[existing_cat_cols] = cat_imputer.fit_transform(df[existing_cat_cols])
    
    # Encode categorical columns if present and if encoder exists
    if existing_cat_cols:
        encoder_path = model_path.replace('.joblib', '_encoder.joblib')
        try:
            encoder = joblib.load(encoder_path)
            encoded_cats = encoder.transform(df[existing_cat_cols])
            encoded_cols = preprocessing_steps.get('encoded_cols', [])
            df_encoded = pd.DataFrame(encoded_cats, columns=encoded_cols, index=df.index)
            df = pd.concat([df[existing_num_cols], df_encoded], axis=1)
        except Exception as e:
            raise ValueError(f"Error loading or applying encoder: {str(e)}")
    else:
        df = df[existing_num_cols]
    
    # Ensure all expected columns are present, fill missing with 0
    expected_cols = preprocessing_steps.get('training_features', list(df.columns))
    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0
    df = df[expected_cols]
    
    # Predict
    try:
        predictions = model.predict(df)
        return predictions.tolist()
    except Exception as e:
        raise ValueError(f"Error making predictions: {str(e)}")
