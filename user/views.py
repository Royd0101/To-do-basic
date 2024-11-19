from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import UserSerializer


class Users(ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.all()
    
def user(request):
    return render(request, 'user/user.html')