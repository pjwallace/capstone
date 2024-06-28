from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.contrib.messages import get_messages
import re

from .models import User

def index(request):
    return render(request, 'learners/index.html')

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        context = {
            'username': username
        }

        if not username:
            messages.error(request, "You must provide a username")
            return render(request, "learners/index.html")
        
        if not password:
            messages.error(request, "You must provide a password")
            return render(request, "learners/index.html", context)

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
            return render(request, "learners/index.html", context)
        
    else:
        return redirect("index")
        
def register(request):
    
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        # pass the form data back to the user if there is a validation error
        # password information will not be passed back for security reasons
        context = {
            'username' : username,
            'email' : email
        }

        # Clear old error messages
        storage = messages.get_messages(request)
        storage.used = True

        # validate the register form information

        # username
        if not username:
            messages.error(request, "You must provide a username.")
            return render(request, "learners/register.html", context) 
        
        if len(username) < 4:
            messages.error(request, "Your username must be at least 4 characters.")
            return render(request, "learners/register.html", context)
        
        if len(username) > 20:
            messages.error(request, "Your username can't exceed 20 characters.")
            return render(request, "learners/register.html", context)
        
        if not username.isalnum():
            messages.error(request, "Username can only contain letters and numbers.")
            return render(request, "learners/register.html", context)
        
        # email
        if not email:
            messages.error(request, "You must provide a valid email address.")
            return render(request, "learners/register.html", context)
        
        # validate email format
        regex_email = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        if not (re.fullmatch(regex_email, email)):
            messages.error(request, "Invalid email address format")
            return render(request, "learners/register.html", context)
        
        # Check if email already exists in the database
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email is already in use.")
            return render(request, "learners/register.html", context)
        
        # password
        if not password:
            messages.error(request, "You must provide a password.")
            return render(request, "learners/register.html", context)
        
        if len(password) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
            return render(request, "learners/register.html", context)
        
        if len(password) > 20:
            messages.error(request, "Password can't exceed 20 characters.")
            return render(request, "learners/register.html", context)
        
        if all(char.isdigit() for char in password):
            messages.error(request, "Password can't be all numbers.")
            return render(request, "learners/register.html", context) 
        
        if not any(char.isupper() for char in password):
            messages.error(request, "Password must contain at least one uppercase letter.")
            return render(request, "learners/register.html", context)
        
        if not any(char.islower() for char in password):
            messages.error(request, "Password must contain at least one lowercase letter.")
            return render(request, "learners/register.html", context)
        
        if not any(char.isdigit() for char in password):
            messages.error(request, "Password must contain at least one number.")
            return render(request, "learners/register.html", context)
        
        if password == username:
            messages.error(request, "Password must be different than username.")
            return render(request, "learners/register.html", context)   

        if not confirmation:
            messages.error(request, "You must provide a confirmation email address.")
            return render(request, "learners/register.html", context)   

        # Ensure password matches confirmation
        
        if password != confirmation:
            messages.error(request, "Passwords must match. Please try again.")
            return render(request, "learners/register.html", context)

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            messages.error(request, "Username already taken. Please try another.")
            return render(request, "learners/register.html", context)
        
        login(request, user)
        if user.is_superuser:
            return redirect('management_portal')
        else:
            return redirect('quizes_home')
        
    
    else:
        return render(request, "learners/register.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

