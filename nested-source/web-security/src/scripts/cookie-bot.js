if (window.location.host.indexOf('netlify.app') === -1 && window.location.host.indexOf('localhost') === -1) {
    var script = document.createElement('script');
    script.src = 'https://consent.cookiebot.com/uc.js';
    script.id = 'Cookiebot';
    script.setAttribute('data-cbid', '58263a88-73f6-4dd8-a177-4e4fedc12b1b');
    script.setAttribute('data-blockingmode', 'auto');
    document.head.appendChild(script);
}
