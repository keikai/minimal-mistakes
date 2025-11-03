document.addEventListener('DOMContentLoaded', function () {
    (function () {
        const GA_MEASUREMENT_ID = window.GA_TRACKING_ID; // from provider
        const DEV_HOST = 'http://localhost:8080';
        const PROD_HOST = 'https://www.zkoss.org';
        /** use deferred to wait for the util to finish loading before executing loadGaForMeasurementId */
        window.cookieManagementUtil = window.cookieManagementUtil || { loaded: $.Deferred() };
        let host = window.location.host === 'localhost:8080' ? DEV_HOST : PROD_HOST;
        let debugging = false;
        fetch(host + '/cookie_management.html', {mode: 'cors'}).then(res => res.text())
            .then(html => {
                if (debugging) {
                    console.debug('adding cookie popup html to page');
                }
                const parser = new DOMParser();
                const newElement = parser.parseFromString(html, 'text/html').body.firstElementChild;
                const oldElement = document.getElementById('cookie-content');
                oldElement.replaceWith(newElement);
                loadScript(host + '/resource/js/page/cookieManagement.js');
                const policyUrl = document.getElementById('privacyPolicyUrl');
                if (policyUrl && window.COOKIE_POLICY_URL) {
                    if (debugging) {
                        console.debug('updating privacy policy URL in cookie popup');
                    }
                    policyUrl.href = window.COOKIE_POLICY_URL;
                }
            });
        function loadScript (url) {
            if (debugging) {
                console.debug('loading management script from ' + url);
            }
            const script = document.createElement('script');
            script.src = url;
            script.setAttribute('crossorigin', 'anonymous');
            script.type = 'application/x-javascript';
            document.body.appendChild(script);
        }
        window.cookieManagementUtil.loaded.then(function () {
            // debug messages to console
            window.cookieManagementUtil.debug = debugging;
            window.cookieManagementUtil.logDebug('loading cookie popup html');
            window.cookieManagementUtil.loadGaForMeasurementId(GA_MEASUREMENT_ID);
        });
    })();
});
