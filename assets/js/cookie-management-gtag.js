// instantiation!
function async (u, c) {
    var d = document;
    var t = 'script';
    var o = d.createElement(t);
    var s = d.getElementsByTagName(t)[0];
    o.src = '//' + u;
    if (c) { o.addEventListener('load', function (e) { c(null, e); }, false); }
    s.parentNode.insertBefore(o, s);
}


fetch('https://www.zkoss.org/cookie_management.html').then(res => res.text())
    .then(html => {
        const parser = new DOMParser();
        const newElement = parser.parseFromString(html, 'text/html').body.firstElementChild;
        const oldElement = document.getElementById('cookie-content');
        oldElement.replaceWith(newElement);
        loadScript('https://www.zkoss.org/resource/js/page/cookieManagement.js');
        const policyUrl = document.getElementById('privacyPolicyUrl');
        if (policyUrl) {
            policyUrl.href = 'https://keikai.io/privacy';
        }
    });

Object.defineProperty(window, 'loadGaScript', {
    configurable: false,
    get () {
        return function (...args) {
            var trackingId = window.GA_TRACKING_ID;
            var anonymizeIp = window.ANONYMIZE_IP;

            var script = document.createElement('script');
            script.async = true;
            script.src = "https://www.googletagmanager.com/gtag/js?id=" + trackingId;
            document.head.appendChild(script);

            async('www.googletagmanager.com/gtag/js?id=' + trackingId, function () {
                window.dataLayer = window.dataLayer || [];
                function gtag () { window.dataLayer.push(arguments); }
                gtag('js', new Date());        
                gtag('config', trackingId, {'anonymize_ip': anonymizeIp});
                window.gtag = gtag;
            });
            
        }
    },
    set (value) {
    }
});

function loadScript (url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
}
