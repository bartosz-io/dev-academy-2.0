const BEGINNER_MAX = 2;
const ADVANCED_MAX = 4;

hexo.extend.generator.register('contributors', function(locals) {
    var configcontributors = Object.entries(this.config.contributors);

    if (!configcontributors.length) {
        return;
    }

    let contributors = configcontributors.map(function(contributor) {
        var contributorPosts = locals.posts.filter(post => post.contributor === contributor[0]);
        var level = contributorLevel(contributorPosts.length);

        return {
            name: contributor[0],
            ...contributor[1],
            posts: contributorPosts,
            postsCount: contributorPosts.length,
            level: level
        };
    }).sort((c1, c2) => c2.postsCount - c1.postsCount);

    return {
        path: 'contributors/index.html',
        data: {
            contributors: contributors
        },
        layout: 'contributors'
    }
});

hexo.extend.generator.register('contributor', function(locals) {
    var configcontributors = Object.entries(this.config.contributors);

    if (!configcontributors.length) {
        return;
    }

    var routes = [];

    configcontributors.forEach(function(contributor) {
        var slug = contributor[1].slug.trim();
        var contributorPosts = locals.posts.filter(post => post.contributor === contributor[0]);
        var level = contributorLevel(contributorPosts.length);
        var completedCourses = 0;

        if (contributor[1].academies.fta) {
            completedCourses++;
        }

        if (contributor[1].academies.wsa) {
            completedCourses++;
        }

        var contributorData = {
            name: contributor[0],
            ...contributor[1],
            posts: contributorPosts,
            postsCount: contributorPosts.length,
            level: level,
            completedCourses: completedCourses
        };

        routes.push({
            path: 'contributors/' + slug + '/index.html',
            data: {
                contributor: contributorData,
                title: contributor[0] + ' | Dev-Academy.com contributor'
            },
            layout: 'contributor'
        })
    });

    return routes;
});

hexo.extend.helper.register('contributor_academies', function(contributorName, insertPrefix) {
    var configcontributors = Object.entries(this.config.contributors);

    if (!configcontributors.length) {
        return '';
    }

    var contributor = configcontributors.find(contributor => contributor[0] === contributorName);

    if (contributor) {
        return contributorAcademies(contributor, contributorName, insertPrefix);
    }

    return '';
});

hexo.extend.helper.register('contributor_url', function(contributorName) {
    var configcontributors = Object.entries(this.config.contributors);

    if (!configcontributors.length) {
        return '/';
    }

    var contributor = configcontributors.find(contributor => contributor[0] === contributorName);


    return `/contributors/${contributor[1].slug}`;
});

hexo.extend.helper.register('contributor_contribution_level', function(contributorName) {
    var configcontributors = Object.entries(this.config.contributors);

    if (!configcontributors.length) {
        return '/';
    }

    var contributor = configcontributors.find(contributor => contributor[0] === contributorName);

    if (contributor) {
        var contributorPosts = hexo.locals.get('posts').filter(post => post.contributor === contributor[0]);
        var level = contributorLevel(contributorPosts.length);

        return contributorContributionLevel(level, true);
    }

    return '';
});

hexo.extend.helper.register('contributor_info', function(contributorName) {
    var configcontributors = Object.entries(this.config.contributors);

    if (!configcontributors.length) {
        return '/';
    }

    var contributor = configcontributors.find(contributor => contributor[0] === contributorName);

    if (contributor) {
        var contributorPosts = hexo.locals.get('posts').filter(post => post.contributor === contributor[0]);
        var level = contributorLevel(contributorPosts.length);
        var profession = contributorName === 'Bartosz Pietrucha' ? 'Founder' : 'Contributor';

        return `<div class="contributor-short-info">
            <img src="${contributor[1].image}" alt="${contributor[0]}">
            <div class="contributor-short-info-desc">
                <div class="contributor-short-info-header">
                    <div class="contributor-profession">${profession}</div>
                    <h4><a href="${this.contributor_url(contributor[0])}" data-ph="item-contributor__link_fullname">${contributor[0]}</a></h4>
                </div>
                ${contributorContributionLevel(level)}
                ${contributorAcademies(contributor, contributorName, 'article-footer')}
                <a href="${this.contributor_url(contributor[0])}" class="contributor-visit" data-ph="article-footer-contributor__link_discover">Get to know me better</a>
            </div>
        </div>`;
    }

    return '';
});

hexo.extend.helper.register('contributor_level', function(contributorName) {
    var configcontributors = Object.entries(this.config.contributors);

    if (!configcontributors.length) {
        return '/';
    }

    var contributor = configcontributors.find(contributor => contributor[0] === contributorName);

    if (contributor) {
        var contributorPosts = hexo.locals.get('posts').filter(post => post.contributor === contributor[0]);
        return contributorLevel(contributorPosts.length);
    }
    return '';
});

function contributorContributionLevel(level, highlighted = false) {
    var isHighlighted = highlighted ? 'contributor-contribution-level-highlighted' : ''
    return `<div class="contributor-contribution-level contributor-contribution-level-${level} ${isHighlighted}">
                <span>Beginner</span>
                <span>Advanced</span>
                <span>Expert</span>
            </div>`
}

function contributorLevel(numberOfPosts) {
    return numberOfPosts > ADVANCED_MAX ? 'expert' : numberOfPosts > BEGINNER_MAX ? 'advanced' : 'beginner';
}

function contributorAcademies(contributor, contributorName, insertPrefix) {
    var isWsa = contributor[1].academies.wsa;
    var isFta = contributor[1].academies.fta;
    var isFounder = contributorName === 'Bartosz Pietrucha';

    var wsaTpl = isWsa ? 'Web Security Academy' : '';
    var ftaTpl = isFta ? 'Fullstack Testing Academy' : '' ;
    var role = isFounder ? 'founder' : 'member';
    var badge = isFounder ? '🎖️' : '🏅';
    var postHogInsertWSA = insertPrefix + '-contributor-academies__link_wsa';
    var postHogInsertFTA = insertPrefix + '-contributor-academies__link_fta';

    if (wsaTpl && ftaTpl) {
        return `<ul class="contributor-academies">
                  <li>${badge} <a href="https://websecurity-academy.com/" data-ph="${postHogInsertWSA}" rel="nofollow noopener" target="_blank">${wsaTpl}</a> <span>${role}</span></li>
                  <li>${badge} <a href="https://fullstack-testing.com/" data-ph="${postHogInsertFTA}" rel="nofollow noopener" target="_blank">${ftaTpl}</a> <span>${role}</span></li>
                </ul>`;
    } else if (wsaTpl) {
        return `<ul class="contributor-academies">
                  <li>${badge} <a href="https://websecurity-academy.com/" data-ph="${postHogInsertWSA}" rel="nofollow noopener" target="_blank">${wsaTpl}</a> <span>${role}</span></li>
                </ul>`;
    } else if (ftaTpl) {
        return `<ul class="contributor-academies">
                  <li>${badge} <a href="https://fullstack-testing.com/" data-ph="${postHogInsertFTA}" rel="nofollow noopener" target="_blank">${ftaTpl}</a> <span>${role}</span></li>
                </ul>`;
    }
    return '';
}