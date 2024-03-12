from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages

#from .models import User

def management_portal(request):
   
    return render(request, 'management/manage_db.html')


