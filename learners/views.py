from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages

from .models import User

def index(request):
    return render(request, 'learners/index.html')

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful              
        if user is not None:
            login(request, user)
            if user.is_superuser:
                return redirect('management_portal')
            else:
                return redirect('quizes_home')
        else:
            messages.error(request, "Your username and password didn't match. Please try again.")
            return render(request, "learners/index.html")
        
    else:
        return redirect("index")
        
def register(request):
    
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            messages.error(request, "Passwords must match. Please try again.")
            return render(request, "learners/register.html")

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            messages.error(request, "Username already taken. Please try another.")
            return render(request, "learners/register.html")
        
        login(request, user)
        return render(request, 'quizes/home.html')
    
    else:
        return render(request, "learners/register.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

