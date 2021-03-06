/* The function that finds and returns the selected text */
const getSelectedText = function () {
    const {baseOffset, focusOffset} = window.getSelection();
    const selected = Math.abs(baseOffset - focusOffset) > 0;
    const selectedText = selected ? window.getSelection().getRangeAt(0).cloneContents().textContent : ''
    console.log(selectedText);
    return selectedText;
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

    // Search
    const searchBtn = document.querySelector('.searchButton')
    searchBtn.addEventListener('click', function () {
        chrome.tabs.executeScript({
            code: `alert("Search btn clicked");`
        })
    }, false);

});
