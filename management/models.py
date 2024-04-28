from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.utils.text import slugify

# Create all the quiz topics.
class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
        null=True, related_name='created_topics')
    date_modified = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
        null=True, blank=True, related_name='modified_topics')
    is_visible = models.BooleanField(default=True) # topic should be displayed or not
    display_order = models.IntegerField(default=0, blank=False, null=False)

    # create a slug from topic name for URLs
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(Topic, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['display_order', 'id']

# Each quiz topic may have multiple subtopics
class Subtopic(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='subtopics')
    name = models.CharField(max_length=100)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
        null=True, related_name='created_subtopics')
    date_modified = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
        null=True, blank=True, related_name='modified_subtopics')
    is_visible = models.BooleanField(default=True) # whether topic should be displayed or not
    display_order = models.IntegerField(default=0, blank=False, null=False)

    def __str__(self):
        #return f"{self.topic}/{self.name}"
        return self.name
    
    class Meta:
        ordering = ['display_order', 'id']
        unique_together = ('topic', 'name')
