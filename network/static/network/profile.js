document.addEventListener('DOMContentLoaded',function(){
    profileUsername = document.querySelector('#profile-creator').textContent;
    if (document.querySelector('#profile-follow-btn')){
        document.querySelector('#profile-follow-btn').addEventListener('click', () => {
            followUnfollow(profileUsername);
        });
    }
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

    postCreator.innerHTML = `<u><b>${post.creator}</b></u>`;
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