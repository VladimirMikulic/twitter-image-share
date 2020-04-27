// The file runs when the extension's icon is clicked
// Better approach would be to convert the area x,y width, height to canvas
// without using the library like this extension does https://github.com/mashtullah/cropshot
import html2canvas from 'html2canvas';
import initScreenshotRectangle from './screenshotRectangle';

/**
 * Takes screenshot of the are marked by screenshotRectangle element
 * @param {Element} screenshotRectangle element that marks area for screenshot
 * @returns {String} generated image data url
 */
async function takeScreenshot(screenshotRectangle) {
  // Temporarily hide the rectangle element (so it's not included in the image)
  screenshotRectangle.style.opacity = 0;

  const canvas = await html2canvas(document.body, {
    // Library misses x axis by ~8px so it is necessary to add it manually
    allowTaint: true,
    x: screenshotRectangle.getBoundingClientRect().x + 8,
    y: screenshotRectangle.getBoundingClientRect().y,
    scrollY: document.body.getBoundingClientRect().y,
    width: screenshotRectangle.clientWidth,
    height: screenshotRectangle.clientHeight,
    useCORS: true
  });

  const imageUrl = canvas.toDataURL('image/png');
  screenshotRectangle.style.opacity = 1;

  return imageUrl;
}

/**
 * Converts binary string to array buffer
 * @param {String} binary binary string
 * @returns {ArrayBuffer}
 */
function binaryToArrayBuffer(binary) {
  const length = binary.length;
  let buffer = new ArrayBuffer(length);
  let arr = new Uint8Array(buffer);

  for (let i = 0; i < length; i++) {
    arr[i] = binary.charCodeAt(i);
  }

  return buffer;
}

/**
 * Converts image data url to Blob and attaches it to clipboard
 * @param {String} imageDataUrl required for conversion to binary and late to Blob
 * (large collection of binary data) suitable for images
 * @returns {Blob} image blob that has been attached to clipboard
 */
async function attachImageToClipboard(imageDataUrl) {
  const base64InBinary = atob(imageDataUrl.split('base64,')[1]);
  const arrayBuffer = binaryToArrayBuffer(base64InBinary);
  const imageBlob = new Blob([arrayBuffer], { type: 'image/png' });

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': imageBlob
    })
  ]);

  return imageBlob;
}

/**
 * Opens a new Twitter tab with "Compose tweet" modal open
 * with page link and image included in the tweet
 * @param {String} pageLink link to the page where picture was taken
 * @returns {void}
 */
async function postTweet(pageLink, imageUrl) {
  // Attach image to clipboard and read it
  await attachImageToClipboard(imageUrl);
  await navigator.clipboard.read();

  window.open(`https://twitter.com/compose/tweet?text=${pageLink}`);

  // Wait for page to load, ~2500ms
  setTimeout(() => {
    chrome.runtime.sendMessage({}, response => {});
  }, 2500);
}

/**
 * Removes DOM element
 * @param {Element} element DOM element to remove
 * @returns {Object} Removed element or null if the element doesn't exist
 */
function removeElement(element) {
  try {
    element.remove();
    return element;
  } catch (error) {
    // Element doesn't exist, no action needed
    return null;
  }
}

/**
 * The main logic & controls of the extension
 */
(function main() {
  const screenshotRectangle = initScreenshotRectangle();
  const existingRectangle = document.querySelector(
    `#${screenshotRectangle.id}`
  );

  // Toggles Screenshot Rectangle when user clicks on extension's icon
  if (existingRectangle) {
    return removeElement(existingRectangle);
  }

  document.body.appendChild(screenshotRectangle);

  // Extension's keyboard controls
  document.body.addEventListener('keyup', async e => {
    if (e.key === 'Enter') {
      const imageUrl = await takeScreenshot(screenshotRectangle);

      await postTweet(window.location.href, imageUrl);
      console.clear();
    } else if (e.key === 'Escape') {
      removeElement(screenshotRectangle);
    }
  });
})();
