# Generated by Django 5.0.3 on 2024-06-01 19:16

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("management", "0003_question_explanation_choice"),
    ]

    operations = [
        migrations.CreateModel(
            name="QuestionType",
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
                ("name", models.CharField(max_length=25, unique=True)),
            ],
        ),
    ]
