from django.contrib import admin
from .models import Project, ToDo

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'date_created')
    search_fields = ('name', 'created_by__email')

@admin.register(ToDo)
class ToDoAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assigned_to', 'critical', 'points', 'date_end')
    search_fields = ('title', 'project__name', 'assigned_to__email')
    list_filter = ('critical', 'date_end')
