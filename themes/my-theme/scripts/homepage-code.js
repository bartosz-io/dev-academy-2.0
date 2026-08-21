'use strict';

const {highlight} = require('hexo-util');

hexo.extend.helper.register('homepage_code', function homepageCode(code, language) {
  return highlight(code, {
    gutter: false,
    hljs: true,
    lang: language || 'plaintext',
    wrap: false
  });
});
