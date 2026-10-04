// donate.js — QR code render + copy-to-clipboard for the direct donation
// address on donate.html. No wallet connection, no transactions — this page
// only displays a receiving address.

window.addEventListener('load', () => {
  const address = document.getElementById('donate-address-value')?.textContent?.trim();
  const qrHost = document.getElementById('donate-qr');

  if (address && qrHost && window.QRCode) {
    new QRCode(qrHost, {
      text: address,
      width: 148,
      height: 148,
      colorDark: '#05070D',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  const copyBtn = document.getElementById('copy-address-btn');
  if (copyBtn && address) {
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(address);
        } else {
          const tmp = document.createElement('textarea');
          tmp.value = address;
          tmp.style.position = 'fixed';
          tmp.style.opacity = '0';
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand('copy');
          document.body.removeChild(tmp);
        }
        const originalLabel = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('is-copied');
        setTimeout(() => {
          copyBtn.textContent = originalLabel;
          copyBtn.classList.remove('is-copied');
        }, 2000);
      } catch (err) {
        console.warn('Copy failed', err);
        copyBtn.textContent = 'Copy failed — select manually';
      }
    });
  }
});

// --- Optional "Tell us it was you" donor-note form -------------------------
// Submits to the t5d-donate-log Cloudflare Worker (see /donate-log-worker/
// in this repo). The form's action attribute is a placeholder until that
// Worker is deployed and its real *.workers.dev URL is wired in here.
window.addEventListener('load', () => {
  const form = document.getElementById('donate-note-form');
  if (!form) return;

  const status = document.getElementById('donate-note-status');
  const submitBtn = document.getElementById('donate-note-submit');
  const isPlaceholder = form.action.includes('.example.workers.dev');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isPlaceholder) {
      status.textContent = "This isn't wired up yet — thanks for filling it out though!";
      status.className = 'donate-note-status is-error';
      return;
    }

    submitBtn.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'donate-note-status';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        status.textContent = 'Thanks — got it.';
        status.className = 'donate-note-status is-success';
        form.reset();
      } else {
        status.textContent = "That didn't go through — please try again in a moment.";
        status.className = 'donate-note-status is-error';
      }
    } catch (err) {
      console.warn('Donate note submit failed', err);
      status.textContent = "That didn't go through — check your connection and try again.";
      status.className = 'donate-note-status is-error';
    } finally {
      submitBtn.disabled = false;
    }
  });
});
