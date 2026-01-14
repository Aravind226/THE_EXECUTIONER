# judge/urls.py
from django.urls import path
from .views import ExecuteView, StatusView

urlpatterns = [
    path('execute/', ExecuteView.as_view(), name='execute'),
    path('status/<str:task_id>/', StatusView.as_view(), name='status'),
]