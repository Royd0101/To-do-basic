from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):

    def create_user(self, first_name, last_name, email, password=None):
        if not email:
            raise ValueError("The Email field must be set")
        if not first_name or not last_name:
            raise ValueError("The First Name and Last Name fields must be set")
        
        email = self.normalize_email(email)

        user = self.model(
            first_name=first_name,
            last_name=last_name,
            email=self.normalize_email(email),
        )
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, first_name, last_name, email, password):
        user = self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=self.normalize_email(email),
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user