# Generated by Django 5.0.3 on 2024-06-17 20:58

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("management", "0005_question_question_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="choice",
            name="text",
            field=models.CharField(max_length=50),
        ),
    ]
