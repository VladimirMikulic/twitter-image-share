/**
 * Injects assets when the extenion's icon has been clicked
 */
chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript({ file: 'dist/main.js' });
  chrome.tabs.insertCSS(tab.id, { file: 'src/css/styles.css' });
});

/**
 * Pastes the clipboard content (image) when called from content script
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  chrome.tabs.query({ active: true }, function (tabs) {
    const twitterTab = tabs[0];

    // Paste image into the tweet modal
    chrome.tabs.executeScript(twitterTab.id, {
      code: 'document.execCommand("paste")'
    });
  });

  sendResponse();
});
