/**
 * scroll the current selected page link into view in the sidebar
 */
var showCurrentPageLinkInView = function () {
  if (isSidebarRendered()) {
    if (isVisibleInSidebar()) {
      return;
    }
    if (!hasVerticalScrollbar(getSidebar())) {
      return;
    }
    scrollActivePageIntoView();
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
    && getSidebar();
}

function isVisibleInSidebar() {
  const activeLinkRect = getActiveLink().getBoundingClientRect();
  const sidebarRect = getSidebar().getBoundingClientRect();

  return (
    activeLinkRect.top >= sidebarRect.top &&
    activeLinkRect.left >= sidebarRect.left &&
    activeLinkRect.bottom <= sidebarRect.bottom &&
    activeLinkRect.right <= sidebarRect.right
  );
}

/**
 * activePageItem.scrollIntoView() scrolls the content area too. Hence, setting the scrollTop of the sidebar to scroll sidebar only
 */
function scrollActivePageIntoView() {
  const sidebar = getSidebar();

  sidebar.scrollTop = getActiveLink().offsetTop - sidebar.offsetTop;
}

function getActiveLink() {
  return document.querySelector(".sidebar .active");
}

function getSidebar() {
  return document.querySelector('.sidebar');
}
