if (window.posthog) {
    posthog.onFeatureFlags(function() {
        var sidebar = document.querySelector('.article-sidebar');

        if (sidebar) {

            var header = sidebar.querySelector(".article-sidebar-header");
            var button = sidebar.querySelector("[data-ph='article-sidebar__save-your-spot']");

            if (posthog.getFeatureFlag('sidebar_variant') === 'sidebar_b') {

                if (header && button) {
                    header.textContent = 'Join the club of Security-oriented Developers 🥷'
                    button.textContent = 'Discover the program'
                }

            } else if (posthog.getFeatureFlag('sidebar_variant') === 'sidebar_c') {

                if (header && button) {
                    header.textContent = 'Join the club of Dev Academy students 🥷'
                    button.textContent = 'JOIN ACADEMY 🚀'
                }
                
            }
        }
    });
}
