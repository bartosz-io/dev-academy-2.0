const BEGINNER_MAX = 2;
const ADVANCED_MAX = 4;

hexo.extend.generator.register('authors', function(locals) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return;
    }

    let authors = configAuthors.map(function(author) {
        var authorPosts = locals.posts.filter(post => post.author === author[0]);
        var level = authorPosts.length > ADVANCED_MAX ? 'expert' : authorPosts.length > BEGINNER_MAX ? 'advanced' : 'beginner';

        return {
            name: author[0],
            ...author[1],
            posts: authorPosts,
            postsCount: authorPosts.length,
            level: level
        };
    });

    return {
        path: 'authors/index.html',
        data: {
            authors: authors
        },
        layout: 'authors'
    }
});

hexo.extend.generator.register('author', function(locals) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return;
    }

    var routes = [];

    configAuthors.forEach(function(author) {
        var slug = author[1].slug.trim();
        var authorPosts = locals.posts.filter(post => post.author === author[0]);
        var level = authorPosts.length > ADVANCED_MAX ? 'expert' : authorPosts.length > BEGINNER_MAX ? 'advanced' : 'beginner';
        var completedCourses = 0;

        if (author[1].academies.fta) {
            completedCourses++;
        }

        if (author[1].academies.wsa) {
            completedCourses++;
        }

        var authorData = {
            name: author[0],
            ...author[1],
            posts: authorPosts,
            postsCount: authorPosts.length,
            level: level,
            completedCourses: completedCourses
        };

        routes.push({
            path: 'authors/' + slug + '/index.html',
            data: {
                author: authorData
            },
            layout: 'author'
        })
    });

    return routes;
});

hexo.extend.helper.register('author_academies', function(authorName) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return '';
    }

    var author = configAuthors.find(author => author[0] === authorName);

    if (author) {
        return authorAcademies(author, authorName);
    }

    return '';
});

hexo.extend.helper.register('author_url', function(authorName) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return '/';
    }

    var author = configAuthors.find(author => author[0] === authorName);


    return `/authors/${author[1].slug}`;
});

hexo.extend.helper.register('author_contribution_level', function(authorName) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return '/';
    }

    var author = configAuthors.find(author => author[0] === authorName);

    if (author) {
        var authorPosts = hexo.locals.get('posts').filter(post => post.author === author[0]);
        var level = authorPosts.length > ADVANCED_MAX ? 'expert' : authorPosts.length > BEGINNER_MAX ? 'advanced' : 'beginner';

        return authorContributionLevel(level, true);
    }

    return '';
});

hexo.extend.helper.register('author_info', function(authorName) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return '/';
    }

    var author = configAuthors.find(author => author[0] === authorName);

    if (author) {
        var authorPosts = hexo.locals.get('posts').filter(post => post.author === author[0]);
        var level = authorPosts.length > 4 ? 'expert' : authorPosts.length > 1 ? 'advanced' : 'beginner';
        var profession = authorName === 'Bartosz Pietrucha' ? 'Founder' : 'Contributor';

        return `<div class="author-short-info">
            <img src="${author[1].image}" alt="${author[0]}">
            <div class="author-short-info-desc">
                <div class="author-short-info-header">
                    <div class="author-profession">${profession}</div>
                    <h4><a href="${this.author_url(author[0])}">${author[0]}</a></h4>
                </div>
                ${authorContributionLevel(level)}
                ${authorAcademies(author, authorName)}
                <a href="${this.author_url(author[0])}" class="author-visit">Get to know me better</a>
            </div>
        </div>`;
    }

    return '';
});

function authorContributionLevel(level, highlighted = false) {
    var isHighlighted = highlighted ? 'author-contribution-level-highlighted' : ''
    return `<div class="author-contribution-level author-contribution-level-${level} ${isHighlighted}">
                <span>Beginner</span>
                <span>Advanced</span>
                <span>Expert</span>
            </div>`
}

function authorAcademies(author, authorName) {
    var isWsa = author[1].academies.wsa;
    var isFta = author[1].academies.fta;
    var isFounder = authorName === 'Bartosz Pietrucha';

    var wsaTplFounder = '🎖️ Web Security Academy founder';
    var ftaTplFounder = '🎖️ Fullstack Testing Academy founder';

    var wsaTpl = isFounder ? wsaTplFounder : isWsa ? '🏅 Web Security Academy member' : '';
    var ftaTpl = isFounder ? ftaTplFounder : isFta ? '🏅 Fullstack Testing Academy member' : '' ;

    if (wsaTpl && ftaTpl) {
        return `<ul class="author-academies">
                  <li><a href="https://websecurity-academy.com/" rel="nofollow noopener" target="_blank">${wsaTpl}</a></li>
                  <li><a href="https://fullstack-testing.com/" rel="nofollow noopener" target="_blank">${ftaTpl}</a></li>
                </ul>`;
    } else if (wsaTpl) {
        return `<ul class="author-academies">
                  <li><a href="https://websecurity-academy.com/" rel="nofollow noopener" target="_blank">${wsaTpl}</a></li>
                </ul>`;
    } else if (ftaTpl) {
        return `<ul class="author-academies">
                  <li><a href="https://fullstack-testing.com/" rel="nofollow noopener" target="_blank">${ftaTpl}</a></li>
                </ul>`;
    }
    return '';
}