from django import forms
from django.core.exceptions import ValidationError
from management.models import Topic, Subtopic

class AddTopicForm(forms.ModelForm):
    class Meta:
        model = Topic
        fields = ['name']
        widgets = {
            'name' : forms.TextInput(attrs={
                'class' : 'form-control',
                'id' : 'new-topic',
                'autofocus' : True,
                'placeholder' : 'New Topic',
                
            })
        }
        labels = {
            'name' : ""
        } 

class AddSubtopicForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset= Topic.objects.all(),
        empty_label=None,
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'topic-name'
        }),
        label='Select a Topic'
        
    )
    class Meta:
        model = Subtopic
        fields = ['topic', 'name']
        widgets = {
            'name' : forms.TextInput(attrs={
            'class' : 'form-control',
            'id' : 'new-subtopic',
            })
        }
        labels = {
            'name': 'Subtopic Name',
        }
        
    def clean_topic(self):
        topic = self.cleaned_data.get('topic')
        if not topic:
            raise forms.ValidationError("Please select a valid topic.")
        return topic
