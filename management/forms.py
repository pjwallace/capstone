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

class RenameTopicForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset=Topic.objects.all(),
        label="Choose a topic to rename",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'rename-topic',
        })
    )

    new_topic_name = forms.CharField(
        max_length=100,
        label="",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'id': 'new-topic-name',
            'placeholder': 'Enter new topic name'
        })
    )
    class Meta:
        model = Topic
        fields = []

    def clean(self):
        cleaned_data = super().clean()
        topic = cleaned_data.get('topic')
        new_topic_name = cleaned_data.get('new_topic_name')

        if topic and new_topic_name and topic.name == new_topic_name:
            self.add_error('new_topic_name', 'The new topic name must be different from the current name.')

        return cleaned_data
    
class DeleteTopicForm(forms.ModelForm):
    name = forms.ModelChoiceField(
        queryset= Topic.objects.all(),
        #empty_label="Select a topic",
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'topic-to-delete'
        }),
        label='Select a topic to delete'     
    )

    class Meta:
        model = Topic
        fields = ['name']

    def clean_topic(self):
        name = self.cleaned_data.get('name')
        if not name:
            raise forms.ValidationError("Please select a valid topic.")
        return name
    

class AddSubtopicForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset = Topic.objects.all(),
        #empty_label="Select a topic",
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
    
class RenameSubtopicForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset=Topic.objects.all(),
        label="Select a Topic",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'topic-for-renamed-subtopic',
        })
    )

    name = forms.ModelChoiceField(
        queryset = Subtopic.objects.none(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'choose-subtopic-to-rename',
        }),
        label='Select a subtopic to rename'     
    )
    new_subtopic_name = forms.CharField(
        max_length=100,
        label="",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'id': 'new-subtopic-name',
            'placeholder': 'Enter new subtopic name'
        })
    )
    class Meta:
        model = Subtopic
        fields = []


    
class DeleteSubtopicForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset= Topic.objects.all(),
        #empty_label="Select a topic",
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'topic-to-choose'
        }),
        label='Select a Topic'     
    )

    name = forms.ModelChoiceField(
        queryset = Subtopic.objects.none(),
        #empty_label="Select a subtopic to delete",
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'subtopic-to-choose'
        }),
        label='Select a Subtopic to delete'     
    )

    class Meta:
        model = Subtopic
        fields = ['topic', 'name']

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.fields['name'].queryset = Subtopic.objects.none()

    def clean_subtopic(self):
        name = self.cleaned_data.get('name')
        if not name:
            raise forms.ValidationError("Please select a valid sub topic.")
        return name
