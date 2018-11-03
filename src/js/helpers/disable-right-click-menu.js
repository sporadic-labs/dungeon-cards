export default function disableRightClickMenu(id) {
  document.getElementById(id).addEventListener("contextmenu", e => {
    e.preventDefault();
    return false;
  });
}
