# judge/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from celery.result import AsyncResult
from .serializers import SubmissionSerializer
from .tasks import execute_code

class ExecuteView(APIView):
    def post(self, request):
        serializer = SubmissionSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data['source_code']
            
            # Trigger the Celery Task
            # .delay() returns a Task Object immediately
            task = execute_code.delay(code)
            
            return Response({
                "task_id": task.id,
                "status": "Processing",
                "message": "Code submitted successfully."
            }, status=202) # 202 Accepted
            
        return Response(serializer.errors, status=400)

class StatusView(APIView):
    def get(self, request, task_id):
        # Check the status of the task in Redis
        task_result = AsyncResult(task_id)
        
        response_data = {
            "task_id": task_id,
            "status": task_result.status, # PENDING, STARTED, SUCCESS, FAILURE
        }

        # If finished, include the result
        if task_result.ready():
            response_data["result"] = task_result.result
            
        return Response(response_data)