const GitHubLink = "https://github.com/dchen150/ELI5-chrome-extension";

/* The function that finds and returns the selected text */
const getSelectedText = function () {
    const {baseOffset, focusOffset} = window.getSelection();
    const selected = Math.abs(baseOffset - focusOffset) > 0;
    const selectedText = selected ? window.getSelection().getRangeAt(0).cloneContents().textContent : null
    chrome.storage.sync.set({ selectedText }); // storing the selected text globally
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

    const header = document.querySelector(".header")
    header.addEventListener('click', () => chrome.tabs.create({url: GitHubLink}));

    const searchTerm = document.querySelector('.searchTerm');
    chrome.storage.sync.get(['selectedText'], function(result) {
        searchTerm.value = result.selectedText;
    });


    // Search
    const searchBtn = document.querySelector('.searchButton')
    searchBtn.addEventListener('click', function () {
        chrome.tabs.executeScript({
            code: `alert("Search btn clicked");`
        })
    }, false);

});
