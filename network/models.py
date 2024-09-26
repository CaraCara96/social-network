from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings



class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Username")
    education = models.TextField(blank = True, verbose_name="Education")
    background = models.TextField(blank = True, verbose_name="Background")

    def __str__(self):
        return self.user.username
    
class Post(models.Model):
    user = models.ForeignKey(User, on_delete= models.CASCADE, verbose_name="Username")
    date = models.DateTimeField(default = timezone.now, verbose_name = "Date Posted")
    post = models.TextField(blank = False, verbose_name = "Post")

    def __str__(self):
        return f"{self.user.username} posted {self.post}"
    
class Like(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE, verbose_name = "Username")
    post = models.ForeignKey('Post',  on_delete=models.CASCADE, verbose_name = "Post")
    like = models.BooleanField(default =False, verbose_name = "Likes")
    
    def __str__(self):
        return f"{self.user.username} Liked {self.post}"
    
class Follow(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE, verbose_name = "Follower", related_name='following')
    followed = models.ForeignKey(User, on_delete = models.CASCADE, verbose_name="Followed", related_name='followers', default=None)


    def __str__(self):
        return f"{self.user.username } follows {self.followed.username}"
    