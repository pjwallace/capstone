from django import forms
from django.core.exceptions import ValidationError
from management.models import Topic, Subtopic, Question, QuestionType, Choice, Explanation
from collections import OrderedDict

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
        max_length=30,
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
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'topic-name-subtopic'
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
        max_length=30,
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
    
class AddQuestionForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset= Topic.objects.all(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'topic-for-question'
        }),
        label='Select a Topic'     
    )

    subtopic = forms.ModelChoiceField(
        queryset = Subtopic.objects.none(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'subtopic-for-question'
        }),
        label='Select a Subtopic'     
    )

    question_type = forms.ModelChoiceField(
        queryset= QuestionType.objects.all(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'question-type'
        }),
        label='Select a Question Type'     
    )

    text = forms.CharField(
        max_length=255,
        label="",
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'id': 'new-question',
            'placeholder': 'Enter Question',
            'rows': 3,
        })
    )

    class Meta:
        model = Question
        fields = ['subtopic', 'question_type', 'text']

    def __init__(self, *args, **kwargs):
        super(AddQuestionForm, self).__init__(*args, **kwargs)
        self.fields['topic'].queryset = Topic.objects.all()  
        self.fields['subtopic'].queryset = Subtopic.objects.none()
        self.fields['question_type'].queryset = QuestionType.objects.all()

        # Set initial value for question_type to the default value (Multiple Choice), if it exists.
        try:
            default_question_type = QuestionType.objects.get(name='Multiple Choice')
            self.fields['question_type'].initial = default_question_type
        except QuestionType.DoesNotExist:
            pass  
        
        # Reorder the fields
        self.fields = OrderedDict([
            ('topic', self.fields['topic']),
            ('subtopic', self.fields['subtopic']),
            ('question_type', self.fields['question_type']),
            ('text', self.fields['text']),
        ])

class AddChoiceForm(forms.ModelForm):
    id = forms.IntegerField(widget=forms.HiddenInput(), required=False)
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']
        widgets = {
            'text' : forms.TextInput(attrs={
                'class' : 'form-control',
                'placeholder' : 'Answer Choice',              
            }),
            'is_correct': forms.CheckboxInput(attrs={
                'class': 'form-check-input',
                
            })
        }
        labels = {
            'text' : "",
            'is_correct': "Correct"
        } 

class EditQuestionForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset= Topic.objects.all(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'topic-for-edit-question'
        }),
        label='Select a Topic'     
    )

    subtopic = forms.ModelChoiceField(
        queryset = Subtopic.objects.none(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'subtopic-for-edit-question'
        }),
        label='Select a Subtopic'     
    )

    text = forms.ModelChoiceField(
        queryset = Question.objects.none(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'question-to-edit'
        }),
        label='Select a Question to edit'
    )

    class Meta:
        model = Question
        fields = ['subtopic', 'text']

    def __init__(self, *args, **kwargs):
        super(EditQuestionForm, self).__init__(*args, **kwargs)

        # Reorder the fields
        self.fields = OrderedDict([
            ('topic', self.fields['topic']),
            ('subtopic', self.fields['subtopic']),
            ('text', self.fields['text']),
            
        ])

class GetAllQuestionsForm(forms.ModelForm):
    topic = forms.ModelChoiceField(
        queryset= Topic.objects.all(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'topic-for-get-all-questions'
        }),
        label='Select a Topic'     
    )

    subtopic = forms.ModelChoiceField(
        queryset = Subtopic.objects.none(),
        widget=forms.Select(attrs={
            'class' : 'form-control',
            'id' : 'subtopic-for-get-all-questions'
        }),
        label='Select a Subtopic'     
    )

    class Meta:
        model = Question
        fields = ['subtopic']

    def __init__(self, *args, **kwargs):
        super(GetAllQuestionsForm, self).__init__(*args, **kwargs)

        # Reorder the fields
        self.fields = OrderedDict([
            ('topic', self.fields['topic']),
            ('subtopic', self.fields['subtopic']),
                        
        ])

class EditQuestionTextForm(forms.Form):
    topic = forms.CharField(label='Topic', max_length=30, 
            widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'topic-name', 'readonly': 'readonly'}))
    subtopic = forms.CharField(label='Subtopic', max_length=30, 
            widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'subtopic-name', 'readonly': 'readonly'}))
    question_type = forms.CharField(label='Question Type', max_length=25, 
            widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'question-name', 'readonly': 'readonly'}))
    text = forms.CharField(label='Question', 
            widget=forms.Textarea(attrs={'rows':3, 'class': 'form-control', 'id': 'question-text'}))

