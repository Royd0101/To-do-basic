from rest_framework import serializers
from .models import Project, ToDo
from user.models import User
from user.serializers import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description']


class ToDoSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True) 
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='assigned_to', write_only=True
    )
    sub_todos = serializers.SerializerMethodField()

    class Meta:
        model = ToDo
        fields = '__all__'

    def get_sub_todos(self, obj):
        sub_todos = obj.sub_todos.all()
        return ToDoSerializer(sub_todos, many=True).data
