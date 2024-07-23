# Generated by Django 5.0.3 on 2024-07-05 23:17

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("management", "0007_alter_choice_text"),
    ]

    operations = [
        migrations.AlterField(
            model_name="subtopic",
            name="name",
            field=models.CharField(max_length=30),
        ),
        migrations.AlterField(
            model_name="topic",
            name="name",
            field=models.CharField(max_length=30, unique=True),
        ),
        migrations.AlterField(
            model_name="topic",
            name="slug",
            field=models.SlugField(blank=True, unique=True),
        ),
    ]