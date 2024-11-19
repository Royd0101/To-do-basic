from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Users, user

router = DefaultRouter()
router.register(r'user', Users, basename='user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('user/', user, name='user'),
]
