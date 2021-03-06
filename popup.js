/* The function that finds and returns the selected text */
var funcToInject = function() {
  var range = window.getSelection().getRangeAt(0);
  var selectedText = range.cloneContents().textContent;
  console.log(selectedText);
  return selectedText;
};

/* This line converts the above function to string
 * (and makes sure it will be called instantly) */
var jsCodeStr = ';(' + funcToInject + ')();';

window.addEventListener('DOMContentLoaded', function() {

    chrome.tabs.executeScript({
        code: jsCodeStr
    });
});