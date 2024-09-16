from django.contrib import admin
from .models import Progress

class ProgressAdmin(admin.ModelAdmin):
    list_display = ('learner', 'subtopic', 'questions_answered', 'initial_score', 'latest_score', 
                    'last_attempted')
    readonly_fields = ('last_attempted')

# Register your models here.
admin.site.register(Progress)
