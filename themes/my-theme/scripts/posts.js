hexo.extend.helper.register('post_ph_attr', function(postUrl, insertPrefix) {
    var url = postUrl.trim().replace(/\//g,'');
    return ` data-ph="${insertPrefix}__link_${url}"`;
});