// t5d-donate-log — tiny, dependency-free Cloudflare Worker that logs the
// optional "tell us it was you" notes from donate.html into Cloudflare KV.
// No framework, no npm install needed — just the Workers runtime + KV.
//
// Routes:
//   POST /submit            — public. Accepts the donate-page form, stores one entry.
//   GET  /log?key=ADMIN_KEY — protected by the ADMIN_KEY secret. Shows every
//                             stored entry as a simple HTML table.
//
// Deploy: see README.md in this folder.

const ALLOWED_ORIGIN = 'https://tec5uportdimension.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/submit' && request.method === 'POST') {
      let fields = {};
      const contentType = request.headers.get('Content-Type') || '';
      try {
        if (contentType.includes('application/json')) {
          fields = await request.json();
        } else {
          const form = await request.formData();
          for (const [k, v] of form.entries()) fields[k] = v;
        }
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: 'bad request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      // Short optional note fields, not a file upload — cap lengths defensively.
      const entry = {
        name: String(fields.name || '').slice(0, 200),
        email: String(fields.email || '').slice(0, 200),
        asset_amount: String(fields.asset_amount || '').slice(0, 200),
        network: String(fields.network || '').slice(0, 200),
        tx_hash: String(fields.tx_hash || '').slice(0, 200),
        note: String(fields.note || '').slice(0, 2000),
        received_at: new Date().toISOString(),
      };

      const key = `${Date.now()}-${crypto.randomUUID()}`;
      await env.DONATE_LOG.put(key, JSON.stringify(entry));

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    if (url.pathname === '/log' && request.method === 'GET') {
      const key = url.searchParams.get('key');
      if (!key || !env.ADMIN_KEY || key !== env.ADMIN_KEY) {
        return new Response('Not found', { status: 404 });
      }

      const list = await env.DONATE_LOG.list();
      const entries = (
        await Promise.all(
          list.keys.map(async (k) => {
            const raw = await env.DONATE_LOG.get(k.name);
            return raw ? JSON.parse(raw) : null;
          })
        )
      ).filter(Boolean);
      entries.sort((a, b) => (b.received_at || '').localeCompare(a.received_at || ''));

      const rows = entries.map((e) => `
        <tr>
          <td>${escapeHtml(e.received_at)}</td>
          <td>${escapeHtml(e.name)}</td>
          <td>${escapeHtml(e.email)}</td>
          <td>${escapeHtml(e.asset_amount)}</td>
          <td>${escapeHtml(e.network)}</td>
          <td>${escapeHtml(e.tx_hash)}</td>
          <td>${escapeHtml(e.note)}</td>
        </tr>`).join('');

      const html = `<!doctype html><html><head><meta charset="utf-8">
<title>T5D donation notes log</title>
<meta name="robots" content="noindex">
<style>
  body { font-family: system-ui, sans-serif; background:#05070D; color:#F7FAFF; padding:24px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #2D3743; padding: 8px 10px; text-align: left; vertical-align: top; font-size: 13px; }
  th { background: #0C1524; }
  h1 { font-size: 1.2rem; }
</style></head><body>
<h1>T5D donation notes (${entries.length})</h1>
<table><thead><tr><th>Received</th><th>Name</th><th>Email</th><th>Asset &amp; amount</th><th>Network</th><th>Tx hash</th><th>Note</th></tr></thead>
<tbody>${rows || '<tr><td colspan="7">No entries yet.</td></tr>'}</tbody></table>
</body></html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Not found', { status: 404 });
  },
};
