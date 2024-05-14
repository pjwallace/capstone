from django.contrib import admin
from .models import Topic, Subtopic, Question, Choice, Explanation

class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'date_created', 'created_by', 'date_modified', 
                    'modified_by', 'is_visible', 'display_order')
    readonly_fields = ('date_created', 'date_modified')

class SubtopicAdmin(admin.ModelAdmin):
    list_display = ('topic', 'name', 'date_created', 'created_by', 'date_modified', 
                    'modified_by', 'is_visible', 'display_order')
    readonly_fields = ('date_created', 'date_modified')

# Register your models here.
admin.site.register(Topic, TopicAdmin)
admin.site.register(Subtopic, SubtopicAdmin)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(Explanation)
