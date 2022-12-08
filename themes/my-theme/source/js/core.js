window.addEventListener('DOMContentLoaded', function() {
    if (isTablet()) {
        stickyNavigation();
    } else {
        mobileNavigation();
    }
});

function isTablet() {
    return window.innerWidth > 991;
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
