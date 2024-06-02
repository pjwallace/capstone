from django.contrib import admin
from .models import Topic, Subtopic, Question, Choice, Explanation, QuestionType

class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'date_created', 'created_by', 'date_modified', 
                    'modified_by', 'is_visible', 'display_order')
    readonly_fields = ('date_created', 'date_modified')

class SubtopicAdmin(admin.ModelAdmin):
    list_display = ('topic', 'name', 'date_created', 'created_by', 'date_modified', 
                    'modified_by', 'is_visible', 'display_order')
    readonly_fields = ('date_created', 'date_modified')

class QuestionTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'subtopic', 'question_type', 'created_by', 'date_created')
    search_fields = ('text',)
    list_filter = ('subtopic', 'question_type', 'date_created')
    

# Register your models here.
admin.site.register(Topic, TopicAdmin)
admin.site.register(Subtopic, SubtopicAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Choice)
admin.site.register(Explanation)
admin.site.register(QuestionType, QuestionTypeAdmin)
