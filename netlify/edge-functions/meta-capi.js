const META_PIXEL_ID = '189349068273059';
const META_EVENTS_URL = `https://graph.facebook.com/v23.0/${META_PIXEL_ID}/events`;
const ALLOWED_ORIGIN = 'https://dev-academy.com';
const ALLOWED_EVENTS = ['PageView', 'ViewContent', 'Lead'];
const ALLOWED_FIELDS = ['event_name', 'event_id', 'event_source_url', 'fbc', 'custom_data'];
const MAX_BODY_LENGTH = 8192;

const jsonResponse = (accepted, status) => new Response(JSON.stringify({accepted}), {
  status,
  headers: {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8'
  }
});

const isPlainObject = (value) => value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value);

const sanitizeCustomData = (value) => {
  const result = {};
  if (!isPlainObject(value)) return result;
  if (typeof value.content_name === 'string') {
    result.content_name = value.content_name.slice(0, 80);
  }
  if (typeof value.content_category === 'string') {
    result.content_category = value.content_category.slice(0, 80);
  }
  return result;
};

const isCanonicalSourceUrl = (value) => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.origin === ALLOWED_ORIGIN &&
      url.username === '' &&
      url.password === '' &&
      url.search === '' &&
      url.hash === '';
  } catch (_error) {
    return false;
  }
};

const validPayload = (value) => {
  if (!isPlainObject(value)) return false;
  if (Object.keys(value).some((key) => !ALLOWED_FIELDS.includes(key))) return false;
  if (!ALLOWED_EVENTS.includes(value.event_name)) return false;
  if (typeof value.event_id !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(value.event_id)) {
    return false;
  }
  if (!isCanonicalSourceUrl(value.event_source_url)) return false;
  if (value.fbc !== undefined &&
      (typeof value.fbc !== 'string' || !/^fb\.1\.\d{13}\.[A-Za-z0-9_-]{1,500}$/.test(value.fbc))) {
    return false;
  }
  if (value.custom_data !== undefined && !isPlainObject(value.custom_data)) return false;
  return true;
};

export default async (request, context) => {
  if (request.method !== 'POST') return jsonResponse(false, 405);
  if (request.headers.get('origin') !== ALLOWED_ORIGIN) return jsonResponse(false, 403);
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return jsonResponse(false, 415);
  }

  let rawBody;
  let input;
  try {
    rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) return jsonResponse(false, 413);
    input = JSON.parse(rawBody);
  } catch (_error) {
    return jsonResponse(false, 400);
  }
  if (!validPayload(input)) return jsonResponse(false, 400);

  const accessToken = Netlify.env.get('META_CAPI_ACCESS_TOKEN');
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    return jsonResponse(false, 503);
  }

  const userData = {
    client_ip_address: context.ip,
    client_user_agent: request.headers.get('user-agent') || ''
  };
  if (input.fbc) userData.fbc = input.fbc;

  const metaPayload = {
    data: [{
      event_name: input.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.event_id,
      action_source: 'website',
      event_source_url: input.event_source_url,
      user_data: userData,
      custom_data: sanitizeCustomData(input.custom_data)
    }]
  };

  try {
    const upstream = await fetch(META_EVENTS_URL, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + accessToken,
        'content-type': 'application/json'
      },
      body: JSON.stringify(metaPayload)
    });
    if (!upstream.ok) return jsonResponse(false, 502);
    const result = await upstream.json();
    if (!result || result.events_received !== 1) return jsonResponse(false, 502);
    return jsonResponse(true, 200);
  } catch (_error) {
    return jsonResponse(false, 502);
  }
};

export const config = {path: '/api/meta/events'};
