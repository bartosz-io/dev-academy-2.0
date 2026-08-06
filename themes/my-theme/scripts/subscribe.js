hexo.extend.tag.register('subscribe', function () {
    const newsletterUid = hexo.config.newsletter.uid;

    return `<div class="custom-subscribe">
                <div class="custom-subscribe-content">
                    <img src="/img/ninja-jump.png" width="200" height="160" alt="" loading="lazy">
                    <div class="custom-subscribe-text">
                        <p>Did you like the content?</p>
                        <a class="button button-primary" data-ph="custom-subscribe__link" data-formkit-toggle="${newsletterUid}" href="https://dev-academy.ck.page/${newsletterUid}">Subscribe for MORE!</a>
                    </div>
                </div>
            </div>`;
});
