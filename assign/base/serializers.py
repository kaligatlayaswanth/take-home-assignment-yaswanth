from rest_framework import serializers
from .models import FileUpload, TrainedModel, Prediction

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ['session_id', 'file']

class ProfileSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    metadata = serializers.JSONField()

class TrainModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainedModel
        fields = ['model_id', 'metrics', 'feature_importance']

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ['prediction_id', 'predictions']