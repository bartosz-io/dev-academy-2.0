window.DESKTOP_STICKY_HEADER = true;


/**
 * Scripts initialization
 * */

document.addEventListener('DOMContentLoaded', function() {
    privacyControls();
    newsletterAnalytics();
    uiInteractionAnalytics();

    if (document.body && document.body.classList.contains('landing-page')) {
        return;
    }

    stickyNavigation();
    mobileNavigation();

    if (isLaptop()) {
        if (isPostPage()) {
            cloneArticleTOC();
        }

        if (isIndexPage()) {
            animateInfoBoxes();
        }
    }

    if (isPostPage()) {
        // initPopup();
    }

    if (isIndexPage()) {
        slider();
    }

    if (isTagPage()) {
        setActiveTagPill();
    }

    // cookieConsent();
    addPostHogDynamicInserts();
    newsletterSubmitLoaders();
    loadDisqusComments();
    loadConvertKit();
    relatedPosts();
    contributors();
    userGoals();
});

function privacyControls() {
    var runtime = window.DevAcademyPrivacy;
    var controls;
    var initialState;

    if (!runtime || privacyControls.isBound) {
        return;
    }
    privacyControls.isBound = true;

    controls = {
        banner: document.querySelector('#consent-banner'),
        dialog: document.querySelector('#privacy-dialog'),
        persistentAnalytics: document.querySelector('#persistent-analytics-consent'),
        marketing: document.querySelector('#marketing-consent'),
        acceptAll: document.querySelectorAll('[data-accept-all]'),
        rejectAll: document.querySelector('[data-reject-all]'),
        save: document.querySelector('[data-save-privacy-settings]'),
        open: document.querySelectorAll('[data-open-privacy-settings]')
    };

    function renderState(state) {
        if (controls.persistentAnalytics) {
            controls.persistentAnalytics.checked = state.persistentAnalytics;
        }
        if (controls.marketing) {
            controls.marketing.checked = state.marketing;
        }
        if (state.decided && controls.banner) {
            controls.banner.hidden = true;
        }
        if (state.decided && document.body && document.body.dataset) {
            document.body.dataset.consentBanner = 'hidden';
        }
    }

    function openDialog() {
        renderState(runtime.getState());
        if (!controls.dialog || controls.dialog.open) {
            return;
        }
        if (typeof controls.dialog.showModal === 'function') {
            controls.dialog.showModal();
        } else {
            controls.dialog.setAttribute('open', '');
        }
    }

    function closeDialog() {
        if (!controls.dialog || !controls.dialog.open) {
            return;
        }
        if (typeof controls.dialog.close === 'function') {
            controls.dialog.close();
        } else {
            controls.dialog.removeAttribute('open');
        }
    }

    controls.open.forEach(function(control) {
        control.addEventListener('click', openDialog);
    });
    controls.acceptAll.forEach(function(control) {
        control.addEventListener('click', function() {
            runtime.acceptAll();
            closeDialog();
        });
    });
    if (controls.rejectAll) {
        controls.rejectAll.addEventListener('click', function() {
            runtime.rejectAll();
            closeDialog();
        });
    }
    if (controls.save) {
        controls.save.addEventListener('click', function() {
            runtime.setPreferences({
                persistentAnalytics: controls.persistentAnalytics && controls.persistentAnalytics.checked === true,
                marketing: controls.marketing && controls.marketing.checked === true
            });
            closeDialog();
        });
    }

    runtime.subscribe(renderState);
    initialState = runtime.getState();
    renderState(initialState);
    if (!initialState.decided) {
        if (controls.banner) {
            controls.banner.hidden = false;
        }
        if (document.body && document.body.dataset) {
            document.body.dataset.consentBanner = 'visible';
        }
        runtime.capture('consent_banner_viewed');
    }

    window.addEventListener('storage', function(event) {
        if (event.key === runtime.CONSENT_KEY) {
            runtime.applyExternalState(event.newValue);
        }
    });
}

function captureAnalytics(event, properties) {
    if (window.DevAcademyPrivacy && typeof window.DevAcademyPrivacy.capture === 'function') {
        window.DevAcademyPrivacy.capture(event, properties);
    }
}

function canonicalAnalyticsValue(value) {
    if (typeof value !== 'string') {
        return 'unknown';
    }
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 80) || 'unknown';
}

function newsletterAnalytics() {
    var forms;
    var viewedForms;
    var observer;

    if (newsletterAnalytics.isBound) {
        return;
    }
    newsletterAnalytics.isBound = true;
    forms = document.querySelectorAll('.newsletter-form');
    if (!forms.length) {
        return;
    }

    viewedForms = new Set();
    if (typeof IntersectionObserver === 'function') {
        observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                var form = entry.target;
                if (!entry.isIntersecting || viewedForms.has(form)) {
                    return;
                }
                viewedForms.add(form);
                observer.unobserve(form);
                captureAnalytics('newsletter_form_viewed', {
                    topic: canonicalAnalyticsValue(form.dataset.newsletterTopic),
                    placement: canonicalAnalyticsValue(form.dataset.newsletterPlacement),
                    source_page: window.location.pathname
                });
            });
        });
    }

    forms.forEach(function(form) {
        if (observer) {
            observer.observe(form);
        }
        form.addEventListener('submit', function() {
            if (!form.checkValidity()) {
                return;
            }
            if (!window.DevAcademyPrivacy || typeof window.DevAcademyPrivacy.capture !== 'function') {
                return;
            }
            captureAnalytics('newsletter_submitted', {
                topic: canonicalAnalyticsValue(form.dataset && form.dataset.newsletterTopic),
                placement: canonicalAnalyticsValue(form.dataset && form.dataset.newsletterPlacement),
                source_page: window.location.pathname,
                has_fbclid: new URLSearchParams(window.location.search).has('fbclid')
            });
        });
    });
}

function uiInteractionAnalytics() {
    if (uiInteractionAnalytics.isBound) {
        return;
    }
    uiInteractionAnalytics.isBound = true;

    document.addEventListener('click', function(event) {
        var target;
        var href;
        var destination;
        var url;

        if (!event.target || typeof event.target.closest !== 'function') {
            return;
        }
        target = event.target.closest('[data-ph]');
        if (!target) {
            return;
        }

        destination = window.location.origin + window.location.pathname;
        href = target.getAttribute('href');
        if (href) {
            try {
                url = new URL(href, destination);
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    destination = url.origin + url.pathname;
                }
            } catch (error) {}
        }

        captureAnalytics('ui_interaction_clicked', {
            placement: canonicalAnalyticsValue(target.getAttribute('data-ph')),
            destination: destination
        });
    });
}

function newsletterSubmitLoaders() {
    var forms = document.querySelectorAll('.newsletter-form');

    forms.forEach(function(form) {
        var button = form.querySelector('.newsletter-form-submit');
        var errors = form.querySelector('[data-element="errors"]');

        if (!button || !errors) {
            return;
        }

        function resetButton() {
            button.disabled = false;
            button.classList.remove('is-submitting');
            button.removeAttribute('aria-busy');
        }

        form.addEventListener('submit', function() {
            if (!form.checkValidity()) {
                return;
            }

            button.disabled = true;
            button.classList.add('is-submitting');
            button.setAttribute('aria-busy', 'true');
        });

        new MutationObserver(function() {
            if (errors.textContent.trim()) {
                resetButton();
            }
        }).observe(errors, {
            childList: true,
            subtree: true,
            characterData: true
        });

        window.addEventListener('pageshow', resetButton);
    });
}

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

function isIndexPage() {
    return document.body.classList.contains('index-page');
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
        if (menu && !menu.contains(event.target) && menu.classList.contains(activeClass)) {
            close();
        }
    });

    function open() {
        menu.classList.add(activeClass);
        toggle.classList.add(activeClass);
        toggle.setAttribute('aria-label', closeMsg);
        toggle.setAttribute('aria-expanded', 'true');
    }

    function close() {
        menu.classList.remove(activeClass);
        toggle.classList.remove(activeClass);
        toggle.setAttribute('aria-label', openMsg);
        toggle.setAttribute('aria-expanded', 'false');
    }
}

function stickyNavigation() {
    var lastScrollY = 0;
    var headerStickyClass = 'header-sticky';
    var headerStickyOutClass = 'header-sticky-out';

    window.addEventListener('scroll', function(event) {
        if (window.DESKTOP_STICKY_HEADER) {
            return;
        }

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

function relatedPosts() {
    var relatedPostsContainer = document.querySelector('.related-posts');

    if (relatedPostsContainer) {
        var relatedPosts = relatedPostsContainer.querySelectorAll('.related-post');
        var commentsButton = document.getElementById('show-comments');

        if (relatedPosts.length && commentsButton) {
            var visibleClass = 'visible';

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

            if (close) {
                close.addEventListener('click', function(event) {
                    event.preventDefault();
                    close.closest('.related-posts').remove();
                })
            }
        }
    }
}

function contributors() {
    var contributorsContainer =  document.querySelector('.contributors');

    if (contributorsContainer) {
        var pillsContainer = contributorsContainer.querySelector('.pills');
        var loadMoreButton = contributorsContainer.querySelector('#contributor-load-more');
        var contributorHiddenClass = 'contributor-hidden';
        var buttonHiddenClass = 'button-hidden';
        var contributorsPerPage = 9;
        var filterName;

        pillsContainer.addEventListener('click', function(event) {
            const spec = event.target.getAttribute('data-spec');

            if (spec) {
                var pills = pillsContainer.querySelectorAll('.pill');
                var pillInactiveClass = 'pill-inactive';

                filterName = spec;

                loadMoreButton.classList.remove(buttonHiddenClass);

                pills.forEach((pill) => pill.classList.add(pillInactiveClass));

                event.target.classList.remove(pillInactiveClass);

                var contributors = contributorsContainer.querySelectorAll('.contributor');

                if (spec === 'all') {
                    contributors.forEach((contributor, index) => {
                        contributor.classList.remove(contributorHiddenClass);

                        if (index >= contributorsPerPage) {
                            contributor.classList.add(contributorHiddenClass);
                        }
                    });
                } else {
                    contributors.forEach((contributor) => contributor.classList.add(contributorHiddenClass));

                    var foundContributors = contributorsContainer.querySelectorAll(`.contributor-specs .contributor-spec-${spec}`);

                    if (foundContributors) {
                        foundContributors.forEach(function(foundSpec, index) {
                            if (index < contributorsPerPage) {
                                foundSpec.closest('.contributor').classList.remove(contributorHiddenClass);
                            }
                        });

                        if (foundContributors.length > contributorsPerPage) {
                            loadMoreButton.classList.remove(buttonHiddenClass);
                        } else {
                            loadMoreButton.classList.add(buttonHiddenClass);
                        }
                    }
                }
            }
        });

        loadMoreButton.addEventListener('click', function() {
            let hiddenContributors;

            if (filterName === 'all') {
                hiddenContributors = contributorsContainer.querySelectorAll(`.${contributorHiddenClass}`);
            } else {
                let specName = filterName && filterName !== 'all' ? ` .contributor-spec-${filterName}` : '';
                let filteredSpecs = contributorsContainer.querySelectorAll(`.${contributorHiddenClass}${specName}`);
                let found = [];

                filteredSpecs.forEach(function(spec) {
                    found.push(spec.closest('.contributor'));
                });

                hiddenContributors = found;
            }

            if (hiddenContributors.length <= contributorsPerPage) {
                loadMoreButton.classList.add(buttonHiddenClass);
            }

            hiddenContributors.forEach(function(contributor, index) {
                if (index < contributorsPerPage) {
                    contributor.classList.remove(contributorHiddenClass);
                }
            });
        });
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

function animateInfoBoxes() {
    var destinationInfo = document.querySelector('.academy-destination-info');

    if (!destinationInfo) {
        return;
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                addAnimation();
                observer.disconnect();
            }
        })
    });

    var section = document.querySelector('.contributors-collaboration');

    if (section) {
        observer.observe(section);
    }

    function addAnimation() {
        var infoBoxes = destinationInfo.querySelectorAll('.info-box');
        var halfSecond = 500;

        infoBoxes.forEach(function(infoBox, index) {
            setTimeout(function() {
                infoBox.classList.add(index > 1 ? 'animation-fade-in-right' : 'animation-fade-in-left')
            }, index * halfSecond);
        });
    }
}

function userGoals() {
    var academies = document.querySelectorAll('.academy-user-goal');
    var academiesContent = document.querySelectorAll('.academy-user-goal-content');
    var activeClass = 'active';
    var academyTypeString = 'data-academy';

    if (academies && academiesContent) {
        academies.forEach(function(academy) {
            academy.addEventListener('click', function(event) {
                var academyType = event.currentTarget.getAttribute(academyTypeString);

                academies.forEach((function(academy) {
                    academy.classList.remove(activeClass);
                }));

                academiesContent.forEach((function(academyContent) {
                    var academyContentType = academyContent.getAttribute(academyTypeString);

                    academyContent.classList.remove(activeClass);

                    if (academyContentType === academyType) {
                        academyContent.classList.add(activeClass);
                    }
                }));

                academy.classList.add(activeClass);
            })
        });

    }
}

function slider() {
    var slider = document.querySelector('.slider');

    if (!slider) {
        return;
    }

    var pagination = slider.querySelector('.slider-pagination');
    var sliderItems = slider.querySelectorAll('.slider-items .slider-item');
    var prev = slider.querySelector('.slider-arrows .slider-arrow-left');
    var next = slider.querySelector('.slider-arrows .slider-arrow-right');
    var threshold = 30;
    var startX;
    var distance;

    var FIRST_PAGE = 1;
    var slidesPerPage = getSlidesPerPage();
    var activePage = FIRST_PAGE;
    var activeClass = 'active';
    var pages = sliderItems.length / slidesPerPage;

    addPages(pages);
    showPages(sliderItems, activePage, slidesPerPage);

    slider.addEventListener('touchstart', function(event) {
        var touch = event.changedTouches[0];
        distance = 0;
        startX = touch.pageX;
    }, { passive: true});


    if (prev) {
        prev.addEventListener('click', function() {
            if (activePage !== FIRST_PAGE) {
                --activePage;
                refreshPagination();
            }
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            if (activePage * getSlidesPerPage() < sliderItems.length) {
                ++activePage;
                refreshPagination();
            }
        });
    }

    slider.addEventListener('touchend', function(event) {
        var touch = event.changedTouches[0];
        distance = touch.pageX - startX;

        if (Math.abs(distance) > threshold) {
            if (distance < 0) {
                if (activePage !== sliderItems.length) {
                    ++activePage;
                }
            } else if (distance > 0) {
                if (activePage !== FIRST_PAGE) {
                    --activePage;
                }
            }

            refreshPagination();
        }
    }, { passive: true});

    window.addEventListener('resize', () => {
        activePage = FIRST_PAGE;
        refreshPagination();
    });

    if (pagination) {
        pagination.addEventListener('click', function(event) {
            const page = +(event.target).dataset.page;

            if (page) {
                activePage = page;

                showPages(sliderItems, activePage, slidesPerPage);

                var pages = pagination.querySelectorAll('div');

                if (pages) {
                    pages.forEach((page) => page.classList.remove(activeClass));
                    (event.target).classList.add(activeClass);
                }
            }
        });
    }

    function refreshPagination() {
        while (pagination.firstChild) {
            pagination.removeChild(pagination.firstChild);
        }

        slidesPerPage = getSlidesPerPage();
        pages = sliderItems.length / slidesPerPage;

        addPages(pages);
        showPages(sliderItems, activePage, slidesPerPage);
    }

    function getSlidesPerPage() {
        return isMobile() ? 1 : 2;
    }

    function addPages(pages) {
        for (var i = 0; i < pages; i++) {
            var page = document.createElement('DIV');

            if (i === activePage - 1) {
                page.className = activeClass;
            }
            page.dataset.page = `${i + 1}`;

            pagination.append(page);
        }
    }

    function showPages(feeedback, activePage, feedbackPerPage) {
        var startSelect = activePage * feedbackPerPage - feedbackPerPage;
        var endSelect = startSelect + feedbackPerPage;
        var visibleClass = 'visible';

        feeedback.forEach(function(item, index) {
            if (index >= startSelect && index < endSelect) {
                item.classList.add(visibleClass);
            } else {
                item.classList.remove(visibleClass);
            }
        });
    }
}

function addPostHogDynamicInserts() {
    var DATA_PH_ATTR = 'data-ph';

    addTagListLinkInserts();
    addPaginationLinkInserts();

    function addTagListLinkInserts() {
        var tagListLinkClass = '.tag-list .tag-list-link';
        var mainTagList = document.querySelectorAll('.tag-list-all ' + tagListLinkClass);
        var postTagList = document.querySelectorAll('.posts-wrapper .post ' + tagListLinkClass);
        var blogPostTagList = document.querySelectorAll('.article-meta ' + tagListLinkClass);
        var contributorPostsTagList = document.querySelectorAll('.contributor-posts ' + tagListLinkClass);

        addDataAttributes(mainTagList, 'tag');
        addDataAttributes(postTagList, 'tag-post');
        addDataAttributes(blogPostTagList, 'tag-blog-post');
        addDataAttributes(contributorPostsTagList, 'tag-contributor-post');
    }

    function addPaginationLinkInserts() {
        var paginationLinks = document.querySelectorAll('.pagination a.page-number');
        var prevLink = document.querySelector('.pagination a.prev');
        var nextLink = document.querySelector('.pagination a.next');
        addDataAttributes(paginationLinks, 'page');
        addDataAttribute(prevLink, 'page-prev__link');
        addDataAttribute(nextLink, 'page-next__link');
    }

    function addDataAttributes(nodes, prefix) {
        if (nodes) {
            nodes.forEach(function(tagLink) {
                var linkName = tagLink.textContent.trim().replace(/ /g,'-');
                var phInsert = prefix + '__link_' + linkName;
                tagLink.setAttribute(DATA_PH_ATTR, phInsert);
            });
        }
    }

    function addDataAttribute(node, customName) {
        if (node) {
            node.setAttribute(DATA_PH_ATTR, customName);
        }
    }
}

function initPopup() {
    var popup = document.getElementById('popup');

    if (popup) {
        var daysToExpire = popup.getAttribute('data-expire');
        var storageKey = 'da_popup';

        if (isExpired()) {
            return;
        }

        var keyupListener;
        var scrollListener;

        registerCloseListeners()
        triggerByType();

        function isExpired() {
            if (isNumeric(daysToExpire)) {
                var lastShown = localStorage.getItem(storageKey);

                if (isNumeric(lastShown)) {
                    var now = new Date();
                    var day = 24 * 60 * 60 * 1000;

                    if (!(+lastShown + (day * +daysToExpire) < now.getTime())) {
                        popup.remove();
                        return true;
                    }
                }
            }
            return false;
        }

        function triggerByType() {
            var trigger = popup.getAttribute('data-trigger');

            if (isNumeric(trigger)) {
                setTimeout(function() {
                    open();
                }, +trigger);
            } else {
                scrollListener = function() {
                    if (window.scrollY > document.body.scrollHeight / 2) {
                        open();
                    }
                };

                document.addEventListener('scroll', scrollListener, {passive: true})
            }
        }

        function registerCloseListeners() {
            var closeButtons = popup.querySelectorAll('[data-close-popup]');

            closeButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    close();
                });
            });
        }

        function open() {
            popup.style.display = 'flex';
            popup.classList.add('animation-fade-in');

            if (scrollListener) {
                document.removeEventListener('scroll', scrollListener);
            }

            keyupListener = function (event) {
                if (popup && event.key === 'Escape') {
                    close();
                }
            };

            document.addEventListener('keyup', keyupListener);
        }

        function close() {
            popup.style.opacity = '0';

            var now = new Date();
            localStorage.setItem(storageKey, now.getTime().toString());

            setTimeout(function() {
                popup.style.display = 'none';
                popup.remove();

                if (keyupListener) {
                    document.removeEventListener('keyup', keyupListener);
                }
            }, 300);
        }

        function isNumeric(value) {
            return /^-?\d+$/.test(value);
        }
    }
}

function showBubble(timeout) {
    setTimeout(() => {
        var bubble = document.getElementById('main-banner-bubble');
        bubble.classList.add('show');
        
        var close = document.getElementById('main-banner-bubble-close');
        if (close) {
            close.addEventListener('click', function() {
                bubble.classList.remove('show');
            })
        }
    }, timeout);
}
