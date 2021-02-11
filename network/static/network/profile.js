document.addEventListener('DOMContentLoaded',function(){
    profileUsername = document.querySelector('#profile-creator').textContent;
    if (document.querySelector('#profile-follow-btn')){
        document.querySelector('#profile-follow-btn').addEventListener('click', () => {
            followUnfollow(profileUsername);
        });
    }

    // if following nav item is existing (i.e. user is logged in)
    if(document.querySelector('#followingLink')){
        // Add click event to createPost Submit button
        document.querySelector('#followingLink').addEventListener('click', () => {
            // remove all currently displayed posts
            document.querySelectorAll('[name="post-container"]').forEach(post => {
                post.innerHTML=""
            })
            // remove all profile info
            document.querySelector('#profile-creator').innerHTML = "";
            document.querySelector('#profile-followers').innerHTML = "";
            document.querySelector('#profile-follows').innerHTML = "";
            if(document.querySelector('#profile-follow-btn')){
            document.querySelector('#profile-follow-btn').remove();
            }
            // change post section header
            document.querySelector('#postHeader').innerHTML = "Posts of your followed Users";
            // load posts made from people the user is following
            console.log("test")
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



    update_followers(profileUsername)
    load_posts(profileUsername)

});

function followUnfollow(username){
    fetch(`../followunfollow/${username}`)
    .then(response => response.json())
    .then(() => {
        update_followers(profileUsername)
    })
}

function update_followers(username){
    fetch(`../update_followers/${username}`)
    .then(response => response.json())
    .then(followInfos => {
        document.querySelector("#profile-cntFollowers").innerHTML = followInfos.followers_cnt;
        document.querySelector("#profile-cntFollows").innerHTML = followInfos.followsByUser_cnt;
        if(followInfos.currUserIsFollower == true && document.querySelector('#profile-follow-btn')){
            document.querySelector("#profile-follow-btn").innerHTML = "Unfollow";
        }else if(document.querySelector('#profile-follow-btn')){
            document.querySelector("#profile-follow-btn").innerHTML = "Follow";
        }
    })
}

function load_posts(set){
    fetch(`../posts/${set}`)
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
// define the structure of a postContainer that should be created
function createPostDivs(post){
    let postContainer = document.createElement('div');
    let postCreator = document.createElement('div');
    let postContent = document.createElement('div');
    let postLikes = document.createElement('div');
    let postTimestamp = document.createElement('div');
    let editButton = document.createElement('BUTTON');
    let likeButton = document.createElement('button');   


    postId = post.postId   
    // fetch likes per post when Like/Unlike is clicked
    postIdString = `${postId}+fetch`
    fetchLikes(postIdString,postLikes,likeButton)

    //create like button and fetch likes when clicked
    likeButton.className = "m-2 btn btn-primary"
    likeButton.innerHTML = "Like"
    likeButton.dataset.creatorId = post.creatorId;
    likeButton.dataset.postId = post.postId;
    likeButton.addEventListener('click', () => {
        // fetch likes per post when Like/Unlike is clicked
        postIdString = `${likeButton.dataset.postId}+change`
        fetchLikes(postIdString,postLikes,likeButton)
    })

    postContainer.className ="m-2  border-primary rounded bg-light";
    postCreator.className ="m-2";
    postContent.className ="m-2";
    postLikes.className ="m-2";
    postTimestamp.className ="m-2";
    editButton.className="m-2 btn btn-info"

    postContainer.setAttribute("name","post-container");
    postCreator.setAttribute("name","post-creator");
    postContent.setAttribute("name","post-content");
    postLikes.setAttribute("name","post-likes");
    postTimestamp.setAttribute("name","post-timestamp");
    editButton.name = "editButton"


    postCreator.innerHTML = `<u><b> <a href="/profile/${post.creatorId}"> ${post.creator} </a>  </b></u> `;
    postContent.innerHTML = `${post.content}`
    postLikes.innerHTML = `<br> Likes: ${post.likes}`
    postTimestamp.innerHTML = `<i> Created: ${post.timestamp} </i>`
    
    editButton.innerHTML = "Edit"
    editButton.dataset.creatorId = post.creatorId;
    editButton.dataset.postId = post.postId;

    postContainer.dataset.postId = post.postId;

    // when EDIT button is clicked
    editButton.addEventListener('click', () => {
        if(document.querySelector("#currUserUsername").innerHTML != `<strong>${editButton.dataset.creatorId}</strong>`){
            /*
                Add code to hide the post and instead open up a textfield with the posts content as prefilled value
            */
            // get post container
            postContainer = editButton.parentNode
            // get post ID
            postId = editButton.dataset.postId
            // replace post container content with a form to input modified content 
            postContainer.innerHTML = ""

            // configure modification form
            modifyPostContainer = document.createElement('div')
            modifyPostContainer.id = "modifyPostContainer"
            modifyPostContainer.className = "border"

            modifyPostForm = document.createElement('form')
            modifyPostForm.id = "modifyPostForm"
            modifyPostForm.className = "m-2"

            modifyPostFormGroup = document.createElement('div')
            modifyPostFormGroup.className = "form-group"

            textInputLabel = document.createElement('label')
            textInputLabel.innerHTML = "Modify Post"

            textInput = document.createElement('textarea')
            textInput.id = "modifyPost-content"
            textInput.className = "form-control"
            textInput.value = postContent.innerHTML

        	submitButton = document.createElement('input')
            submitButton.type = "submit"
            submitButton.id = "modifyPost-submit"
            submitButton.className = "btn btn-primary mt-2"
            submitButton.value = "Submit"

            // structure form in the right hirarchy, bottom to top
            modifyPostFormGroup.appendChild(textInputLabel)
            modifyPostFormGroup.appendChild(textInput)
            modifyPostFormGroup.appendChild(submitButton)
            modifyPostForm.appendChild(modifyPostFormGroup)
            modifyPostContainer.appendChild(modifyPostForm)

            postContainer.appendChild(modifyPostContainer)

            submitButton.addEventListener('click', modifyPost)
        }
    })

    postContainer.appendChild(postCreator);
    postContainer.appendChild(document.createElement("br"))
    postContainer.appendChild(postContent);
    postContainer.appendChild(postLikes);
    postContainer.appendChild(likeButton);
    postContainer.appendChild(postTimestamp);
    if (document.querySelector("#currUserUsername").innerHTML == `<strong>${post.creator}</strong>`){
        // hide edit button if user is not creator of a post
        postContainer.appendChild(editButton);
    }

    return postContainer;
}


function fetchLikes(postIdString,postLikes,likeButton){
    fetch(`../likes/${postIdString}`,)
    .then(response => response.json())
    .then(likedPost => {
        numLikes = likedPost.numLikes
        userLikesPost = likedPost.userLikesPost
        postLikes.innerHTML = `<br> Likes: ${numLikes}`
        if(userLikesPost == true){
            likeButton.innerHTML = "Unlike"
        }else{
            likeButton.innerHTML = "Like"
        }
    })

}

// modify existing post
function modifyPost() {
    // post Post if form has been submitted
    document.querySelector('#modifyPostForm').onsubmit = event => {
        event.preventDefault();
    }
    let modifiedPostContent = document.querySelector('#modifyPost-content').value;
    
    fetch(`../modifyPost/${postId}`, {
        method: 'POST',
        //headers to enable the csrf_token functionality
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            modifiedPostContent: modifiedPostContent,
            postId: postId,
            credentials: 'same-origin',
        })
    })
    .then(response => response.json())
    .then(modifiedPost => {
            // receive modified post Json and assign values to modified Post variable
            modifiedPost = modifiedPost[0]
            modifiedPostContainer = createPostDivs(modifiedPost)
            firstElement = document.querySelector('#listPosts-view').firstElementChild;
            document.querySelector('#listPosts-view').insertBefore(modifiedPostContainer,firstElement);
            
            // remove all modification input fields
            document.querySelectorAll('#modifyPostContainer').forEach(modifyPostInputField => {
                modifyPostInputField.innerHTML=""
            })
    })
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