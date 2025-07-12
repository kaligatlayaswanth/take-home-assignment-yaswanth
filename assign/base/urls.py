from django.urls import path
from .views import UploadFileView, ProfileDataView, TrainModelView, PredictView, SummaryView

urlpatterns = [
    path('upload/', UploadFileView.as_view(), name='upload'),
    path('profile/<str:session_id>/', ProfileDataView.as_view(), name='profile'),

    path('train/<str:session_id>/', TrainModelView.as_view(), name='train'),

    path('predict/<str:model_id>/', PredictView.as_view(), name='predict'),
    path('summary/<str:model_id>/', SummaryView.as_view(), name='summary'),
]