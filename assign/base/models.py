from django.db import models
import uuid

class FileUpload(models.Model):
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    file = models.FileField(upload_to='uploads/')
    metadata = models.JSONField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.session_id)


class TrainedModel(models.Model):
    model_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    session = models.ForeignKey(FileUpload, on_delete=models.CASCADE, related_name='models')
    model_path = models.CharField(max_length=1000)
    target_column = models.CharField(max_length=255)
    metrics = models.JSONField()
    feature_importance = models.JSONField(null=True, blank=True)
    preprocessing_steps = models.JSONField(null=True, blank=True)  # Store encoder details
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.model_id)

class Prediction(models.Model):
    prediction_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    model = models.ForeignKey(TrainedModel, on_delete=models.CASCADE, related_name='predictions')
    input_data = models.JSONField()
    predictions = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.prediction_id)