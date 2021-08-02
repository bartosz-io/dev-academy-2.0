const { resolve } = require('url');
const { encodeURL } = require('hexo-util');

hexo.extend.tag.register('img', function (args) {
  var path = encodeURL(resolve('/', this.path));
  var src = args[0];
  var alt = args[1];
  var loading = args[2] ? args[2] : 'auto';
  return `<img loading="${loading}"
            alt="${alt}"
            src="${path}${src}">`;
});
