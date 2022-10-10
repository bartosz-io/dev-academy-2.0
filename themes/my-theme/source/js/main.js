window.addEventListener('DOMContentLoaded', function() {
    if (isTablet()) {
        stickyNavigation();
    } else {
        mobileNavigation();
    }

    if (isTablet()) {
        loadOdometer();
    }

    if (isPostPage() && isLaptop()) {
        cloneArticleTOC();
    }

    if (isTagPage()) {
        setActiveTagPill();
    }

    cookieConsent();
    loadDisqusComments();
    loadConvertKit();
    relatedPosts();
    contributors();
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

function isLaptop() {
    return window.innerWidth > 1279;
}

function isTagPage() {
    return document.body.classList.contains('tag-page');
}

function isPostPage() {
    return document.body.classList.contains('post-page');
}

function mobileNavigation() {
    var toggle = document.querySelector('.header-nav-toggle');
    var menu = document.querySelector('.header-nav');
    var openMsg = 'Click here to open the mobile menu';
    var closeMsg = 'Click here to close the mobile menu';
    var activeClass = 'active';
    var submenuClass = 'header-nav-link-submenu';

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
               if (event.target.classList.contains(submenuClass)) {
                   event.preventDefault();
                   event.target.classList.toggle(activeClass);
               } else {
                   close();
               }
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

function stickyNavigation() {
    var lastScrollY = 0;
    var headerStickyClass = 'header-sticky';
    var headerStickyOutClass = 'header-sticky-out';

    window.addEventListener('scroll', function(event) {
        if (lastScrollY < window.scrollY) {
            if (window.scrollY > 500) {
                document.body.classList.remove(headerStickyClass);
                document.body.classList.add(headerStickyOutClass);
            }
        } else {
            if (window.scrollY > 500) {
                document.body.classList.add(headerStickyClass);
                document.body.classList.remove(headerStickyOutClass);
            } else {
                document.body.classList.remove(headerStickyOutClass);
            }
        }

        lastScrollY = window.scrollY;
    }, {passive: true});
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
        var commentsButton = document.getElementById('show-comments');
        var visibleClass = 'visible';

        if (!relatedPosts.length && !commentsButton) {
            return;
        }

        document.addEventListener('scroll', function() {
            var OFFSET = 1500;
            var reachedCommentsSection = window.scrollY + OFFSET > commentsButton.offsetTop;

            if (reachedCommentsSection) {
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

function contributors() {
    var contributorsContainer =  document.querySelector('.contributors');

    if (contributorsContainer) {
        var pillsContainer = contributorsContainer.querySelector('.pills');

        pillsContainer.addEventListener('click', function(event) {
            const spec = event.target.getAttribute('data-spec');
            if (spec) {
                var pills = pillsContainer.querySelectorAll('.pill');
                var pillInactiveClass = 'pill-inactive';
                pills.forEach((pill) => pill.classList.add(pillInactiveClass));

                event.target.classList.remove(pillInactiveClass);

                var contributors = contributorsContainer.querySelectorAll('.contributor');

                if (spec === 'all') {
                    contributors.forEach((contributor) => contributor.style.display = 'block');
                } else {
                    contributors.forEach((contributor) => contributor.style.display = 'none');

                    contributorsContainer.querySelectorAll('.contributor-specs').forEach(function(specs) {
                        let a = specs.querySelector('.contributor-spec-' + spec);

                        if (a) {
                            a.closest('.contributor').style.display = 'block';
                        }
                    })
                }
            }
        })
    }
}

function setActiveTagPill() {
    var tagList = document.querySelector('.tag-list');

    if (tagList) {
        var pathName = location.pathname;

        let tag = tagList.querySelector(`[href="${pathName}"]`);

        if (tag) {
            tag.classList.add('active');
        }
    }
}

function cloneArticleTOC() {
    var toc = document.querySelector('.article-content .toc');
    var asideToc = document.getElementById('article-toc');

    if (asideToc) {
        if (toc) {
            asideToc.appendChild(toc.cloneNode(true));
        } else {
            asideToc.remove();
            document.body.classList.add('post-no-toc');
        }
    }
}