(() => {

    const queryParameters = location.href.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentItem = urlParameters.get("id");

    let savedComments = []

    const getSavedComments = () => {
        return new Promise((resolve) => {
            chrome.storage.local.get([currentItem], (obj) => {
                var comments = obj[currentItem] ? JSON.parse(obj[currentItem]) : []
                for (let i = 0; i < comments.length; i++) {
                    comments[i].date = new Date(comments[i].date);
                }
                resolve(comments);
            });
        });
    };

    /**
     * 
     * @param {PointerEvent} ev 
     */
    const saveCommentEventHandler = async (ev) => {
        const newComment = {
            id: ev.currentTarget.getAttribute('data-id'),
            date: new Date(Date.now())
        }

        savedComments = await getSavedComments();
        savedComments.push(newComment);

        console.log(savedComments);

        chrome.storage.local.set({
            [currentItem]: JSON.stringify(savedComments.sort((a, b) => a.date.getTime() - b.date.getTime()))
        });
    };

    const newVideoLoaded = async () => {
        const commentTree = document.getElementsByClassName("comment-tree")[0];

        if (commentTree != undefined) {
            savedComments = await getSavedComments();

            const comments = commentTree.getElementsByClassName("athing comtr");

            for (let i = 0; i < comments.length; i++) {
                var head = comments.item(i).getElementsByClassName("comhead")[0];
                head.style.display = 'flex';
                head.style.alignItems = 'center';

                const addImg = document.createElement("img");
                addImg.src = chrome.runtime.getURL("assets/plus.png");
                addImg.width = '15';

                const saveBtn = document.createElement('button');
                saveBtn.onclick = saveCommentEventHandler;
                saveBtn.appendChild(addImg);
                saveBtn.setAttribute('data-id', comments.item(i).id)
                saveBtn.style.marginLeft = '5px';
                head.appendChild(saveBtn);
            }
        }
    };

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, itemId, commentId } = obj;

        if (type === "NEW") {
            currentItem = itemId;
            newVideoLoaded();
        } else if (type === "VIEW") {
            location.href = 'https://news.ycombinator.com/item?id=' + commentId;
        } else if (type === "DELETE") {
            savedComments = savedComments.filter((b) => b.id != commentId);
            chrome.storage.local.set({ [currentItem]: JSON.stringify(savedComments) });

            response(savedComments);
        }
    });

    newVideoLoaded();
})();
