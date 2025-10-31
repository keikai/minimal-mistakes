/**
 * @file Manages GDPR cookie consent and initializes Google Analytics 4 with Consent Mode v2.
 * @requires jQuery
 * @requires js-cookie (https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js)
 * @see /src/main/webapp/cookie_management.html for the related HTML structure.
 *
 * This script sets the consent state based on existing cookies *before* loading the Google Analytics script and sending any tracking events.
 * It handles country detection, consent banner UI, and intercepts cookie setting to ensure compliance.
 *
 * **Cookie Consent Types:**
 * - **'all'**: All cookies (functional, analytics, advertising) are accepted.
 * - **'custom'**: User has explicitly selected which categories of cookies to accept (analytics, advertising).
 * - **'essential'**: Only strictly necessary cookies are accepted.
 *
 * **Country-Specific Dialogs:**
 * The script detects the user's country. If the user is in a European country, a detailed consent dialog is presented.
 * For users outside Europe, a simplified dialog is shown, generally implying acceptance of all cookies by default.
 */

(function() {
    'use strict';

    /**
     * A map to temporarily hold cookies that are set before consent is given.
     * @type {Map<string, string>}
     */
    const cookieTmpMap = new Map();

    /**
     * A flag indicating if the user is determined to be in a European country.
     * @type {boolean}
     */
    let europeanCountry = false;

    /**
     * The current consent state of the user ('all', 'custom', 'essential', or null).
     * @type {string|null}
     */
    let cookieConsent = null;

    // --- Configuration Constants ---
    const europeCountries = ["AL", "AD", "AM", "AT", "AZ", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GR", "HU", "IS", "IE", "IT", "KZ", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA", "GB", "VA"];
    const cookieConfig = ["cookie_consent", "functional_cookie", "analytics_cookie", "ads_cookie"];
    const basicCookies = ["JSESSIONID", "cf_clearance", "sessionid", "_csrf"];
    const functionalCookies = [];
    const analyticsCookies = ["zkossgac_gid", "_gid", "_ga", "_ga_57B6X16TY1", "ajs_anonymous_id", "ajs_user_id", "eikoockzmotsuc-downloaded-eetrial", "eikoockzmotsuc-nwod", "eikoockzmotsuc-ter", "eikoockzmotsuc-tsrif", "eikoockzmotsuc-visited-pricing", "eikoockzmotsuc-vda-1", "dsq__u", "dsq__s"];
    const adsCookies = ["__gsas"];
    const GA_MEASUREMENT_ID = 'G-57B6X16TY1';

    /**
     * Initializes the dataLayer and gtag function for Google Analytics.
     * This must be defined globally before any gtag commands are called.
     */
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

    // --- Main Execution Flow ---

    // 1. Set the default consent immediately on script execution.
    setDefaultConsent();

    // 2. Load the Google Analytics script.
    loadGaScript();

    // 3. Send the initial configuration and page_view event.
    //    This will send a cookieless ping or a full beacon based on the consent set above.
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);

    /**
     * A helper function to read a specific cookie by name.
     * @param {string} name The name of the cookie to read.
     * @returns {string|null} The value of the cookie, or null if not found.
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    /**
     * Sets the default consent state for Google Analytics based on existing cookies.
     * This is the core of the optimal consent mode implementation, ensuring the correct
     * consent state is set before any tracking signals are sent.
     */
    function setDefaultConsent() {
        cookieConsent = getCookie('cookie_consent');
        let analyticsConsent = 'denied';
        let adConsent = 'denied';

        if (cookieConsent === 'all') {
            analyticsConsent = 'granted';
            adConsent = 'granted';
        } else if (cookieConsent === 'custom') {
            analyticsConsent = getCookie('analytics_cookie') === 'true' ? 'granted' : 'denied';
            adConsent = getCookie('ads_cookie') === 'true' ? 'granted' : 'denied';
        }

        gtag('consent', 'default', {
            'analytics_storage': analyticsConsent,
            'ad_storage': adConsent,
            'ad_user_data': adConsent,
            'ad_personalization': adConsent
        });
    }

    /**
     * Dynamically loads the Google Analytics (gtag.js) script.
     */
    function loadGaScript() {
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(gaScript);
    }

    // --- DOM Ready Functions (Event Handlers, UI updates) ---
    $(function() {
        // Main logic for initializing UI and showing cookie popup
        const cookiePopup = document.getElementById('cookie-popup');
        if (!getCookie("cookie_consent")) {
            // Initialize country-specific UI only if consent has not been given
            getUserCountry(function(country) {
                if (country && isEuropeanCountry(country)) {
                    europeanCountry = true;
                    $('#noneEurope').hide();
                    $('#europe').show();
                } else {
                    $('#gdpr-button-all').text("Accept & Continue");
                    $('#gdpr-button-essential').hide();
                    $('#gdpr-button-custom').hide();
                }
            });

            if (cookiePopup) {
                cookiePopup.style.display = "block";
            }
        }

        // --- Function Declarations ---

        /**
         * Fetches the user's country from Cloudflare's trace service.
         * @param {function(string|null): void} callback The function to call with the country code.
         */
        function getUserCountry(callback) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://www.cloudflare.com/cdn-cgi/trace", true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var match = xhr.responseText.match(/loc=(\w+)/);
                        var countryCode = match ? match[1] : null;
                        callback(countryCode);
                    } else {
                        callback(null);
                    }
                }
            };
            xhr.send();
        }

        /**
         * Checks if a country code belongs to a European country.
         * @param {string} countryCode The 2-letter country code.
         * @returns {boolean} True if the country is in the European list.
         */
        function isEuropeanCountry(countryCode) {
            return europeCountries.includes(countryCode.toUpperCase());
        }

        // --- Event Handlers for Consent Banner ---

        $(document).on('click', '#gdpr-button-all', function() {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
            addCookies('cookie_consent', 'all', 30);
            cookieConsent = "all";
            resetCookies();
            if (cookiePopup) $(cookiePopup).hide();
        });

        $(document).on('click', '#gdpr-button-essential', function() {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
            });
            addCookies('cookie_consent', 'essential', 30);
            if (cookiePopup) $(cookiePopup).hide();
        });

        $(document).on('click', '#gdpr-close-btn', function() {
            if (europeanCountry) {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied',
                    'ad_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied'
                });
                addCookies('cookie_consent', 'essential', 30);
            } else {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted'
                });
                addCookies('cookie_consent', 'all', 30);
            }
            if (cookiePopup) $(cookiePopup).hide();
        });

        $(document).on('click', '#gdpr-button-custom', function() {
            $('#gdpr-button-custom').hide();
            $('#gdpr-button-custom-confirm').css('display', 'flex');
            $('#gdpr-popup-custom-zone').css('display', 'flex');
        });

        $(document).on('click', '#gdpr-button-custom-confirm', function() {
            const analyticsCookie = $("#analytics-cookie").is(":checked");
            const adsCookie = $("#ads-cookie").is(":checked");

            gtag('consent', 'update', {
                'analytics_storage': analyticsCookie ? 'granted' : 'denied',
                'ad_storage': adsCookie ? 'granted' : 'denied',
                'ad_user_data': adsCookie ? 'granted' : 'denied',
                'ad_personalization': adsCookie ? 'granted' : 'denied'
            });

            addCookies('cookie_consent', 'custom', 30);
            addCookies('functional_cookie', $("#functional-cookie").is(":checked"), 30);
            addCookies('analytics_cookie', analyticsCookie, 30);
            addCookies('ads_cookie', adsCookie, 30);
            cookieConsent = "custom";
            resetCookies();
            if (cookiePopup) cookiePopup.style.visibility = "hidden";
        });
    });

    /**
     * Sets a cookie with a given name, value, and expiration.
     * @param {string} name The name of the cookie.
     * @param {string|boolean} value The value of the cookie.
     * @param {number} expiredDay The number of days until the cookie expires.
     */
    function addCookies(name, value, expiredDay) {
        Cookies.set(name, value, {
            expires: expiredDay,
            path: '/'
        });
    }

    /**
     * Re-evaluates and sets cookies that were temporarily stored before consent was granted.
     */
    function resetCookies() {
        cookieTmpMap.forEach(function(value, key) {
            if (checkCookiesAvailable(key)) {
                const cookieArray = value.split(';');
                let cookieExpireTime = "";
                let cookieValue = "";
                for (let i = 0; i < cookieArray.length; i++) {
                    const parts = cookieArray[i].split('=');
                    if (parts[0].trim().includes('expires')) {
                        cookieExpireTime = parts[1];
                    }
                    if (parts[0].trim() === key) {
                        cookieValue = parts[1];
                    }
                }
                const expireDate = new Date(cookieExpireTime);
                const diffDays = Math.floor((expireDate - new Date()) / (1000 * 60 * 60 * 24));
                addCookies(key, cookieValue, diffDays);
            }
        });
    }

    /**
     * Checks if a specific cookie is allowed to be set based on the current consent state.
     * @param {string} cookieName The name of the cookie to check.
     * @returns {boolean} True if the cookie can be set.
     */
    function checkCookiesAvailable(cookieName) {
        if (cookieConsent === 'all') {
            return true;
        } else if (cookieConsent === "custom") {
            if (Cookies.get('functional_cookie') === "true" && functionalCookies.includes(cookieName)) return true;
            if (Cookies.get('analytics_cookie') === "true" && analyticsCookies.includes(cookieName)) return true;
            if (Cookies.get('ads_cookie') === "true" && adsCookies.includes(cookieName)) return true;
        }
        return false;
    }

    /**
     * Overrides the native document.cookie setter to enforce consent choices.
     * Non-essential cookies are stored in a temporary map until consent is granted.
     */
    (function() {
        try {
            const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
            if (!originalCookieDescriptor) return;

            Object.defineProperty(document, 'cookie', {
                get: function() {
                    return originalCookieDescriptor.get.call(document);
                },
                set: function(value) {
                    const name = value.split(';')[0].split('=')[0].trim();

                    if (cookieConfig.includes(name) || basicCookies.includes(name) || checkCookiesAvailable(name)) {
                        originalCookieDescriptor.set.call(document, value);
                    } else {
                        cookieTmpMap.set(name, value);
                    }
                }
            });
        } catch (e) {
            console.error("Failed to override document.cookie:", e);
        }
    })();

})();