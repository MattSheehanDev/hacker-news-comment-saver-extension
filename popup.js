export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}

const viewComments = (currentItemComments = []) => {
    const commentsElement = document.getElementById("comments");
    commentsElement.innerHTML = "";

    if (currentItemComments.length > 0) {
        for (let i = 0; i < currentItemComments.length; i++) {
            const comment = currentItemComments[i];

            const commentElement = document.createElement("div");
            commentElement.id = comment.id;
            commentElement.className = "comment";

            const titleElement = document.createElement("div");
            titleElement.textContent = comment.id;
            titleElement.className = "comment-title";
            commentElement.appendChild(titleElement);

            const controlsElement = document.createElement("div");
            controlsElement.className = "comment-controls";

            // view button
            const viewElement = document.createElement("img");
            viewElement.src = "assets/view.png";
            viewElement.title = 'view';
            viewElement.addEventListener("click", onView);
            controlsElement.appendChild(viewElement);
            // delete button
            const deleteElement = document.createElement("img");
            deleteElement.src = "assets/trash.png";
            deleteElement.title = 'play';
            deleteElement.addEventListener("click", onDelete);
            controlsElement.appendChild(deleteElement);

            commentElement.appendChild(controlsElement);

            commentsElement.appendChild(commentElement);
        }
    }
    else {
        commentsElement.innerHTML = '<i class="row">No saved comments</i>';
    }

    return;
};

/**
 * 
 * @param {PointerEvent} ev 
 */
const onView = async (ev) => {
    const commentId = ev.target.parentNode.parentNode.id
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "VIEW",
        commentId: commentId,
    });
};

/**
 * 
 * @param {PointerEvent} ev 
 */
const onDelete = async (ev) => {
    const activeTab = await getActiveTabURL();

    const commentId = ev.target.parentNode.parentNode.id
    const commentElement = document.getElementById(commentId);

    commentElement.parentNode.removeChild(commentElement);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        commentId: commentId,
    }, viewComments);
};


document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentItem = urlParameters.get("id");

    if (activeTab.url.includes("news.ycombinator.com/item") && currentItem) {
        chrome.storage.local.get([currentItem], (data) => {
            console.log(data)
            const currentSavedComments = data[currentItem] ? JSON.parse(data[currentItem]) : [];

            viewComments(currentSavedComments);
        });
    }
    else {
        const container = document.getElementsByClassName("container")[0];

        container.innerHTML = `<div class="title">No saved comments for item ${currentItem} </div>`;
    }
});

