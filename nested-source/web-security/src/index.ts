var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
var IS_SCHEDULE = false;

window.addEventListener('DOMContentLoaded', () => {
    if (isMobile()) {
        faq();
    } else {
        fixedNavigation();
    }

    moreTestimonials();
    loadConvertKit();
    // loadTawk();
    loadGTM();
    collapsePanel();

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

function collapsePanel() {
    const agenda = document.querySelector('.enriched-agenda-wrapper');

    if (agenda) {
        const attrName = 'data-collapsed';

        agenda.addEventListener('click', (event) => {
            const agendaHeader = event.target.getAttribute(attrName);

            if (agendaHeader) {
                event.target.setAttribute(attrName, agendaHeader === 'false' ? 'true' : 'false');
            }
        });
    }
}
