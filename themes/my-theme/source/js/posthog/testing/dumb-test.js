if (window.posthog) {
    posthog.onFeatureFlags(function() {
        // window.DESKTOP_STICKY_HEADER = true;
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