/**
 * Global variables
 * */

window.DESKTOP_STICKY_HEADER = true;


/**
 * Scripts initialization
 * */

document.addEventListener('DOMContentLoaded', function() {
    if (isTablet()) {
        stickyNavigation();
        // loadOdometer();
    } else {
        mobileNavigation();
    }

    if (isLaptop()) {
        if (isPostPage()) {
            cloneArticleTOC();
        }

        if (isIndexPage()) {
            animateInfoBoxes();
        }
    }

    if (isIndexPage()) {
        slider();
    }

    if (isTagPage()) {
        setActiveTagPill();
    }

    // cookieConsent();
    addPostHogDynamicInserts();
    loadDisqusComments();
    loadConvertKit();
    relatedPosts();
    contributors();
    userGoals();
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