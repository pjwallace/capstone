from django.conf import settings
from django.db import models
from management.models import Subtopic


# Create your models here.
class Progress(models.Model):
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    subtopic = models.ForeignKey(Subtopic, on_delete=models.CASCADE, related_name='progress')
    questions_answered = models.IntegerField(default=0)
    initial_score = models.IntegerField(null=True, blank=True)
    latest_score = models.IntegerField(null=True, blank=True)
    last_attempted = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('learner', 'subtopic')
