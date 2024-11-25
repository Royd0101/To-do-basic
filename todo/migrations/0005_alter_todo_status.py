# Generated by Django 5.1.3 on 2024-11-25 05:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0004_delete_kanbanpreference'),
    ]

    operations = [
        migrations.AlterField(
            model_name='todo',
            name='status',
            field=models.CharField(choices=[('free-field', 'Free Field'), ('ongoing', 'Ongoing'), ('under-review', 'Under Review'), ('completed', 'Completed'), ('rejected', 'Rejected'), ('revised', 'Revised')], default='free-field', max_length=20),
        ),
    ]
