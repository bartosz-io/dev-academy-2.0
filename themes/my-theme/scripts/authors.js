hexo.extend.generator.register('authors', function(locals) {
    var configAuthors = Object.entries(this.config.authors);

    if (!configAuthors.length) {
        return;
    }

    let authors = configAuthors.map(function(author) {
        var authorPosts = locals.posts.filter(post => post.author === author[0]);
        var level = authorPosts.length > 4 ? 'expert' : authorPosts.length > 1 ? 'advanced' : 'beginner';

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
        var authorData = {
            name: author[0],
            ...author[1],
            posts: authorPosts,
            postsCount: authorPosts.length,
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

// TODO add helper to get specific author + HTML