const json = (value, status = 200) => Response.json(value, {
  status, headers: { 'Cache-Control': 'no-store' },
});
const error = (code, status) => json({ error: code }, status);
const digest = async value => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
const validEpisode = value => typeof value === 'string' && /^\d{2}$/.test(value);
const controls = /[\x00-\x1f\x7f-\x9f]/;

async function authorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  const [actual, expected] = await Promise.all([
    digest(header), digest(`Bearer ${env.ADMIN_TOKEN || ''}`),
  ]);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= actual[i] ^ expected[i];
  return !!env.ADMIN_TOKEN && difference === 0;
}

async function api(request, env, url) {
  const { pathname } = url;
  if (pathname.startsWith('/api/admin/')) {
    if (!await authorized(request, env)) return error('unauthorized', 401);
    if (request.method === 'GET' && pathname === '/api/admin/comments') {
      const { results } = await env.DB.prepare(`SELECT id, episode, lang, name, body, created_at
        FROM comments ORDER BY created_at DESC, id DESC LIMIT 200`).all();
      return json(results);
    }
    const match = pathname.match(/^\/api\/admin\/comments\/([1-9]\d*)$/);
    if (request.method === 'DELETE' && match) {
      await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(match[1]).run();
      return json({ ok: true });
    }
  }
  if (request.method === 'GET' && pathname === '/api/config') {
    return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY });
  }
  if (request.method === 'GET' && pathname === '/api/comments') {
    const episode = url.searchParams.get('episode');
    if (!validEpisode(episode)) return error('invalid', 400);
    const { results } = await env.DB.prepare(`SELECT id, name, body, created_at FROM comments
      WHERE episode = ? ORDER BY created_at, id LIMIT 500`).bind(episode).all();
    return json(results);
  }
  if (request.method === 'POST' && pathname === '/api/comments') {
    let input;
    try { input = await request.json(); } catch { return error('invalid', 400); }
    if (!input || typeof input !== 'object') return error('invalid', 400);
    const { episode, lang, token } = input;
    if (!validEpisode(episode) || typeof input.name !== 'string' || typeof input.body !== 'string' ||
        controls.test(input.name) || controls.test(input.body.replace(/[\r\n]/g, '')) ||
        (lang != null && !['vi', 'en'].includes(lang))) return error('invalid', 400);
    const name = input.name.trim().replace(/\s+/g, ' ');
    const body = input.body.replace(/\r\n?/g, '\n').trim();
    if (!name || name.length > 40 || !body || body.length > 2000) return error('invalid', 400);
    if (typeof token !== 'string' || !token || token.length > 2048) return error('verification_failed', 403);
    if (!env.TURNSTILE_SECRET || !env.IP_SALT) return error('network', 500);
    const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    let verification;
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
        signal: AbortSignal.timeout(10000),
      });
      verification = await response.json();
    } catch { return error('verification_failed', 403); }
    if (!verification.success) return error('verification_failed', 403);
    const ipHash = Array.from(await digest(ip + env.IP_SALT), byte => byte.toString(16).padStart(2, '0')).join('');
    const now = Math.floor(Date.now() / 1000);
    // Count and insert in one statement so concurrent requests cannot bypass the limit.
    const comment = await env.DB.prepare(`INSERT INTO comments (episode, name, body, lang, created_at, ip_hash)
      SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM comments WHERE ip_hash = ? AND created_at > ?) < 5
      RETURNING id, name, body, created_at`).bind(episode, name, body, lang ?? null, now, ipHash, ipHash, now - 600).first();
    return comment ? json(comment, 201) : error('rate_limited', 429);
  }
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return error('invalid', 403);
    try { return await api(request, env, url); }
    catch { return error('network', 500); }
  },
};
