from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, user, index, login_view, login
from django.shortcuts import redirect

router = DefaultRouter()
router.register(r'user', UserViewSet, basename='user')

urlpatterns = [
    path('', lambda request: redirect('login'), name='root'),
    path('api/', include(router.urls)),
    path('user/', user, name='user'),
    path('index/', index, name='index'),
    path('api/login/', login_view, name='api_login'),
    path('login/', login, name='login'),
]
