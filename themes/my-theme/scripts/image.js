const { resolve } = require('url');
const { encodeURL } = require('hexo-util');

function getSrcSet(path, src) {
  return `srcset="${path}small_${src} 360w, ${path}medium_${src} 640w, ${path}large_${src} 1086w"`;
}

function getSizes(maxWidth = '1086px') {
  return `sizes="(max-width: 400px) 360px, (max-width: 768px) 640px, ${maxWidth}"`;
}

function getAlt(alt) {
  return alt ? ` alt="${alt}"` : "";
}

function resolvePathURL(path) {
  return encodeURL(resolve('/', path));
}

function getWebpFile(src) {
  return src.substr(0, src.lastIndexOf(".")) + ".webp";
}

hexo.extend.tag.register('image', function (args) {
  var path = resolvePathURL(this.path);
  var maxWidth = args[0];
  var src = args[1];
  var alt = args[2];
  var srcWebp = getWebpFile(src);

  return `<picture>
    <source type="image/webp"
      ${getSrcSet(path, srcWebp)}
      ${getSizes(maxWidth)}>
    <img loading="lazy"
      ${getSrcSet(path, src)}
      ${getSizes(maxWidth)}
      ${getAlt(alt)}
      src="${path}${src}">
  </picture>`;
});

hexo.extend.tag.register('image_fw', function (args) {
  var path = resolvePathURL(this.path);
  var ratio = args[0];
  var src = args[1];
  var alt = args[2];
  var srcWebp = getWebpFile(src);

  return `<picture>
    <source type="image/webp" 
        ${getSrcSet(path, srcWebp)} 
        ${getSizes()}>
    <img style="width: 100%; height: auto; aspect-ratio: ${ratio}"
      ${getSrcSet(path, src)}
      ${getSizes()}
      ${getAlt(alt)}
      itemprop="image"
      src="${path}${src}">
  </picture>`;
});

hexo.extend.tag.register('banner_ad', function (args) {
  var assetPath = args[0];
  var targetUrl = args[1];

  return `<a class="course-image" href="${targetUrl}" rel="nofollow" data-ph="banner__link" aria-label="Dev Academy courses">
    <img src="/img/${assetPath}" alt="" loading="lazy">
  </a>`;
});

hexo.extend.tag.register('review_screen', function (args) {
  var assetPath = args[0];
  var targetUrl = args[1];

  return `<div aria-label="Web Security Academy">
    <div class="review-screen">
      <img class="review-screen-img" src="/img/${assetPath}" alt="" loading="lazy">
      <div class="review-screen-content">
        <div>Discover why thousands of developers love to learn at <b>Web Security Academy</b> ♥️</div>
        <a class="button button-primary" href="${targetUrl}" data-ph="review-screen__link">Learn more</a>
      </div>
    </div>
  </div>`;
});
