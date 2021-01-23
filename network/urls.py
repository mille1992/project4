
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("createPost", views.createPost, name="createPost"),
    path("posts/<str:set>", views.load_posts, name="load_posts")
]
