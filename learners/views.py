from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, transaction
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.contrib.messages import get_messages
import re
from .forms import ProfileForm
from .models import User, Profile

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
            if user.is_superuser or user.is_staff:
                request.session['show_welcome'] = True #flag to show welcome instructions
                return redirect('management_portal')
            else:
                return redirect('dashboard')
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
        if user.is_superuser or user.is_staff:
            request.session['show_welcome'] = True
            return redirect('management_portal')
        else:
            return redirect('dashboard')
        
    
    else:
        return render(request, "learners/register.html")
    
def edit_profile(request):
    if request.method == 'POST':
        profile_form = ProfileForm(request.POST)
        if profile_form.is_valid():
            with transaction.atomic():
                # create an instance of the User model
                user = get_object_or_404(User, pk=request.user.id)

                # update the User model
                user.first_name = profile_form.cleaned_data['first_name']
                user.last_name = profile_form.cleaned_data['last_name']
                if profile_form.cleaned_data['new_email']:
                    user.email = profile_form.cleaned_data['new_email']

                user.save()

                # update or create a Profile record
                try:
                    profile = Profile.objects.get(user=user)
                    profile.preferred_name = profile_form.cleaned_data['preferred_name']
                    profile.residency_program = profile_form.cleaned_data['residency_program']
                    profile.pg_level = profile_form.cleaned_data['pg_level']
                    profile.cell_phone = profile_form.cleaned_data['cell_phone']
                    profile.save()

                except Profile.DoesNotExist:
                    # create the new profile record
                    profile = Profile.objects.create(
                        user = user,
                        preferred_name = profile_form.cleaned_data['preferred_name'],
                        residency_program = profile_form.cleaned_data['residency_program'],
                        pg_level = profile_form.cleaned_data['pg_level'],
                        cell_phone = profile_form.cleaned_data['cell_phone'],
                    )
            messages.success(request, "Your profile has been updated.")
            return redirect('edit_profile')
    
        else:
            # Render the form with validation errors
            return render(request, 'learners/profile.html', {'profile_form': profile_form})

    else:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            profile = None

        profile_form = ProfileForm(initial={
            'first_name': request.user.first_name or '',
            'last_name': request.user.last_name or '',
            'preferred_name': profile.preferred_name if profile else '',
            'current_email': request.user.email or '',
            'residency_program': profile.residency_program if profile else '',
            'pg_level': profile.pg_level if profile else '',
            'cell_phone': profile.cell_phone if profile else '',
        })
       
        return render(request, 'learners/profile.html', {
            'profile_form': profile_form,
        })


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

