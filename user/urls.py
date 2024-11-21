from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Users, user, index, login_view, login

router = DefaultRouter()
router.register(r'user', Users, basename='user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('user/', user, name='user'),
    path('index/', index, name='index'),
    path('api/login/', login_view, name='api_login'),
    path('login/', login, name='login'),
]
