from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages

#from .models import User

def dashboard(request):
  
    return render(request, 'quizes/dashboard.html')

