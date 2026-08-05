const addNoTransform = (cacheControl) => {
  if (!cacheControl) return 'no-transform';
  if (/(?:^|,)\s*no-transform\s*(?:,|$)/i.test(cacheControl)) return cacheControl;
  return `${cacheControl}, no-transform`;
};

export default async (_request, context) => {
  const response = await context.next({ sendConditionalRequest: true });
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.toLowerCase().includes('text/html')) return response;

  const headers = new Headers(response.headers);
  headers.set('cache-control', addNoTransform(headers.get('cache-control')));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config = {
  path: '/*',
};
