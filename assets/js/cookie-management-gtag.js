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
    });

var trackingId = window.GA_TRACKING_ID;
var anonymizeIp = window.ANONYMIZE_IP;
async("https://www.googletagmanager.com/gtag/js?id=" + trackingId, function () {
	window.dataLayer = window.dataLayer || [];
	function gtag () { window.dataLayer.push(arguments); }
	gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'wait_for_update': 1000
    });
	gtag('js', new Date());        
	gtag('config', trackingId, {'anonymize_ip': anonymizeIp});
	window.gtag = gtag;
});

Object.defineProperty(window, 'loadGaScript', {
    configurable: false,
    get () {
        return function (...args) {
            window.gtag('consent', 'update', {
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'ad_storage': 'granted',
                'analytics_storage': 'granted'
            });
        };
    },
    set (value) {
    }
});

Object.defineProperty(window, 'loadGaScript', {
    configurable: false,
    get () {
        return function (...args) {
            var script = document.createElement('script');
            script.async = true;
            script.src = 
            document.head.appendChild(script);

            async('www.googletagmanager.com/gtag/js?id=' + window.GA_TRACKING_ID, function () {
                window.dataLayer = window.dataLayer || [];
                function gtag () { window.dataLayer.push(arguments); }
                gtag('js', new Date());        
                gtag('config', window.GA_TRACKING_ID, {'anonymize_ip': window.ANONYMIZE_IP});
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