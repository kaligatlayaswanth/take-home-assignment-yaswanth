from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FileUpload, TrainedModel, Prediction
from .serializers import FileUploadSerializer, ProfileSerializer, TrainModelSerializer, PredictionSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .utils.data_profiling import infer_schema_and_metadata
from .utils.ml_pipeline import train_model, predict
import pandas as pd
import os

class UploadFileView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        serializer = FileUploadSerializer(data=request.data)
        
        if serializer.is_valid():
            file_obj = serializer.save()
            try:
                # Infer schema and metadata
                file_path = file_obj.file.path
                metadata = infer_schema_and_metadata(file_path)
                file_obj.metadata = metadata
                file_obj.save()
                
                return Response({'session_id': str(file_obj.session_id)}, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                file_obj.delete()
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileDataView(APIView):
    def get(self, request, session_id):
        try:
            file_obj = FileUpload.objects.get(session_id=session_id)
            serializer = ProfileSerializer({'session_id': file_obj.session_id, 'metadata': file_obj.metadata})
            return Response(serializer.data)
        except FileUpload.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

class TrainModelView(APIView):
    def post(self, request, session_id):
        try:
            file_obj = FileUpload.objects.get(session_id=session_id)
            target_column = request.data.get('target_column', None)
            
            # Train model
            model_path, metrics, feature_importance, preprocessing_steps = train_model(file_obj.file.path, target_column)
            
            # Save model metadata
            trained_model = TrainedModel.objects.create(
                session=file_obj,
                model_path=model_path,
                target_column=target_column or 'inferred',
                metrics=metrics,
                feature_importance=feature_importance,
                preprocessing_steps=preprocessing_steps
            )
            
            serializer = TrainModelSerializer(trained_model)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except FileUpload.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PredictView(APIView):
    def post(self, request, model_id):
        try:
            model_obj = TrainedModel.objects.get(model_id=model_id)
            input_data = request.data.get('input_data')
            if not input_data:
                return Response({'error': 'No input data provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle JSON or CSV input
            if isinstance(input_data, list):
                df = pd.DataFrame(input_data)
            elif isinstance(input_data, dict):
                df = pd.DataFrame([input_data])
            else:
                return Response({'error': 'Input data must be a JSON object or array'}, status=status.HTTP_400_BAD_REQUEST)
            
            predictions = predict(model_obj.model_path, model_obj.preprocessing_steps, df)
            prediction_obj = Prediction.objects.create(
                model=model_obj,
                input_data=input_data,
                predictions=predictions
            )
            serializer = PredictionSerializer(prediction_obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TrainedModel.DoesNotExist:
            return Response({'error': 'Model not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SummaryView(APIView):
    def get(self, request, model_id):
        try:
            model_obj = TrainedModel.objects.get(model_id=model_id)
            session = model_obj.session
            metadata = session.metadata
            feature_importance = model_obj.feature_importance
            target_column = model_obj.target_column
            
            # Generate insights
            insights = []
            
            # Insight 1: Top features driving the target
            top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]
            insights.append({
                "insight": f"Key drivers of {target_column}",
                "details": f"The top features influencing {target_column} are: {', '.join([f'{k} ({v:.3f})' for k, v in top_features])}. Focus on optimizing these factors to improve outcomes."
            })
            
            # Insight 2: High importance features
            high_importance_features = [(k, v) for k, v in feature_importance.items() if v > 0.1]
            if high_importance_features:
                insights.append({
                    "insight": "High impact features identified",
                    "details": f"Features with high importance (>0.1): {', '.join([f'{k} ({v:.3f})' for k, v in high_importance_features])}. These are critical for accurate predictions."
                })
            
            # Insight 3: Feature importance distribution
            if len(feature_importance) > 5:
                insights.append({
                    "insight": "Feature importance analysis",
                    "details": f"Model analyzed {len(feature_importance)} features. The top 3 features account for {sum([v for k, v in top_features]):.1%} of the total importance."
                })
            
            # Insight 4: Model performance context
            if hasattr(model_obj, 'metrics'):
                metrics = model_obj.metrics
                if 'accuracy' in metrics:
                    insights.append({
                        "insight": "Model performance",
                        "details": f"Model accuracy: {metrics['accuracy']:.3f}. This indicates how well the model predicts {target_column}."
                    })
                elif 'r2' in metrics:
                    insights.append({
                        "insight": "Model performance",
                        "details": f"Model R² score: {metrics['r2']:.3f}. This indicates how well the model explains the variance in {target_column}."
                    })
            
            return Response({"model_id": model_id, "insights": insights}, status=status.HTTP_200_OK)
        except TrainedModel.DoesNotExist:
            return Response({'error': 'Model not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)