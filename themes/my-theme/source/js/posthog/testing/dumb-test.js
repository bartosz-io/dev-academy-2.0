if (window.posthog) {
    posthog.onFeatureFlags(function() {
        // window.DESKTOP_STICKY_HEADER = true;
        // popupABTest();
        // sidebarWSALinkABTest();
        // mainBannerLinkABTest();
    });
}

function sidebarWSALinkABTest() {
    var articleSidebar = document.querySelector('.article .article-sidebar');

    if (posthog.getFeatureFlag('blog-post-sidebar_wsa') === 'test') {

        if (articleSidebar) {
            articleSidebar.classList.add('article-sidebar--dark');
        }
    }

    if (articleSidebar) {
        articleSidebar.classList.remove('hidden');
    }
}

function mainBannerLinkABTest() {
    if (posthog.getFeatureFlag('main-banner_link') === 'test') {
        var barTopClass = 'b-bar-top';
        var barBottomClass = 'b-bar-bottom';
        var mainBanner = document.querySelector('.main-banner');

        if (document.body.classList.contains(barTopClass) && mainBanner) {
            var firstText = mainBanner.querySelector("[data-copy='1']");
            var middleText = mainBanner.querySelector("[data-copy='2']");
            var textLink = mainBanner.querySelector("[data-copy='3']");

            if (firstText && middleText && textLink) {
                // firstText.textContent = '<<TO BE ADDED IF NEEDED>'
                middleText.textContent = '🔥 FAST LEARNING 🔥'
                textLink.textContent = 'CHECK THIS OUT'
            }

            document.body.classList.remove(barTopClass);
            document.body.classList.add(barBottomClass);
        }
    }
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
