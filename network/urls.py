
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("my-profile/<str:username>/", views.my_profile, name="my-profile"),
    path("my_like/<int:pk>/", views.my_like, name="my_like"),
    path("my_unlike/<int:pk>/", views.my_unlike, name="my_unlike"),
    path("update_post/<int:pk>/", views.update_post, name="update_post"),
    path("profile/<str:username>/", views.profile, name="profile"),
    path("follow_user/", views.follow_user, name="follow_user"),
    path("unFollow_user/",views.unFollow_user, name="unFollow_user"),
    path("following", views.following, name="following")
]
