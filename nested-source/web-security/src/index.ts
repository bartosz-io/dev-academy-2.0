interface Window { posthog: any };

var IS_SCHEDULE = true;
var collapsePanelLoaded = false;
var inited = false;

window.addEventListener('DOMContentLoaded', () => {
    if (!inited) {
        inited = true;
    } else {
        return;
    }

    if (isMobile()) {
        faq();
    } else {
        // fixedNavigation();
    }

    moreTestimonials();
    loadConvertKit(onCkReady);
    // collapsePanel();
    // startTimer();

    if (IS_SCHEDULE) {
        loadSchedule();
    }
});

function onCkReady() {
    // restore id
    const phInput = document.querySelector('input[name="fields[ph_id]"]') ?? {};
    phInput['value'] = window.posthog?.get_distinct_id();

    // track form submit
    const ckForm = document.querySelector('.formkit-form') as HTMLInputElement | null;
    if (ckForm) {
        const phEmail = document.querySelector('input[name="email_address"]') ?? {};
        const phName = document.querySelector('input[name="fields[first_name]"]') ?? {};
        
        ckForm.addEventListener('submit', () => {
            window.posthog?.capture(
                'wsda_subscribe_submit', 
                { 
                  $set: { 
                    first_name: phName['value'],
                    email: phEmail['value'],
                },
                }
              );
        });
    }
}

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

function isStringSane(str) {
    return !!str && (str.match(/^[a-zA-Z0-9_]*$/) !== null);
}

function getCkForm(): string {
    const defaultCk = '42e6845fd7';
    const params = new URLSearchParams(location.search);
    const ck = params.get('ck');
    if (isStringSane(ck)) {
        return ck ?? defaultCk;
    } else {
        return defaultCk;
    }
}

function loadConvertKit(onloadCallback: Function) {
    const ck = getCkForm();

    const script = document.createElement('script');
    script.setAttribute('data-uid', ck);
    script.src = `https://dev-academy.ck.page/${ck}/index.js`;
    script.defer = true;
    script.addEventListener('load', () => onloadCallback())
    document.body.appendChild(script);
    
    const ckTriggers = document.querySelectorAll('[data-formkit-toggle]');
    ckTriggers.forEach(trigger => {
        trigger.setAttribute('data-formkit-toggle', ck);
        trigger.setAttribute('href', `https://dev-academy.ck.page/${ck}`);
    });
}

function loadSchedule() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/siema@1.5.1/dist/siema.min.js';
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

    if (agenda && !collapsePanelLoaded) {
        const attrName = 'data-collapsed';

        agenda.addEventListener('click', (event) => {
            const agendaHeader = event.target.getAttribute(attrName);

            if (agendaHeader) {
                event.target.setAttribute(attrName, agendaHeader === 'false' ? 'true' : 'false');
            }
        });

        collapsePanelLoaded = true;
    }
}

function startTimer() {

    var countDownDate = new Date(Date.UTC(2023, 9, 9, 19, 0, 0)).getTime();

    var x = setInterval(function () {
        var now = new Date().getTime();
        var distance = countDownDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementsByClassName('dfD');
        const hoursEl = document.getElementsByClassName('dfH');
        const minsEl = document.getElementsByClassName('dfM');
        const secEl = document.getElementsByClassName('dfS');

        Array.from(daysEl).forEach(el => el.innerHTML = days + '')
        Array.from(hoursEl).forEach(el => el.innerHTML = hours + '')
        Array.from(minsEl).forEach(el => el.innerHTML = minutes + '')
        Array.from(secEl).forEach(el => el.innerHTML = seconds + '')
        

        if (distance < 0) {
            clearInterval(x);
            const counter = document.getElementById("counter");
            if (counter) {
                counter.innerHTML = "";
            }

            const counterNav = document.getElementById("counter-nav");
            if (counterNav) {
                counterNav.innerHTML = "";
            }

        }
    }, 1000);
}
