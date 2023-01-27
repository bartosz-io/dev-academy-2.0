window.addEventListener('DOMContentLoaded', function() {
    slider();

    if (!this.isTablet()) {
        businessPlans();
    }
});

function isLaptop() {
    return window.innerWidth > 1279;
}

function isTablet() {
    return window.innerWidth > 991;
}

function slider() {
    var slider = document.querySelector('.slider');

    if (!slider) {
        return;
    }

    var pagination = slider.querySelector('.slider-pagination');
    var sliderItems = slider.querySelectorAll('.slider-items .slider-item');
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
        return isLaptop() ? 6 : 2;
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

function businessPlans() {
    var plans = document.querySelectorAll('.business-plan-option');
    var plansContent = document.querySelectorAll('.business-plan-content');
    var activeClass = 'active';
    var planTypeString = 'data-plan';

    if (plans && plansContent) {
        plans.forEach(function(plan) {
            plan.addEventListener('click', function(event) {
                var academyType = event.currentTarget.getAttribute(planTypeString);

                plans.forEach((function(plan) {
                    plan.classList.remove(activeClass);
                }));

                plansContent.forEach((function(planContent) {
                    var academyContentType = planContent.getAttribute(planTypeString);

                    planContent.classList.remove(activeClass);

                    if (academyContentType === academyType) {
                        planContent.classList.add(activeClass);
                    }
                }));

                plan.classList.add(activeClass);
            })
        });

    }
}