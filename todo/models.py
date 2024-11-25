from django.db import models
from django.conf import settings


class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_projects"
    )
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ToDo(models.Model):
    STATUS_CHOICES = [
        ('free-field', 'Free Field'),
        ('ongoing', 'Ongoing'),
        ('under-review', 'Under Review'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('revised', 'Revised'),
    ]

    CRITICAL_CHOICES = [
        ('normal', 'Normal'),
        ('priority', 'Priority'),
        ('urgent', 'Urgent'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="todos")
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assigned_todos"
    )
    points = models.PositiveIntegerField(default=0)
    critical = models.CharField(max_length=10, choices=CRITICAL_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='free-field')
    date_created = models.DateTimeField(auto_now_add=True)
    date_end = models.DateTimeField(null=True, blank=True)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name="sub_todos"
    )

    def __str__(self):
        return self.title
