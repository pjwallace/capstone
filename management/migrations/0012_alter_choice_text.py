# Generated by Django 5.0.3 on 2025-01-30 04:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("management", "0011_alter_question_text"),
    ]

    operations = [
        migrations.AlterField(
            model_name="choice",
            name="text",
            field=models.TextField(),
        ),
    ]
