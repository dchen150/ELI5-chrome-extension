const GitHubLink = "https://github.com/dchen150/ELI5-chrome-extension";

/* The function that finds and returns the selected text */
const getSelectedText = function () {
    const {baseOffset, focusOffset} = window.getSelection();
    const selected = Math.abs(baseOffset - focusOffset) > 0;
    let selectedText = selected ? window.getSelection().getRangeAt(0).cloneContents().textContent || "" : ""
    selectedText = selectedText.replace(/[\r\n]+/g, " ");
    chrome.storage.sync.set({selectedText}); // storing the selected text globally
};

/* This line converts the above function to string
 * (and makes sure it will be called instantly) */
const jsCodeWrapper = callbackFunc => ';(' + callbackFunc + ')();';


// Wrap pop-up related event here!!
window.addEventListener('DOMContentLoaded', function () {
    // Select text
    chrome.tabs.executeScript({
        code: jsCodeWrapper(getSelectedText)
    });

    // Header caption
    const caption = document.querySelector("#caption")
    caption.addEventListener('click', () => chrome.tabs.create({url: GitHubLink}));

    // Header settings logo
    const settings = document.querySelector("#settings")
    settings.addEventListener('click', () => chrome.tabs.create({'url': 'chrome://extensions/?options=' + chrome.runtime.id}));

    // You search for...
    // const queryTerm = document.querySelector('#query');
    chrome.storage.sync.get(['selectedText'], function (result) {
        if (result.selectedText) {
            // append query display
            const resultWrapper = document.querySelector(".resultWrapper");
            const queryDisplayTemplate = document.querySelector("#queryDisplay");
            let queryDisplay = queryDisplayTemplate.content.cloneNode(true);
            queryDisplay.querySelector("#query").innerText = result.selectedText;
            resultWrapper.appendChild(queryDisplay);

            const resultItemTemplate = document.querySelector("#resultItem");
            [...Array(3).keys()].forEach(i => {
                let resultItem = resultItemTemplate.content.cloneNode(true);
                resultItem.querySelector(".resultContent").innerText = `APPEND RESULT HERE ${i}`;
                resultWrapper.appendChild(resultItem)
            });

        }
    });


    // Search button
    const searchBtn = document.querySelector('.searchButton');
    searchBtn.addEventListener('click', function () {
        chrome.tabs.executeScript({
            code: `alert("Search btn clicked");`
        })
    }, false);

});
