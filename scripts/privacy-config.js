'use strict';

hexo.extend.filter.register('before_generate', function() {
  var privacy = hexo.config.privacy || {};
  privacy.posthog_key = process.env.PUBLIC_POSTHOG_KEY || privacy.posthog_key;
  privacy.posthog_host = process.env.PUBLIC_POSTHOG_HOST || privacy.posthog_host;
  privacy.posthog_asset_host = process.env.PUBLIC_POSTHOG_ASSET_HOST || privacy.posthog_asset_host;
  privacy.meta_pixel_id = process.env.PUBLIC_META_PIXEL_ID || privacy.meta_pixel_id;
  hexo.config.privacy = privacy;
});
