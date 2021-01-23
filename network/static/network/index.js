document.addEventListener('DOMContentLoaded',function(){

    // Add click event to createPost Submit button
    document.querySelector('#createPost-submit').addEventListener('click', createPost);
    
    // load all posts in the database as standard
    load_posts('all');

});

function createPost() {
    // post Post if form has been submitted
    //document.querySelector('#createPost-form').onsubmit = event => {
    //    event.preventDefault();
    //}
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
    document.querySelector('#createPost-content').value = "";

    load_posts('all');
}

function load_posts(set){
    fetch(`posts/${set}`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach( post => {
            let postContainer = document.createElement('div');
            let postCreator = document.createElement('div');
            let postContent = document.createElement('div');
            let postLikes = document.createElement('div');
            let postTimestamp = document.createElement('div');

            postContainer.className ="m-2 border border-primary rounded bg-light";
            postCreator.className ="m-2";
            postContent.className ="m-2";
            postLikes.className ="m-2";
            postTimestamp.className ="m-2";

            postContainer.setAttribute("name","post-container");
            postCreator.setAttribute("name","post-creator");
            postContent.setAttribute("name","post-content");
            postLikes.setAttribute("name","post-likes");
            postTimestamp.setAttribute("name","post-timestamp");

            postCreator.innerHTML = `<u><b>${post.creator}</b></u> post-id: ${post.id}`;
            postContent.innerHTML = `<br> ${post.content}`
            postLikes.innerHTML = `<br> Likes: ${post.likes}`
            postTimestamp.innerHTML = `<i> Created: ${post.timestamp} </i>`

            postContainer.dataset.postId = post.id

            postContainer.appendChild(postCreator);
            postContainer.appendChild(postContent);
            postContainer.appendChild(postLikes);
            postContainer.appendChild(postTimestamp);

            console.log(post)
            document.querySelector('#listPosts-view').append(postContainer);
        });
    });
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
