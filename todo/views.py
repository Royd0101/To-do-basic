from django.shortcuts import render, get_object_or_404
from rest_framework.viewsets import ModelViewSet
from .serializers import ProjectSerializer, ToDoSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import ToDo, Project
from rest_framework.response import Response
from user.models import User
from rest_framework.exceptions import ValidationError

class ProjectViewSet(ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
class TodoViewSet(ModelViewSet):
    serializer_class = ToDoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return ToDo.objects.all()

        project_id = self.request.query_params.get('project')
        if project_id:
            return ToDo.objects.filter(project_id=project_id, parent=None)
        return ToDo.objects.filter(parent=None)


    def perform_create(self, serializer):
        parent_id = self.request.data.get('parent_id', None)
        date_end = self.request.data.get("date_end", None)
        if parent_id:
            try:
                parent = ToDo.objects.get(id=parent_id)
                serializer.save(parent=parent)
            except ToDo.DoesNotExist:
                raise ValidationError({"parent_id": "Invalid parent ID."})
        else:
            serializer.save()

    def perform_update(self, serializer):
        parent_todo = serializer.save()  # Save the parent ToDo

        # Recursive function to update sub-todos
        def update_sub_todos(todo, new_status):
            sub_todos = todo.sub_todos.all()
            updated_subs = []
            for sub_todo in sub_todos:
                sub_todo.status = new_status
                sub_todo.save()
                updated_subs.append(sub_todo)
                updated_subs.extend(update_sub_todos(sub_todo, new_status))  # Recursively update deeper sub-todos
            return updated_subs

        # Update sub-tasks if the status field is updated
        updated_sub_todos = []
        if 'status' in self.request.data:
            new_status = self.request.data['status']
            updated_sub_todos = update_sub_todos(parent_todo, new_status)

        # Return the parent and all updated sub-tasks in the response
        all_updated_todos = [parent_todo] + updated_sub_todos
        serializer = self.get_serializer(all_updated_todos, many=True)
        return Response(serializer.data)


    def retrieve(self, request, pk=None):
        try:
            todo = ToDo.objects.get(pk=pk)
            serializer = self.get_serializer(todo)
            return Response(serializer.data)
        except ToDo.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

    def get_sub_todos(self, obj):
        sub_todos = obj.sub_todos.all()
        return ToDoSerializer(sub_todos, many=True).data

    @action(detail=False, methods=['get'])
    def my_todos(self, request):
        todos = ToDo.objects.filter(assigned_to=request.user)
        serializer = self.get_serializer(todos, many=True)
        return Response(serializer.data)
    

    @action(detail=True, methods=['post'])
    def create_sub_todo(self, request, pk=None):
        parent_todo = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(parent=parent_todo)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


def project_details(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    users = User.objects.all() 
    return render(request, 'todo/todo.html', {'project': project, 'users': users})

def project(request):
    return render(request, 'project/project.html')


def todo(request):
    return render(request, 'todo/todo.html')
