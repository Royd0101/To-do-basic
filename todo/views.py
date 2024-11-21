from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import ProjectSerializer, ToDoSerializer
from rest_framework.permissions import IsAuthenticated

class Project(ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
class Todo(ModelViewSet):
    serializer_class = ToDoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.all()
    

def project(request):
    return render(request, 'project/project.html')