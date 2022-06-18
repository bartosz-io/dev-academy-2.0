hexo.extend.generator.register('authors', function(locals) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return;
    }

    let authors = configAuthors.map(function(author) {
        var authorPosts = locals.posts.filter(post => post.author === author[0]);
        var level = authorPosts.length > 4 ? 'expert' : authorPosts.length > 2 ? 'advanced' : 'beginner';

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
        var level = authorPosts.length > 4 ? 'expert' : authorPosts.length > 1 ? 'advanced' : 'beginner';
        var authorData = {
            name: author[0],
            ...author[1],
            posts: authorPosts,
            postsCount: authorPosts.length,
            level: level
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

hexo.extend.helper.register('author_info', function(authorName, postDate) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return '/';
    }

    var author = configAuthors.find(author => author[0] === authorName);

    if (author) {
        var authorPosts = hexo.locals.get('posts').filter(post => post.author === author[0]);
        var level = authorPosts.length > 4 ? 'expert' : authorPosts.length > 1 ? 'advanced' : 'beginner';
        var articleSuffix = authorPosts.length === 1 ? 'Article' : 'Articles';

        var authorSpecs = author[1].specs;
        var specsTpl = '';

        authorSpecs.forEach((spec) => {
            specsTpl += `<span class="author-spec author-spec-${spec}" title="${spec} expert"></span>`
        });

        return `<div class="author-short-info">
            <div class="author-short-info-top">
                <span class="author-short-info-about">About The Author</span>
                <div class="author-short-info-date">
                    Posted: ${this.date(postDate, 'MMMM Do, YYYY')}
                </div>
            </div>
            <div class="author-short-info-bottom">
                <img src="${author[1].image}" alt="${author[0]}">
                <div class="author-short-info-desc">
                    <div class="author-short-info-header">
                        <h4><a href="${this.author_url(author[0])}">${author[0]}</a></h4>
                        <div class="author-specs">${specsTpl}</div>
                    </div>
                    <div class="author-short-info-count">⭐ ${authorPosts.length} ${articleSuffix}</div>
                    <div class="author-contribution-level author-contribution-level-after author-contribution-level-bold author-contribution-level-${level}">
                        <span>Beginner</span>
                        <span>Advanced</span>
                        <span>Expert</span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    return '';
});