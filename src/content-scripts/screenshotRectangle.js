import interact from 'interactjs';

/**
 * Updates the element's position on the page while the element is being dragged
 * Function required by InteractJS
 * @param {Event} event drag browser event
 * @returns {void}
 */
function dragMoveListener(event) {
  var target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.webkitTransform = target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // update the position attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

window.dragMoveListener = dragMoveListener;

/**
 * Attaches 4 modern styled corners on the element
 * @param {Element} element on which element the corners should be attached
 * @returns {void}
 */
function initCorners(element) {
  const cornerIDs = [
    'corner-top-left',
    'corner-top-right',
    'corner-bottom-left',
    'corner-bottom-right'
  ];

  // Attach 4 corners with their respective IDs
  for (const cornerId of cornerIDs) {
    const corner = document.createElement('div');
    corner.id = cornerId;
    element.appendChild(corner);
  }
}

/**
 * Creates a message inside of the element
 * @param {Element} element on which element message should be attached
 * @returns {void}
 */
function initUsageMessage(element) {
  const messageEl = document.createElement('div');
  messageEl.id = 'screenshot-rectangle-message';
  messageEl.textContent = 'Press "Enter" to Tweet!';

  element.appendChild(messageEl);
}

/**
 * Removes rectangle's usage message
 * @returns {Object} Remove message element or null if the message is not present
 */
function removeUsageMessage() {
  const usageMessageEl = document.querySelector(
    '#screenshot-rectangle-message'
  );

  if (usageMessageEl) {
    usageMessageEl.remove();
  }

  return usageMessageEl;
}

/**
 * The main "factory" function responsible for
 * creating screenshot rectangle elements
 * @returns {Element} Screenshot Rectangle Element
 */
export default () => {
  // Create screenshot rectangle
  const screenshotRectangleEl = document.createElement('div');
  screenshotRectangleEl.id = 'screenshot-rectangle';

  // Library responsible for dragging and resizing rectangle
  interact(screenshotRectangleEl)
    .resizable({
      // resize from all edges and corners
      edges: {
        left: true,
        right: true,
        bottom: true,
        top: true
      },

      listeners: {
        move(event) {
          var target = event.target;
          var x = parseFloat(target.getAttribute('data-x')) || 0;
          var y = parseFloat(target.getAttribute('data-y')) || 0;

          // update the element's style
          target.style.width = event.rect.width + 'px';
          target.style.height = event.rect.height + 'px';

          // translate when resizing from top or left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;

          target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }
      },
      modifiers: [
        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 }
        })
      ],

      inertia: false
    })
    .draggable({
      listeners: { move: window.dragMoveListener },
      inertia: false
    });

  screenshotRectangleEl.addEventListener('click', removeUsageMessage);
  initCorners(screenshotRectangleEl);
  initUsageMessage(screenshotRectangleEl);

  return screenshotRectangleEl;
};
