from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import UserSerializer, LoginSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as django_login

class Users(ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.all()

@login_required
def user(request):
    return render(request, 'user/user.html')

@login_required
def index(request):
    return render(request, 'user/index.html')


@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        django_login(request, user)
        
        return Response({
            'token': token.key,
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def login(request):
    return render(request, 'user/login.html')