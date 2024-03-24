from django import forms
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
    class Meta:
        model = Subtopic
        fields = ['topic', 'name']
        widgets = {
            'topic' : forms.Select(attrs={'class': 'form-control'}),
            'name' : forms.TextInput(attrs={
                'class' : 'form-control',
                'id' : 'new-subtopic',
                'placeholder' : 'Subtopic'
            })
       }
