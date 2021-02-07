
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:creator_id>", views.profile_view, name="profile_view"),

    #API Routes
    path("createPost", views.createPost, name="createPost"),
    path("modifyPost/<int:postId>", views.modifyPost, name="modifyPost"),
    path("posts/<str:set>", views.load_posts, name="load_posts"),
    path("followunfollow/<str:username>", views.followUnfollow, name="followUnfollow"),
    path("update_followers/<str:username>", views.update_followers, name="update_followers")
]
