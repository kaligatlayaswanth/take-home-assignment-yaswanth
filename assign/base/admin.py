from django.contrib import admin
from .models import FileUpload, TrainedModel, Prediction

# Register your models here.

admin.site.register(FileUpload)
admin.site.register(TrainedModel)
admin.site.register(Prediction)
