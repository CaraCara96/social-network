import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.shortcuts import render, get_list_or_404, get_object_or_404
from .models import User, Post, Like, Follow


def index(request):
    posts = Post.objects.annotate(like_count=Count('like')).order_by('-date')
    user = request.user
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    if request.method == 'POST':
        username = request.user.username
        post = request.POST.get('post')
        user = User.objects.get(username=username)
        Post.objects.create(user = user, post = post)
        return redirect(request.path)

    context = { 'page_obj': page_obj, 'posts': posts}
    return render(request, "network/index.html", context)


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


@login_required
def my_like(request, pk):
    post = get_object_or_404(Post, pk=pk)
    user = request.user

    post_like = Like( user = user, post = post, like = True)
    post_like.save()
    return redirect('index')
@login_required
def my_unlike(request, pk):
    post = get_object_or_404(Post, pk=pk)
    user = request.user
    liked = Like.objects.filter(user = user, post = post)
    liked.delete()

    
    return redirect('index')

@login_required
def update_post(request, pk):
    post = get_object_or_404(Post, pk=pk)
   

    if request.method =='POST' and request.is_ajax():
        post_data = json.loads(request.body)
        
        post_content = post_data.get('post')
       

        try:
            post = Post.objects.get(pk=pk)
            post.post = post_content
            post.save()
            
            return redirect('index')
        except Post.DoesNotExist:
           
            return JsonResponse({'success': False, 'error': 'Post not found'})
        
    else:
        
        return JsonResponse({'success': False, 'error': 'Invalid'})
    
@login_required
def profile(request, username):
    user = get_object_or_404(User, username=username)
    current = request.user

    follows = Follow.objects.filter(user=user).count()
    followed = Follow.objects.filter(followed = user).count()

    

    posts = Post.objects.filter(user=user).annotate(like_count=Count('like')).order_by('-date')
    username = username
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    is_following = Follow.objects.filter(user = current, followed=user).exists()

    

    context = { 'page_obj': page_obj, 'posts': posts, "user": user, "follows":follows, "followed": followed, "is_following":is_following }
    
    return render(request, "network/profile.html", context)


@login_required
def my_profile(request, username):

    user = User.objects.get(username=username)
    posts = Post.objects.filter(user=user).annotate(like_count=Count('like')).order_by('-date')
    follows = Follow.objects.filter(user = user).count()
    followed = Follow.objects.filter(followed = user).count()
    current = request.user
    paginator = Paginator(posts, 6)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    is_following = Follow.objects.filter(user = current, followed=user).exists()

    

    context = { 'page_obj': page_obj, 'posts': posts, "user": user, "follows":follows, "followed": followed, "is_following":is_following }
    return render(request, 'network/my-profile.html', context)

@login_required   
def follow_user(request):
    if request.method == "POST" and request.is_ajax():
        details = json.loads(request.body.decode('utf-8'))

        username = details.get('user')
        followName = details.get('follow')
       

        if username and followName:
            try:
                user = User.objects.get(username=username)
                follow = User.objects.get(username=followName)

                Follow.objects.create(user = user, followed = follow)
                
                return JsonResponse({'message': 'Follow operation successful'}, status=200)
            except Exception as e:
                print(f"unsuccessful : {e}")
                return JsonResponse({'error': 'Method not allowed'}, status=405)
            else:
                return JsonResponse({'error': 'Method not allowed'}, status=400)
        
    else:
       return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def unFollow_user(request):
    if request.method == 'POST' and request.is_ajax():
         details = json.loads(request.body)

         username = details.get('user')
         followedUser = details.get('followed')

         if username and followedUser:
             try:
                 user = User.objects.get(username = username)
                 followed = User.objects.get(username= followedUser)

                 deleteFollow = Follow.objects.filter(user = user, followed = followed)
                 deleteFollow.delete()
                 return JsonResponse({'message': 'Unfollow operation successful'}, status=200)


             except Exception as e:
                 print(f"Did not delete {e}")
                 return JsonResponse({'error': 'Method not allowed'}, status=405)
             else:
                 return JsonResponse({'error': 'Invalid data'}, status=400)
    else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@login_required
def following(request):
    user = request.user
    follows = Follow.objects.filter(user = user)
    followed_users = [follow.followed for follow in follows]
    posts = Post.objects.filter(user__in = followed_users).annotate(like_count=Count('like')).order_by('-date')
   
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    

    context = {'posts': posts,'page_obj': page_obj}

    return render(request, "network/following.html", context)

             

