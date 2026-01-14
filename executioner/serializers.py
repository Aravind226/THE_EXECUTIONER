# judge/serializers.py
from rest_framework import serializers

class SubmissionSerializer(serializers.Serializer):
    source_code = serializers.CharField(min_length=1, max_length=10000)
    # Future: We could add 'language' here later (e.g., 'python', 'cpp')