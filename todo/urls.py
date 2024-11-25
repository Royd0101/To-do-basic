from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, ProjectViewSet
from . import views

router = DefaultRouter()
router.register(r'project', ProjectViewSet, basename='project')
router.register(r'todo', TodoViewSet, basename='todo')
urlpatterns = [
    path('api/', include(router.urls)),
    path('project/', views.project, name='project'),
    path('todo/', views.todo, name='todo'),
    path('projects/<int:project_id>/', views.project_details, name='project_details'),
]
