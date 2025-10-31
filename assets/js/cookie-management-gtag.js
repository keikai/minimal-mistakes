
fetch('https://www.zkoss.org/cookie_management.html').then(res => res.text())
    .then(html => {
        const parser = new DOMParser();
        const cookieConsentDialogElement = parser.parseFromString(html, 'text/html').body.firstElementChild;
        const anchorElement = document.getElementById('cookie-content');
        anchorElement.replaceWith(cookieConsentDialogElement);
        loadScript('https://www.zkoss.org/resource/js/page/cookieManagement.js');
    });

function loadScript (url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
}