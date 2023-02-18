posthog.onFeatureFlags(function() {
    posthog.feature_flags.override({cta: 'test'});

    if (posthog.getFeatureFlag('cta') === 'test') {
        console.log('Overriding');
        // window.DESKTOP_STICKY_HEADER = true; TODO for testing header A/B this will be removed in the future
        var navStartBtn = document.querySelector('.header-nav .header-nav-start .button');

        if (navStartBtn) {
            navStartBtn.textContent = 'Go here!';
        }
    } else {
        console.warn('A/B failed');
    }
});