# Generated by Django 5.0.3 on 2024-09-16 01:32

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("management", "0010_alter_subtopic_name"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Progress",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("questions_answered", models.IntegerField(default=0)),
                ("initial_score", models.IntegerField(blank=True, null=True)),
                ("latest_score", models.IntegerField(blank=True, null=True)),
                ("last_attempted", models.DateTimeField(auto_now=True)),
                (
                    "learner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="progress",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "subtopic",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="progress",
                        to="management.subtopic",
                    ),
                ),
            ],
            options={
                "unique_together": {("learner", "subtopic")},
            },
        ),
    ]