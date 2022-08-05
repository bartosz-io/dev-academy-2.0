window.addEventListener('DOMContentLoaded', function() {
    if (!this.isTablet()) {
        navigation();
    }

    if (this.isTablet()) {
        loadOdometer();
    }

    cookieConsent();
    loadDisqusComments();
    loadConvertKit();
    relatedPosts();
    authors();
});

function loadConvertKit() {
    var script = document.createElement('script');
    script.src = 'https://f.convertkit.com/ckjs/ck.5.js';
    script.defer = true;
    document.body.appendChild(script);
}

function loadOdometer() {
    var script = document.createElement('script');
    script.src = '/js/odometer.js';
    script.defer = true;
    document.body.appendChild(script);

    script.onload = function() {
        var subCount = document.getElementById('sub-count');
        var value = 0;
        var startingValue = 6117;

        var odometer = new Odometer({
            el: subCount,
            value: value
        });

        odometer.update(value = startingValue);

        var interval = setInterval(function() {
            value += Math.floor(Math.random() * 4) + 1;

            odometer.update(value);

            if (value >= startingValue) {
                clearInterval(interval);
            }
        }, 10000);
    };
}

function loadDisqusComments() {
    var button = document.getElementById('show-comments');

    if (button) {
        var disqusName = 'angular-academy-1';

        button.addEventListener('click', function () {
            var script = document.createElement('script');
            script.src = '//' + disqusName + '.disqus.com/embed.js';
            document.body.appendChild(script);

            button.remove();
        });
    }
}

function isMobile() {
    return window.innerWidth < 768;
}

function isTablet() {
    return window.innerWidth > 991;
}

function navigation() {
    var toggle = document.querySelector('.header-nav-toggle');
    var menu = document.querySelector('.header-nav');
    var openMsg = 'Click here to open the mobile menu';
    var closeMsg = 'Click here to close the mobile menu';
    var activeClass = 'active';

    if (toggle && menu) {
        toggle.addEventListener('click', function(event) {
            event.stopPropagation();

            if (toggle.classList.contains(activeClass)) {
                close();
            } else {
                open();
            }
        });

        menu.addEventListener('click', function(event) {
           if (event.target.nodeName === 'A') {
               close();
           }
        });
    }

    document.addEventListener('click', function(event) {
        if (!menu.contains(event.target) && menu.classList.contains(activeClass)) {
            close();
        }
    });

    function open() {
        menu.classList.add(activeClass);
        toggle.classList.add(activeClass);
        toggle.setAttribute('aria-label', closeMsg);
    }

    function close() {
        menu.classList.remove(activeClass);
        toggle.classList.remove(activeClass);
        toggle.setAttribute('aria-label', openMsg);
    }
}

function cookieConsent() {
    var key = 'cookie-consent';
    var hiddenClass = 'hidden';
    var cookie =  document.querySelector('.cookie-consent')

    if (localStorage.getItem(key)) {
        if (cookie) {
            cookie.style.display = 'none';
        }
    } else {
        var button = document.getElementById(key);

        if (cookie) {
            cookie.style.display = 'block';
        }

        if (button) {
            button.addEventListener('click', function() {
                localStorage.setItem(key, 'true');
                cookie.classList.add(hiddenClass);

                setTimeout(function() {
                    cookie.style.display = 'none';
                }, 300);
            });
        }
    }
}

function relatedPosts() {
    var relatedPostsContainer = document.querySelector('.related-posts');

    if (relatedPostsContainer) {
        var relatedPosts = relatedPostsContainer.querySelectorAll('.related-post');
        var visibleClass = 'visible';

        if (!relatedPosts.length) {
            return;
        }

        document.addEventListener('scroll', function() {
            var isHalfPage = window.scrollY > (document.body.offsetHeight - window.innerHeight) * 0.8;

            if (isHalfPage) {
                relatedPostsContainer.classList.add(visibleClass);
            } else {
                relatedPostsContainer.classList.remove(visibleClass);
            }
        }, {passive: true})

        var close = document.querySelector('.related-post-close');

        close.addEventListener('click', function(event) {
            event.preventDefault();
            close.closest('.related-posts').remove();
        })
    }
}

function authors() {
    var authorsContainer =  document.querySelector('.authors');

    if (authorsContainer) {
        var pillsContainer = authorsContainer.querySelector('.pills');

        pillsContainer.addEventListener('click', function(event) {
            const spec = event.target.getAttribute('data-spec');
            if (spec) {
                var pills = pillsContainer.querySelectorAll('.pill');
                var pillInactiveClass = 'pill-inactive';
                pills.forEach((pill) => pill.classList.add(pillInactiveClass));

                event.target.classList.remove(pillInactiveClass);

                var authors = authorsContainer.querySelectorAll('.author');

                if (spec === 'all') {
                    authors.forEach((author) => author.style.display = 'block');
                } else {
                    authors.forEach((author) => author.style.display = 'none');

                    authorsContainer.querySelectorAll('.author-specs').forEach(function(specs) {
                        let a = specs.querySelector('.author-spec-' + spec);

                        if (a) {
                            a.closest('.author').style.display = 'block';
                        }
                    })
                }
            }
        })
    }
}