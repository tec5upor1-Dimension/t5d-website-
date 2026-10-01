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
