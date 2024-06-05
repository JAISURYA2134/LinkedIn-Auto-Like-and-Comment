document.addEventListener('DOMContentLoaded', () => {
    const likeCountInput = document.getElementById('likeCount');
    const commentCountInput = document.getElementById('commentCount');
    const startButton = document.getElementById('startButton');

    function updateButtonState() {
        if (likeCountInput.value && commentCountInput.value) {
            startButton.disabled = false;
        } else {
            startButton.disabled = true;
        }
    }

    likeCountInput.addEventListener('input', updateButtonState);
    commentCountInput.addEventListener('input', updateButtonState);

    startButton.addEventListener('click', () => {
        const likeCount = parseInt(likeCountInput.value, 10);
        const commentCount = parseInt(commentCountInput.value, 10);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            let feedTab = tabs.find(tab => tab.url.includes("https://www.linkedin.com/feed/"));

            if (feedTab) {
                // LinkedIn feed tab is already open
                runScriptOnFeedTab(feedTab.id, likeCount, commentCount);
            } else {
                // Open LinkedIn feed in a new tab
                chrome.tabs.create({ url: "https://www.linkedin.com/feed/" }, (newTab) => {
                    // Wait for the new tab to load and then execute the script
                    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                        if (tabId === newTab.id && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            runScriptOnFeedTab(newTab.id, likeCount, commentCount);
                        }
                    });
                });
            }
        });
    });

    function runScriptOnFeedTab(tabId, likeCount, commentCount) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }, () => {
            chrome.tabs.sendMessage(tabId, { likeCount, commentCount }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                } else {
                    console.log(response);
                    if (response.status) {
                        console.log(response.status);
                    } else {
                        console.error('Unexpected response format:', response);
                    }
                }
            });
        });
    }
});
