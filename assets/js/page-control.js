/**
 * scroll the current selected page link into view in the sidebar
 */
var showCurrentPageLinkInView = function () {
  if (isSidebarRendered()) {
    if (hasVerticalScrollbar(document.querySelector(".sidebar"))) {
      document.querySelector(".sidebar .active").scrollIntoView();
    }
    return;
  }

  window.requestAnimationFrame(showCurrentPageLinkInView);
};
// IE10 or above
window.requestAnimationFrame(showCurrentPageLinkInView);


function hasVerticalScrollbar(element) {
  return element.scrollHeight > element.clientHeight;
}

function isSidebarRendered() {
  return document.body //detect the body is loaded
    && document.querySelector('.sidebar');
}
