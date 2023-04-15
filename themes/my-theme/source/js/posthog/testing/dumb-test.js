if (window.posthog) {
    posthog.onFeatureFlags(function() {
        // window.DESKTOP_STICKY_HEADER = true;
        sidebarWSALinkABTest();
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