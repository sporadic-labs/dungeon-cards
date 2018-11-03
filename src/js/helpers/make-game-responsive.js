import resizeEvent from "./resize-listener";

/**
 * Make the game responsive by resizing the root of page to be the biggest square that can fit. The
 * size of the menu and game inherit from this size. Note: since we don't provide the ability to
 * "quit" the game without navigating away from the page, this function does NOT have a way to
 * unsubscribe and clean up after itself.
 *
 * @export
 * @param {string} rootId
 */
export default function makeGameResponsive(rootId, minSize = 0, maxSize = Number.MAX_SAFE_INTEGER) {
  const rootElement = document.getElementById(rootId);
  const resize = () => resizeToFitWindow(rootElement, minSize, maxSize);

  resize();
  resizeEvent.addListener(resize);
}

function resizeToFitWindow(root, minSize, maxSize) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  let size = Math.min(width, height);
  if (size < minSize) size = minSize;
  else if (size > maxSize) size = maxSize;
  root.style.width = `${size}px`;
  root.style.height = `${size}px`;
}
