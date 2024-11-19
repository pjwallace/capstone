from django import forms
from learners.models import User, Profile

PG_LEVEL_CHOICES = [
    ('PG1', 'PG-1'),
    ('PG2', 'PG-2'),
    ('PG3', 'PG-3'),
    ('PG4', 'PG-4'),
    ('PG5', 'PG-5'),
    ('PG6', 'PG-6'),
    ('PG7', 'PG-7'),
    ('Fellow', 'Fellow'),
    ('Faculty', 'Faculty'),
]

RESIDENCY_PROGRAM_CHOICES = [
    ('UTMB', 'University of Texas Medical Branch'),
    ('Other', 'Other Program'),
]

class ProfileForm(forms.Form):
    first_name = forms.CharField(
        max_length=50, required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'First Name'
        })
    )
    last_name = forms.CharField(
        max_length=50, required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Last Name'
        })
    )
    preferred_name = forms.CharField(
        max_length=50, required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Preferred Name'
        })
    )
    email = forms.EmailField(
        required=False,
        widget=forms.EmailInput(attrs={
            'class': 'form-control', 
            'readonly': 'readonly'
        })
    )
    new_email = forms.EmailField(
        required=False,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'New Email Address'
        })
    )
    residency_program = forms.ChoiceField(
        choices=RESIDENCY_PROGRAM_CHOICES, required=False,
        widget=forms.Select(attrs={
            'class': 'form-control'
        })
    )
    pg_level = forms.ChoiceField(
        choices=PG_LEVEL_CHOICES, required=False,
        widget=forms.Select(attrs={
            'class': 'form-control'
        })
    )
    cell_phone = forms.RegexField(
        regex=r'^\+?1?\d{9,15}$',
        required=False,
        error_messages={
            'invalid': 'Enter a valid phone number with digits only, no special characters.'
        },
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter numbers only, no special characters',
        })
    )
