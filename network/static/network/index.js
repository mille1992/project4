document.addEventListener('DOMContentLoaded',function(){
    // if submit button is existing (i.e. user is logged in)
    if(document.querySelector('#createPost-submit')){
        // Add click event to createPost Submit button
        document.querySelector('#createPost-submit').addEventListener('click', createPost);
    }

    // if following nav item is existing (i.e. user is logged in)
    if(document.querySelector('#followingLink')){
        // Add click event to createPost Submit button
        document.querySelector('#followingLink').addEventListener('click', () => {
            // remove all currently displayed posts
            document.querySelectorAll('[name="post-container"]').forEach(post => {
                post.innerHTML=""
            })
            // change post section header
            document.querySelector('#postHeader').innerHTML = "Posts of your followed Users";
            // load posts made from people the user is following
            load_posts('followingLink');
        })
    }

    // add click event listener to page navigation buttons "Next" and "Previous"
    document.querySelectorAll('[name="page_nav"]').forEach( nav => {
        // if a "Next" or "Previous" is clicked
        nav.addEventListener('click', event => {
            // get current page number from DOM element
            pageNumber = document.querySelector('#currPageNumberIndicator').innerHTML;  
            
            // remove all currently displayed posts
            document.querySelectorAll('[name="post-container"]').forEach(post => {
                post.innerHTML=""
            })

            // if on index page
            if (document.querySelector('#postHeader').innerHTML = "Latest Posts"){
                // handover argument to load index-posts based on the page number and the dataset value of the pagenav 
                load_posts(`all+${event.target.dataset.pagecnt}+${pageNumber}`);
            } 
            // if on index page
            if (document.querySelector('#postHeader').innerHTML == "Posts of your followed Users") {
                // handover argument to load following-posts based on the page number and the dataset value of the pagenav
                load_posts(`followingLink+${event.target.dataset.pagecnt}+${pageNumber}`);
            }

        })
    })

    // load all posts in the database as standard
    load_posts('all');

});

function createPost() {
    // post Post if form has been submitted
    document.querySelector('#createPost-form').onsubmit = event => {
        event.preventDefault();
    }
    let postContent = document.querySelector('#createPost-content').value;
    
    fetch('/createPost', {
        method: 'POST',
        //headers to enable the csrf_token functionality
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            postContent: postContent,
            credentials: 'same-origin',
        })
    })
    .then(response => response.json())
    .then(post => {
            post = post[0]
            postContainer = createPostDivs(post)

            firstElement=document.querySelector('#listPosts-view').firstElementChild;
            document.querySelector('#listPosts-view').insertBefore(postContainer,firstElement);
    })
    document.querySelector('#createPost-content').value = "";
}

function load_posts(set){
    fetch(`posts/${set}`)
    .then(response => response.json())
    .then(posts => {
        numPages = posts[1][0]
        hasPreviousPage = posts[1][1]
        hasNextPage = posts[1][2]
        currPageNum = posts[1][3]
        if (hasPreviousPage == true){
            document.querySelector('#page-previous').style.display = "block"
        }else{
            document.querySelector('#page-previous').style.display = "none"
        }
        if (hasNextPage == true){
            document.querySelector('#page-next').style.display = "block"
        }else{
            document.querySelector('#page-next').style.display = "none"
        }
        
        document.querySelector('#currPageNumberIndicator').innerHTML = currPageNum;
        document.querySelector('#lastPageNumberIndicator').innerHTML = numPages;

        posts[0].forEach( post => { 
            postContainer = createPostDivs(post)
            document.querySelector('#listPosts-view').append(postContainer);
        });
    });
}

// define the structure of a postContainer that should be created
function createPostDivs(post){
    let postContainer = document.createElement('div');
    let postCreator = document.createElement('div');
    let postContent = document.createElement('div');
    let postLikes = document.createElement('div');
    let postTimestamp = document.createElement('div');

    postContainer.className ="m-2  border-primary rounded bg-light";
    postCreator.className ="m-2";
    postContent.className ="m-2";
    postLikes.className ="m-2";
    postTimestamp.className ="m-2";

    postContainer.setAttribute("name","post-container");
    postCreator.setAttribute("name","post-creator");
    postContent.setAttribute("name","post-content");
    postLikes.setAttribute("name","post-likes");
    postTimestamp.setAttribute("name","post-timestamp");

    postCreator.innerHTML = `<u><b> <a href="/profile/${post.creatorId}"> ${post.creator} </a>  </b></u>`;
    postContent.innerHTML = `<br> ${post.content}`
    postLikes.innerHTML = `<br> Likes: ${post.likes}`
    postTimestamp.innerHTML = `<i> Created: ${post.timestamp} </i>`

    postContainer.dataset.postId = post.id

    postContainer.appendChild(postCreator);
    postContainer.appendChild(postContent);
    postContainer.appendChild(postLikes);
    postContainer.appendChild(postTimestamp);
    
    return postContainer;
}

// make sure the csrf token functionality can be used
// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
