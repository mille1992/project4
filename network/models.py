from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followsByUser = models.ManyToManyField("Profile", related_name="usersFollowedByUser", blank=True)
    
    def __str__(self):
        return f"{self.username}, user-id: {self.id}"

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "followsByUser": self.followsByUser
        }


class Post(models.Model):
    content = models.CharField(max_length=255)
    likes = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey("User", on_delete=models.PROTECT, related_name="postCreator")
    
    def __str__(self):
        return f" post-id: {self.id}, Creator: {self.creator}, likes: {self.likes}, timestamp: {self.timestamp}"

    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "creator": self.creator.username,
            "likes": self.likes,
            "timestamp": self.timestamp.strftime("%d %b %Y, %I:%M %p")
        }


class Profile(models.Model):    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profileFollowers = models.ManyToManyField("User", related_name="usersFollowingProfile")
    
    def __str__(self):
        return f" profile-id: {self.id}, user: {self.user}, profileFollowers: {self.profileFollowers}"

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user,
            "profileFollowers": self.profileFollowers
        }
