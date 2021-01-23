from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt


from .models import *
import json

def index(request):
    return render(request, "network/index.html")

#@csrf_exempt
def createPost(request):
    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # prepare database upload
    # load post content in request
    data = json.loads(request.body)
    content = data.get("postContent")
    user = request.user
    likes = 0
    # if empty post throw error
    if content == [""]:
        return JsonResponse({
            "error": "At least one recipient required."
        }, status=400)   
    # build database object: post
    post = Post(
        content = content,
        creator = user,
        likes = likes
    )

    # upload post to db
    post.save()
    return JsonResponse({"message": "Post sucessfully uploaded"}, status=201)

def load_posts(request, set):
    if set == 'all':
        posts = Post.objects.all()
    #elif set == 'subset':
        # code to filter for a subset of the posts in db
        #
        #
        #----
        #posts = Post.objects.filter(creator = 2)
    else:
        return JsonResponse({
            "error": "no set to filter posts in db for defined."
        }, status=400) 
    posts = posts.order_by("-timestamp").all()
    for post in posts:
        print(post)
    #return JsonResponse([post.serialize() for post in posts], safe=False)
    return JsonResponse([post.serialize() for post in posts], safe = False)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
