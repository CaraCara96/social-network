

document.addEventListener('DOMContentLoaded', function(){

    var likeButton = document.querySelectorAll('.like_btn');
    likeButton.forEach(function(button){
        button.addEventListener('click', likePost)
    });

    var unlikeButton = document.querySelectorAll('.unlike_btn');
    unlikeButton.forEach(function(button){
        button.addEventListener('click', function(event){
            unlikePost(event);
        })
    });

    var editBtn = document.querySelectorAll('.edit_btn');
    editBtn.forEach(function(button){
        button.addEventListener('click', editPost)
    })

    var followBtn = document.querySelectorAll('.follow_b');
    followBtn.forEach(function(button){
        button.addEventListener('click', followUser)
    })
    
    var unFollowBtn = document.querySelectorAll('.unfollow_btn');
    unFollowBtn.forEach(function(button){
        button.addEventListener('click', function(event){
            unFollowUser(event)
        })
    })

});



function likePost(event){
    var button = event.currentTarget;
    var postId = button.getAttribute('data-post-id');
    var url = `/my_like/${postId}/`;
          
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({like: true})
                
            })
            .then(function(response){
                if(response.ok){
                   
                    var likeCount = button.nextElementSibling;
                    var currentLikes = parseInt(likeCount.textContent);
                    likeCount.textContent = currentLikes + 1;
                    button.style.display = 'none';
        
                   
                  
                   var unlike = document.createElement('button')
                   unlike.setAttribute('class', 'btn btn-lg btn-warning unlike_btn');
                   unlike.setAttribute('data-post-id', postId);
                   unlike.textContent='Unlike';
        
                //    var space = document.createTextNode(' ');
                //    likeCount.parentNode.insertBefore(space, likeCount.nextSibling);
                //    likeCount.parentNode.insertBefore(unlike, space.nextSibling)
        
                   button.parentNode.insertBefore(unlike, likeCount);
                   unlike.style.marginRight = '10px';
                   unlike.style.marginLeft = '0px';
                   
                   likeCount.style.verticalAlign = 'middle';
                   unlike.style.verticalAlign = 'middle';
        
                   unlike.addEventListener('click', function(event){
                    unlikePost(event);
                   });
                   
                  
                }
                else{
                    console.error('Failed');
                    button.textContent = 'Like';
                    button.classList.add('like_btn');
                    button.classList.remove('unlike_btn');
                    var likeCount = button.nextElementSibling;
                    var currentLikes = parseInt(likeCount.textContent);
                    likeCount.textContent = currentLikes - 1;
                }
            })
            .catch(function(error){
                console.error('Error:', error);
            });
     
        

    
  }


  function unlikePost(event){
            var button = event.target;
            var postId = button.getAttribute('data-post-id');
            var url = `/my_unlike/${postId}/`;
            console.log(url)
            fetch(url,{
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response=>{
                if(response.ok){
                
                    console.log("Successfully Deleted")
                    var likes = button.nextElementSibling;
                    var currentLike = parseInt(likes.textContent);
                    likes.textContent = currentLike - 1;
                    button.style.display = 'none'

                    var likeBtn = document.createElement('button');
                    likeBtn.setAttribute('class', 'btn btn-lg btn-success like_btn');
                    likeBtn.setAttribute('data-post-id', postId);
                    likeBtn.textContent = 'Like';
                    likeBtn.style.marginRight ='10px';

                    if (likes && likes.parentNode) {
                        likes.parentNode.insertBefore(likeBtn, likes);
                    }

                    likeBtn.addEventListener('click', function(event){
                        likePost(event);
                       });
                }
                else{
                    console.error('Failed to delete')
                }
            })
            .catch(error =>{
                console.error('error', error)
            })
      
   
}

function editPost(event){
    var button = event.target;

    var postContainer = event.target.closest('.post_field');
    var postArea = postContainer.querySelector('.post_textarea');
    var postId = button.getAttribute('data-post-id');
    var postText = postArea.textContent.trim();

    var inputField = document.createElement('textarea');
    inputField.setAttribute('class', 'form-control')
    inputField.setAttribute('rows', '3');
    inputField.value= postText;

    postArea.replaceWith(inputField);
   
    inputField.focus();
  
    button.style.display='none';
    var editB = document.createElement('button');
    editB.setAttribute('class', 'btn btn-lg btn-primary modify_btn');
    editB.textContent = 'Save';
    editB.style.marginRight = "10px";
    
    var cancelB = document.createElement('button')
    cancelB.setAttribute('class', 'btn btn-lg btn-warning cancel_btn');
    cancelB.textContent='Cancel';
    cancelB.style.marginRight='10px'
    button.parentNode.insertBefore(editB, button)
    button.parentNode.insertBefore(cancelB, button)
   
    editB.addEventListener('click', function(event){
        var postContent = inputField.value;
        console.log(postContent)
        editPostSave(postId, postContent);
    })

    cancelB.addEventListener('click', function(){
        inputField.replaceWith(postArea);
        postArea.style.display='block';
        button.style.display='inline-block';

        button.style.float = 'right'
        
        editB.remove();
        cancelB.remove();
    })

}
 
function editPostSave(postId, postContent){
var url = `/update_post/${postId}/`;
fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
        'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({post: postContent})
})
.then(function(response){
    if(response.ok){
      

       var postContainer = document.querySelector(`.post_text[data-post-id="${postId}"]`);
       
       var textField = postContainer.querySelector('textarea');
   
       textField.textContent = postContent;
   

      
      var postTextarea = document.createElement('div');
      postTextarea.classList.add('post_textarea');
      postTextarea.textContent = postContent;
      textField.replaceWith(postTextarea);

      
       var editBtn = document.createElement('button');
       editBtn.className= 'btn btn-lg btn-warning edit_btn';
       editBtn.setAttribute('data-post-id', postId);
       editBtn.textContent = 'Edit';
       var postEditDiv = postContainer.querySelector('.post_edit');
       postEditDiv.insertBefore(editBtn, postEditDiv.firstChild);
      
       
       var saveBtn = postContainer.querySelector('.modify_btn');
       var cancelBtn = postContainer.querySelector('.cancel_btn');
       saveBtn.remove();
       cancelBtn.remove();
       editBtn.addEventListener('click', function(event){
        editPost(event)
       });
    }
    else{
        console.error('Failed to Update');
    }
})
.catch(function(error){
    console.error('Error:', error);
})


}

function followUser(event){
    var button = event.currentTarget;
    var followUser = button.getAttribute('data-current-user');
    var followedUser = button.getAttribute('data-followed-user');
    
    var url = '/follow_user/';
    
    fetch(url,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({user: followUser, follow: followedUser})
    })
    .then(function(response){
        if(response.ok){
            var flwCount = document.querySelector('.flw_count');
            var flwCountE = parseInt(flwCount.textContent);
            flwCount.textContent = flwCountE + 1;
            button.style.display= 'none'

            var unBtn = document.createElement('button');
            unBtn.className = 'btn btn-lg btn-outline-primary unfollow_btn';
            unBtn.setAttribute('data-current-user', followUser);
            unBtn.setAttribute('data-followed-user', followedUser);
            unBtn.textContent = 'UnFollow'
            button.parentNode.insertBefore(unBtn, button)

            unBtn.addEventListener('click', function(event){
                unFollowUser(event);
            })
        }
        else{
            console.error("Unsuccessful")
        }
    })
    .catch(function(error){
        console.error("error : ", error)
    })

}
function unFollowUser(event){
    var button = event.target;
    var currentUser = button.getAttribute('data-current-user');
    var followedUser = button.getAttribute('data-followed-user');
    var url = '/unFollow_user/';
    
    fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({user: currentUser, followed: followedUser})
    })
    .then(function(response){
        if(response.ok){
            var followCount = document.querySelector('.flw_count');
            var followCountE = parseInt(followCount.textContent);
            followCount.textContent = followCountE - 1;

            button.style.display = 'none'

            var flwBtn = document.createElement('button')
            flwBtn.className = 'btn btn-lg btn-outline-success follow_btn';
            flwBtn.setAttribute('data-current-user', currentUser);
            flwBtn.setAttribute('data-followed-user', followedUser);
            flwBtn.textContent = 'Follow'
            button.parentNode.insertBefore(flwBtn, button);

            flwBtn.addEventListener('click', function(event){
                followUser(event);
            })
        }
        else{
            console.error('Unsuccessful');
        }

    })
    .catch(function(error){
        console.error('Error: ', error);
    })
}
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}