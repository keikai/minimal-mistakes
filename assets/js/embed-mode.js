(function () {
  try {
    var qs = new URLSearchParams(window.location.search);
    var inIframe = window.self !== window.top;
    if (qs.get('embed') === '1' || inIframe) {
      document.documentElement.classList.add('embed-mode');
    }
  } catch (e) { /* noop */ }
})();
