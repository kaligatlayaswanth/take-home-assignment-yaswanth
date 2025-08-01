# Generated by Django 5.2.4 on 2025-07-11 09:27

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fileupload',
            name='file',
            field=models.FileField(upload_to='uploads/'),
        ),
        migrations.CreateModel(
            name='TrainedModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model_id', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('model_path', models.CharField(max_length=1000)),
                ('target_column', models.CharField(max_length=255)),
                ('metrics', models.JSONField()),
                ('feature_importance', models.JSONField(blank=True, null=True)),
                ('preprocessing_steps', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='models', to='base.fileupload')),
            ],
        ),
    ]
