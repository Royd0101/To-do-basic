from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Todo, Project, project

router = DefaultRouter()
router.register(r'project', Project, basename='project')
router.register(r'todo', Todo, basename='todo')
urlpatterns = [
    path('api/', include(router.urls)),
    path('project/', project, name='project'),

]
