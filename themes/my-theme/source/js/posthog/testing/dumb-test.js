if (window.posthog) {
    posthog.onFeatureFlags(function() {
        // window.DESKTOP_STICKY_HEADER = true;
        popupABTest();
    });
}

function sidebarWSALinkABTest() {
    var articleSidebar = document.querySelector('.article .article-sidebar');

    if (posthog.getFeatureFlag('blog-post-sidebar_wsa') === 'test') {
        console.warn('Starting test flag');

        if (articleSidebar) {
            articleSidebar.classList.add('article-sidebar--dark');
        }
    }

    if (articleSidebar) {
        articleSidebar.classList.remove('hidden');
    }

    console.warn('End testing');
}

function popupABTest() {
    if (posthog.getFeatureFlag('blog-post-popup') === 'test') {
        var popup = document.getElementById('popup');

        if (!popup) return;

        var header = popup.querySelector('.popup-header');
        var subheader = popup.querySelector('.popup-subheader');
        var cta = popup.querySelector('.popup-cta');
        var closeText = popup.querySelector('.popup-close-text');
        var image = popup.querySelector('.popup-img');

        var replacedContent = {
            header: 'header text',
            subHeader: 'subheader text',
            cta: 'cta text',
            closeText: 'close text',
            imageUrl: 'https://dev-academy.com/angular-signals/large_banner.webp'
        };

        if (header && replacedContent.header) header.textContent = replacedContent.header;
        if (subheader && replacedContent.subHeader) subheader.textContent = replacedContent.subHeader;
        if (cta && replacedContent.cta) cta.textContent = replacedContent.cta;
        if (closeText && replacedContent.closeText) closeText.textContent = replacedContent.closeText;
        if (image && replacedContent.imageUrl) image.src = replacedContent.imageUrl;
    }
}

