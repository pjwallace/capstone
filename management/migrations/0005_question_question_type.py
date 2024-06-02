# Generated by Django 5.0.3 on 2024-06-02 03:54

import django.db.models.deletion
import management.models
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("management", "0004_questiontype"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="question_type",
            field=models.ForeignKey(
                default=management.models.get_default_question_type,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="questions",
                to="management.questiontype",
            ),
        ),
    ]
