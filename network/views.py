from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.urls.base import clear_url_caches

from .models import *
import json

def index(request):
    return render(request, "network/index.html")

def followUnfollow(request, username):
    creator = User.objects.get(username = username)
    profile = Profile.objects.get(user_id = creator.id)
    currUser = User.objects.get(id = request.user.id)


    if profile.profileFollowers.filter(id = currUser.id):
        profile.profileFollowers.remove(currUser)
        profile.save()
        currUser.followsByUser.remove(profile)
        currUser.save()
        userFollowsProfile = False
    else:
        profile.profileFollowers.add(currUser)
        profile.save()
        currUser.followsByUser.add(profile)
        currUser.save()
        userFollowsProfile = True
 
    if userFollowsProfile==True:
        return JsonResponse({"message": "Sucessfully followed"}, safe = False, status=201)
    else:
        return JsonResponse({"message": "Sucessfully unfollowed"}, safe = False, status=201)


def update_followers(request, username):
    creator = User.objects.get(username = username)
    profile = Profile.objects.get(user_id = creator.id)
    currUser = User.objects.get(id = request.user.id)

    followers = profile.profileFollowers.all()
    followsByUser = creator.followsByUser.all()
    
    followers_cnt = followers.count()
    followsByUser_cnt = followsByUser.count()

    if profile.profileFollowers.filter(id = currUser.id):
        currUserIsFollower = True
    else:
        currUserIsFollower = False
    return JsonResponse({"followers_cnt": followers_cnt, "followsByUser_cnt": followsByUser_cnt, "currUserIsFollower": currUserIsFollower}, safe = False)




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
    return JsonResponse([post.serialize()], safe = False)
   # return JsonResponse({"message": "Post sucessfully uploaded"}, status=201)


def load_posts(request, set):
    if User.objects.filter(username = set).exists():
        creator = User.objects.get(username = set)
        posts = Post.objects.all().filter(creator_id = creator.id)
        #for post in posts:
        #    print(post)
    elif 'all' in set:
        posts = Post.objects.all()
    elif "followingLink" in set:
        user = request.user
        followsByUser = user.followsByUser.all()
        followUserIds = []
        for follow in followsByUser:
            followUserIds.append(follow.user_id)
        posts = Post.objects.all().filter(creator_id__in = followUserIds)

    posts = posts.order_by("-timestamp").all()

    p = Paginator(posts,10)
    currPageNum = [int(s) for s in set.split("+") if s.isdigit()]
    if currPageNum == []:
        currPageNum = 1
    else:
        currPageNum = currPageNum[0]
        
    if 'next' in set:
        currPageNum +=1
    elif 'previous' in set:
        currPageNum -=1

    posts_currPage = p.page(currPageNum)
    posts_currPageObjects = p.page(currPageNum).object_list

    numOfPages = p.num_pages
    prevPageExisting = posts_currPage.has_previous()
    nextPageExisting = posts_currPage.has_next()

    #print(f"Paginator - number of pages: {p.num_pages}")
    #print(f"Paginator - first page objects: {p.page(1).object_list}")
    #test = [posts_paginated.serialize() for post in posts],["test"]
    #print(test[1])
    return JsonResponse([[postObject.serialize() for postObject in posts_currPageObjects],[numOfPages, prevPageExisting, nextPageExisting, currPageNum]], safe = False)


def profile_view(request,creator_id):
    creator_username = User.objects.get(id = creator_id)
    return render(request, "network/profile.html", {
            "creator_id": creator_id,
            "creator_username": creator_username.username
        })


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
            newProfile = Profile.objects.create(user = user)
            newProfile.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
