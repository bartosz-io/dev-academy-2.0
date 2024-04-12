const pagination = require('hexo-pagination');

hexo.extend.generator.register('index', function(locals){
    const excludeCategory = 'Podcast';
    const filteredPosts = locals.posts.filter(post => !post.categories.some(category => category.name === excludeCategory));

    const sortedPosts = filteredPosts.sort('-date');

    const config = this.config;
    const perPage = config.index_generator.per_page;
    const paginationDir = config.pagination_dir || 'page';
    const path = config.index_generator.path || '';

    return pagination(path, sortedPosts, {
        perPage: perPage,
        layout: ['index', 'archive'],
        format: paginationDir + '/%d/',
        data: {
            __index: true
        }
    });
});
