chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { likeCount, commentCount } = request;
    let liked = 0;
    let commented = 0;

    const posts = document.querySelectorAll('.feed-shared-update-v2');

    function reactToPost(post) {
        return new Promise((resolve) => {
            const likeButton = post.querySelector('.react-button__trigger');
            if (likeButton) {
                likeButton.click();
                liked++;
            }
            resolve();
        });
    }

    function commentOnPost(post) {
        return new Promise((resolve) => {
            const commentButton = post.querySelector('.comments-comment-box__trigger');
            if (commentButton) {
                commentButton.click();
                setTimeout(() => {
                    const commentBox = post.querySelector('.comments-comment-box__editor');
                    if (commentBox) {
                        commentBox.focus();
                        commentBox.innerHTML = 'CFBR';
                        
                        // Trigger input events to simulate user input
                        const inputEvent = new Event('input', { bubbles: true });
                        commentBox.dispatchEvent(inputEvent);

                        setTimeout(() => {
                            const submitButton = post.querySelector('.comments-comment-box__submit-button');
                            if (submitButton) {
                                submitButton.click();
                                commented++;
                            }
                            resolve();
                        }, 1000); // Ensure the comment is entered before clicking submit
                    } else {
                        resolve();
                    }
                }, 2000); // Ensure the comment box is rendered
            } else {
                resolve();
            }
        });
    }

    async function processPosts() {
        for (let post of posts) {
            if (liked < likeCount) {
                await reactToPost(post);
            }

            if (commented < commentCount) {
                await commentOnPost(post);
            }

            if (liked >= likeCount && commented >= commentCount) {
                break;
            }
        }

        sendResponse({ status: 'done' });
    }

    processPosts().then(() => {
        sendResponse({ status: 'done' });
    }).catch((error) => {
        console.error('Error processing posts:', error);
        sendResponse({ status: 'error', message: error.message });
    });

    return true; // Indicates that the response will be sent asynchronously
});
