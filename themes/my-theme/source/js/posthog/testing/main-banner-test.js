if (window.posthog) {
    posthog.onFeatureFlags(function() {
        var barTopClass = 'b-bar-top';
        var barBottomClass = 'b-bar-bottom';
        var mainBanner = document.querySelector('.main-banner');

        if (mainBanner) {
            var firstText = mainBanner.querySelector("[data-copy='1']");
            var middleText = mainBanner.querySelector("[data-copy='2']");
            var textLink = mainBanner.querySelector("[data-copy='3']");

            if (posthog.getFeatureFlag('main-banner_variant') === 'top_b') {

                if (firstText && middleText && textLink) {
                    firstText.textContent = 'Secure coding bootcamp 👩‍🎓'
                    middleText.textContent = '🔥 Proven methods + strategies 🔥'
                    textLink.textContent = 'BUILD SECURE APPLICATIONS'
                }

            } else if (posthog.getFeatureFlag('main-banner_variant') === 'bottom_a') {

                document.body.classList.remove(barTopClass);
                document.body.classList.add(barBottomClass);
                
            } else if (posthog.getFeatureFlag('main-banner_variant') === 'bottom_b') {

                if (firstText && middleText && textLink) {
                    firstText.textContent = 'Secure coding bootcamp 👩‍🎓'
                    middleText.textContent = '🔥 Proven methods + strategies 🔥'
                    textLink.textContent = 'BUILD SECURE APPLICATIONS'
                }

                document.body.classList.remove(barTopClass);
                document.body.classList.add(barBottomClass);

            }
        }
    });
}
