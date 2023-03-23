var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
var IS_SCHEDULE = false;

window.addEventListener('DOMContentLoaded', () => {
    if (isMobile()) {
        faq();
    } else {
        fixedNavigation();
    }

    moreTestimonials();
    cookieConsent();
    loadConvertKit();
    // loadTawk();
    loadGTM();

    if (IS_SCHEDULE) {
        loadSchedule();
    }
});

function isMobile() {
    return window.innerWidth < 768;
}

function faq() {
    const faq = document.querySelector('.questions');

    if (faq) {
        faq.addEventListener('click', (event: any) => {
            if (event.target.nodeName === 'H3') {
                if (event.target.parentElement.classList.contains('open')) {
                    event.target.parentElement.classList.remove('open');
                } else {
                    event.target.parentElement.classList.add('open');
                }
            }
        });
    }
}

function moreTestimonials() {
    const btn = document.getElementById('more-testimonials');

    btn.addEventListener('click', () => {
        const testimonials = document.querySelectorAll('.testimonials .testimonial.testimonial-hidden');

        testimonials.forEach((testimonial) => {
            testimonial.classList.remove('testimonial-hidden');
        })

        btn.remove();
    });

}

function fixedNavigation() {
    window.onscroll = () => {
        const heroSection = document.getElementById('learning-points');
        const nav = document.querySelector('.nav');
        const navFixedClass = 'nav-fixed';

        if (window.pageYOffset >= heroSection.offsetTop) {
            nav.classList.add(navFixedClass);
            document.body.classList.add('nav-padding');
        } else {
            nav.classList.remove(navFixedClass);
            document.body.classList.remove('nav-padding');
        }
    }
}

function cookieConsent() {
    const key = 'cookie-consent';
    const hiddenClass = 'hidden';
    const cookie: HTMLElement =  document.querySelector('.cookie-consent')

    if (localStorage.getItem(key)) {
        if (cookie) {
            cookie.style.display = 'none';
        }
    } else {
        const button = document.getElementById(key);

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

function loadConvertKit() {
    const script = document.createElement('script');
    script.setAttribute('data-uid', '4dd9d3445a');
    script.src = 'https://dev-academy.ck.page/4dd9d3445a/index.js';
    script.defer = true;
    document.body.appendChild(script);
}

function loadTawk() {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://embed.tawk.to/58f1276d30ab263079b5fdf3/default';
    script.setAttribute('crossorigin','*');
    document.body.appendChild(script);
}

function loadGTM() {
    (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
        const f = d.getElementsByTagName(s)[0], j = d.createElement(s) as HTMLScriptElement, dl = l != 'dataLayer' ? '&l=' + l : '';
        j.defer = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-MK63J5H');
}

function loadSchedule() {
    const script = document.createElement('script');
    script.src = '/siema.min.js';
    script.defer = true;
    script.onload = () => {
        const schedule = document.querySelector('.schedule');
        const sectionHiddenClass = 'schedule-hidden';

        if (schedule && schedule.classList.contains(sectionHiddenClass)) {
            schedule.classList.remove(sectionHiddenClass);

            const mySiema = new Siema({
                selector: '.schedule-weeks',
                easing: 'ease-out',
                perPage: 1,
                loop: true
            });

            schedule.querySelector('.schedule-navigation-prev').addEventListener('click', () => mySiema.prev());
            schedule.querySelector('.schedule-navigation-next').addEventListener('click', () => mySiema.next());
        }
    };

    document.body.appendChild(script);
}