# donate-log-worker

A tiny, dependency-free Cloudflare Worker that logs the optional "Tell us it
was you" notes from the donate page (`donate.html`) into Cloudflare KV —
no framework, no `npm install`, just the Workers runtime + KV. Fully
owned by you: nobody else ever sees this data, and nothing expires (unlike
a free-tier third-party form service).

This is separate from the main `t5d-website`/`t5d-website-v2` Workers — it
doesn't touch the live site's deploy, it's its own small service.

## Deploy (one-time, three commands)

From this folder, in your own PowerShell:

```powershell
cd t5d-website-\donate-log-worker
npx wrangler kv namespace create T5D_DONATE_LOG
```

That prints something like:
```
{ binding = "DONATE_LOG", id = "abcd1234efgh5678..." }
```

Copy that `id` value into `wrangler.jsonc` in this folder, replacing
`PASTE_YOUR_KV_NAMESPACE_ID_HERE`.

Then pick a private passphrase — anything you like, just keep it to
yourself, since it's what protects the `/log` page that shows every
submission:

```powershell
npx wrangler secret put ADMIN_KEY
```
(It'll prompt you to paste/type the passphrase — nothing is echoed back.)

Then deploy:

```powershell
npx wrangler deploy
```

This prints a URL like:
```
https://t5d-donate-log.<your-subdomain>.workers.dev
```

## After deploying

- **Give that URL to Claude** (or paste it back into this chat) so the
  donate page's form can be pointed at it — right now it points at a
  placeholder and the "Tell us it was you" box will just say so if someone
  tries to submit it before this is wired up.
- **View the log any time** by visiting:
  `https://t5d-donate-log.<your-subdomain>.workers.dev/log?key=<your passphrase>`
- Everything is free at this scale (Cloudflare's free tier: 100,000
  requests/day on Workers, 1,000 writes/day + unlimited reads on KV — a
  donation-notes form will never get close to that).

## If you ever want to change the passphrase

Just run `npx wrangler secret put ADMIN_KEY` again from this folder with a
new value — it overwrites the old one.
