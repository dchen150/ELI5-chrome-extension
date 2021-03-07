const GitHubLink = "https://github.com/dchen150/ELI5-chrome-extension";
const DerekChen = "https://derekchen.dev/"
const FloraChen = "https://github.com/flora-yc/"
const JiajiaKong = "https://www.jiajiakong.ca/"
const TrumanHung = "http://trumanhung.tech/"


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
    [...Array(3).keys()].forEach(i => {
        let resultItem = resultItemTemplate.content.cloneNode(true);
        resultItem.querySelector(".resultContent").innerText = `APPEND RESULT HERE ${i}`;
        resultWrapper.appendChild(resultItem)
    });
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
    const derek = document.querySelector("#derek");
    const flora = document.querySelector("#flora");
    const jiajia = document.querySelector("#jiajia");
    const truman = document.querySelector("#truman");

    // Select text
    chrome.tabs.executeScript({
        code: jsCodeWrapper(getSelectedText)
    });

    // Create links
    caption.addEventListener('click', () => chrome.tabs.create({url: GitHubLink}));
    settings.addEventListener('click', () => chrome.tabs.create({'url': 'chrome://extensions/?options=' + chrome.runtime.id}));
    derek.addEventListener('click', () => chrome.tabs.create({url: DerekChen}));
    flora.addEventListener('click', () => chrome.tabs.create({url: FloraChen}));
    jiajia.addEventListener('click', () => chrome.tabs.create({url: JiajiaKong}));
    truman.addEventListener('click', () => chrome.tabs.create({url: TrumanHung}));

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


});
