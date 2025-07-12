import pandas as pd
import numpy as np
from scipy import stats
import os

def infer_schema_and_metadata(file_path):s
    chunk_size = 1000
    df_chunks = pd.read_csv(file_path, chunksize=chunk_size)
    df_list = []
    
    for chunk in df_chunks:
        df_list.append(chunk)
        if len(df_list) * chunk_size >= 10000:  
            break
    
    df = pd.concat(df_list, ignore_index=True)
    
    schema = {
        'columns': [],
        'row_count': len(df),
    }
    
    for col in df.columns:
        col_info = {
            'name': col,
            'type': infer_column_type(df[col]),
            'unique_count': df[col].nunique(),
            'null_percentage': df[col].isna().mean() * 100,
            'is_high_cardinality': df[col].nunique() > len(df) * 0.5,
            'is_constant': df[col].nunique() == 1,
        }
        

        if col_info['type'] in ['numerical', 'integer']:
            col_info['outliers'] = detect_outliers(df[col])
            col_info['skewness'] = float(df[col].skew()) if not df[col].isna().all() else None
        
        schema['columns'].append(col_info)
    
    numerical_cols = [col['name'] for col in schema['columns'] if col['type'] in ['numerical', 'integer']]
    if numerical_cols:
        corr_matrix = df[numerical_cols].corr().to_dict()
        schema['correlations'] = {col: {k: float(v) for k, v in corr.items()} for col, corr in corr_matrix.items()}
    
    categorical_cols = [col['name'] for col in schema['columns'] if col['type'] == 'categorical']
    schema['imbalanced_columns'] = {}
    for col in categorical_cols:
        value_counts = df[col].value_counts(normalize=True)
        if value_counts.max() > 0.9: 
            schema['imbalanced_columns'][col] = value_counts.to_dict()
    
    target_candidates = [col for col in df.columns if col.lower() in ['target', 'label', 'churn']]
    if target_candidates:
        target = target_candidates[0]
        correlations = df.corr()[target].to_dict() if target in numerical_cols else {}
        schema['potential_leakage'] = {col: float(corr) for col, corr in correlations.items() if abs(corr) > 0.8 and col != target}
    
    return schema

def infer_column_type(series):
    try:
        if pd.to_numeric(series, errors='coerce').notna().all():
            if series.dtype in ['int64', 'int32']:
                return 'integer'
            return 'numerical'
        if pd.to_datetime(series, errors='coerce').notna().all():
            return 'datetime'
        unique_vals = series.dropna().unique()
        if set(unique_vals).issubset({True, False, 0, 1, 'True', 'False'}):
            return 'boolean'
        return 'categorical'
    except:
        return 'categorical'

def detect_outliers(series):
    if series.dtype not in ['int64', 'float64']:
        return []
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = series[(series < lower_bound) | (series > upper_bound)].dropna().tolist()
    return outliers[:10] 