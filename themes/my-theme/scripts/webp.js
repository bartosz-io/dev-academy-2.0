const Promise = require('bluebird');
const imagemin = require("imagemin");
const webp = require("imagemin-webp");
const minimatch = require('minimatch');
const streamToArray = require('stream-to-array');

hexo.extend.filter.register('after_generate', function () {
  if (!this.config.generate_webp_images) {
    return;
  }

  var route = this.route;

  var routes = route.list().filter(function(path) {
    return minimatch(path, '**/*.{jpg,jpeg,png}', { nocase: true });
  });

  return Promise.map(routes, function(path) {
    var stream = route.get(path);
    return streamToArray(stream).then(function(arr) {
      return Buffer.concat(arr);
    }).then(function(buffer) {
      return imagemin.buffer(buffer, {
        plugins: [
          webp({ quality: 90 })
        ]
      }).then(function (file) {
        var newPath = path.substr(0, path.lastIndexOf(".")) + ".webp";
        route.set(newPath, file);
      });

    });
  });

});

