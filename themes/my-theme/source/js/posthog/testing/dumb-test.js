posthog.onFeatureFlags(function() {
    posthog.feature_flags.override({cta: 'test'});

    if (posthog.getFeatureFlag('cta') === 'test') {
        console.log('Overriding');
        var navStartBtn = document.querySelector('.header-nav .header-nav-start .button');

        if (navStartBtn) {
            navStartBtn.textContent = 'Go here!';
        }
    } else {
        console.warn('A/B failed');
    }
});