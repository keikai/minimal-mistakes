
(async () => {
    try {
        const response = await fetch('https://www.zkoss.org/cookie_management.html');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const cookieConsentDialogElement = parser.parseFromString(html, 'text/html').body.firstElementChild;
        const anchorElement = document.getElementById('cookie-content');

        if (anchorElement && cookieConsentDialogElement) {
            anchorElement.replaceWith(cookieConsentDialogElement);
            loadScript('https://www.zkoss.org/resource/js/page/cookieManagement.js');
        } else if (!anchorElement) {
            console.error('Cookie management anchor element "#cookie-content" not found.');
        }
    } catch (error) {
        console.error('Failed to load cookie management component:', error);
    }
})();

function loadScript (url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true; // Be explicit about async loading
    document.head.appendChild(script);
}