from rest_framework import serializers
from .models import User
from django.db import transaction

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False)
    class Meta:
        model = User
        fields = '__all__'


    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password) 
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
