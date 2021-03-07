const GitHubLink = "https://github.com/dchen150/ELI5-chrome-extension";

/* The function that finds and returns the selected text */
const getSelectedText = function () {
    const {baseOffset, focusOffset} = window.getSelection();
    const selected = Math.abs(baseOffset - focusOffset) > 0;
    let selectedText = selected ? window.getSelection().getRangeAt(0).cloneContents().textContent || "" : ""
    selectedText = selectedText.replace(/[\r\n]+/g, " ").trim();
    chrome.storage.sync.set({selectedText}); // storing the selected text globally

};

/* This line converts the above function to string
 * (and makes sure it will be called instantly) */
const jsCodeWrapper = callbackFunc => ';(' + callbackFunc + ')();';


function generateQueryDisplay(selectedText) {
    const resultWrapper = document.querySelector(".resultWrapper");
    resultWrapper.innerHTML = '';   // clear
    const queryDisplayTemplate = document.querySelector("#queryDisplay");
    let queryDisplay = queryDisplayTemplate.content.cloneNode(true);
    queryDisplay.querySelector("#query").innerText = selectedText;
    resultWrapper.appendChild(queryDisplay);

    const resultItemTemplate = document.querySelector("#resultItem");
    const questionAndAnswerTemplate = document.querySelector("#questionAndAnswer");

    try {
        fetch("https://us-central1-eli5-chrome-extension.cloudfunctions.net/findEntities", {
            method: "POST",
            body: JSON.stringify({"text": selectedText}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                const {redditELI5, redditExplained, stackOverFlow, wiki} = data;

                function add(result, link) {
                    let resultItem = resultItemTemplate.content.cloneNode(true);
                    resultItem.querySelector(".resultContent").innerHTML = result;
                    resultItem.querySelector(".source a").href = link;
                    const source = document.createTextNode(`Wikipedia`);
                    resultItem.querySelector(".source a").appendChild(source)
                    resultWrapper.appendChild(resultItem)
                }


                if (redditExplained && redditExplained[0] && redditExplained[0][0]) {
                    console.log("Found redditExplained result", redditExplained[0][0]);
                    const {subreddit, title, comments_url} = redditExplained[0][0];

                    fetch(comments_url)
                        .then(res => res.json())
                        .then(data => {
                            let comment = data[1]?.data?.children[0]?.data;
                            if (!comment) return
                            console.log("Found redditExplained answer", comment)

                            const {author_fullname, body, body_html, permalink} = comment;

                            let resultItem = questionAndAnswerTemplate.content.cloneNode(true);
                            const newContent = document.createTextNode(title);
                            resultItem.querySelector(".question").appendChild(newContent);


                            var txt = document.createElement("textarea");
                            txt.innerHTML = body_html;
                            decoded_html = txt.value;


                            resultItem.querySelector(".answer").innerHTML = decoded_html;
                            const source = document.createTextNode(`${author_fullname} on redditExplained`);
                            resultItem.querySelector(".source a").href = "https://www.reddit.com/" + permalink;
                            resultItem.querySelector(".source a").appendChild(source)
                            resultWrapper.appendChild(resultItem);

                        });
                }

                if (redditELI5 && redditELI5[0] && redditELI5[0][0]) {
                    console.log("Found redditELI5 result", redditELI5[0][0]);
                    const {subreddit, title, comments_url} = redditELI5[0][0];

                    fetch(comments_url)
                        .then(res => res.json())
                        .then(data => {
                            let comment = data[1]?.data?.children[0]?.data;
                            if (!comment) return
                            console.log("Found redditELI5 answer", comment)

                            const {author_fullname, body, body_html, permalink} = comment;

                            let resultItem = questionAndAnswerTemplate.content.cloneNode(true);
                            const newContent = document.createTextNode(title);
                            resultItem.querySelector(".question").appendChild(newContent);


                            var txt = document.createElement("textarea");
                            txt.innerHTML = body_html;
                            decoded_html = txt.value;


                            resultItem.querySelector(".answer").innerHTML = decoded_html;
                            const source = document.createTextNode(`${author_fullname} on redditELI5`);
                            resultItem.querySelector(".source a").href = "https://www.reddit.com/" + permalink;
                            resultItem.querySelector(".source a").appendChild(source)
                            resultWrapper.appendChild(resultItem);

                        });
                }

                if (stackOverFlow[0][0]) {
                    console.log("Found stackoverflow result", stackOverFlow[0][0]);
                    const {title, accepted_answer_id} = stackOverFlow[0][0];

                    fetch(`https://api.stackexchange.com/2.2/answers/${accepted_answer_id}?order=desc&sort=activity&site=stackoverflow&filter=!*JxbirhO10oHzPUa`)
                        .then(res => res.json())
                        .then(data => {
                            console.log("Found stackoverflow answer", data.items[0])
                            const {answer_id, body, link} = data.items[0];
                            // { "display_name": "jfriend00", "link": "https://stackoverflow.com/users/816620/jfriend00" }
                            const answerPerson = data.items[0].owner;

                            const stackTemplate = `<strong>Question: </strong>${title}<br/><strong>Answer: </strong> ${stackOverFlow[0][0].text}`

                            console.log(title)

                            let resultItem = questionAndAnswerTemplate.content.cloneNode(true);
                            const newContent = document.createTextNode(title);
                            resultItem.querySelector(".question").appendChild(newContent);
                            resultItem.querySelector(".answer").innerHTML = body;
                            const source = document.createTextNode(`${answerPerson.display_name} on Stackoverflow`);
                            resultItem.querySelector(".source a").href = link;
                            resultItem.querySelector(".source a").appendChild(source)
                            resultWrapper.appendChild(resultItem);

                        });

                }

                wiki[0][0] && add(wiki[0][0].text, wiki[0][0].url);
            });
    } catch (err) {
        console.error(err)

    }
}

// Wrap pop-up related event here!!
window.addEventListener('DOMContentLoaded', function () {
    const caption = document.querySelector("#caption")
    const settings = document.querySelector("#settings")
    const searchTerm = document.querySelector('#searchTerm');
    const searchBtn = document.querySelector('.searchButton');
    const response = document.querySelector('#response');
    const clearBtn = document.querySelector('.close-icon');
    const resultWrapper = document.querySelector(".resultWrapper");
    const goose = document.querySelector("#gooseHelper");
    const speechBubble = document.querySelector(".speech-bubble");

    // Select text
    chrome.tabs.executeScript({
        code: jsCodeWrapper(getSelectedText)
    });

    // Create links
    caption.addEventListener('click', () => chrome.tabs.create({url: GitHubLink}));
    settings.addEventListener('click', () => chrome.tabs.create({'url': 'chrome://extensions/?options=' + chrome.runtime.id}));

    // You search for...
    chrome.storage.sync.get(['selectedText'], function (result) {
        if (result.selectedText) {
            generateQueryDisplay(result.selectedText);
            response.style.display = 'block';
            searchTerm.style.display = 'none';
            searchBtn.style.display = 'none'
            clearBtn.style.display = 'inline-block';
        }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        resultWrapper.innerHTML = '';   // clear
        response.style.display = 'none';
        searchTerm.style.display = 'block';
        searchBtn.style.display = 'block'
        clearBtn.style.display = 'none';
    });

    // Search button
    searchBtn.addEventListener('click', function () {
        // generateQueryDisplay(searchTerm.value)
        // response.style.display = 'block';
        // searchTerm.style.display = 'none';
        // searchBtn.style.display = 'none'
        // searchBtn.disabled = true;
        // searchTerm.value = null
    }, false);

    // Search bar
    searchTerm.addEventListener('input', (event) => {
        let selectedText = event.target.value.replace(/[\r\n]+/g, " ").trim();
        chrome.storage.sync.set({selectedText}); // storing the selected text globally
        searchBtn.disabled = !selectedText

    });

    goose.addEventListener('click', () => {
        console.log(speechBubble.style.visibility)
        const audio = new Audio('goose.mp3');
        audio.play();
        if (speechBubble.style.visibility === 'visible') {
            speechBubble.style.visibility = 'hidden';
            speechBubble.style.opacity = '0';


            goose.style.transform = 'None';
            goose.style.height = '80px';
            goose.style.bottom = '-8px';
        } else {
            speechBubble.style.visibility = 'visible';
            speechBubble.style.opacity = '1';

            goose.style.transform = 'rotate(-13deg)';
            goose.style.height = '160px';
            goose.style.bottom = '-13px';
        }
    });


});
