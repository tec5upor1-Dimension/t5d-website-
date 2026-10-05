// presale-wallet.js
// Wires the T5D community presale purchase shell to a real wallet and the
// currently deployed T5DPresale contract.
//
// IMPORTANT — TESTNET PREVIEW ONLY (2026-09-30): NETWORK/PRESALE_ADDRESS
// below point at the Base Sepolia preview deployment, not Base mainnet.
// T5D has not deployed to mainnet yet (see claude/t5d-checklist.md — Safe
// signer threshold, final timestamps, Team/Strategic list, audit, and the
// mainnet deploy itself are all still open). Swap the CONFIG block below
// for mainnet values once that deploy lands, and remove the testnet banner
// in t5d-presale.html at the same time.
//
// Wallet support, two paths that converge on the same contribute flow:
//  1. Browser-injected wallets (MetaMask, Coinbase Wallet extension, Brave
//     Wallet, Rabby, OKX Wallet, etc. — EIP-1193/EIP-6963), via
//     window.ethereum directly. Zero signup, works the moment the page
//     loads.
//  2. WalletConnect / mobile wallets, via Reown AppKit (2026-09-30) — see
//     wallet-build/src/presale-connect.js, compiled to
//     presale-connect.bundle.js and loaded as a separate <script> tag
//     before this one. That bundle exposes window.T5DWalletConnect; this
//     file only reads that global, so if the bundle is missing or fails to
//     load for any reason, the injected-wallet path keeps working exactly
//     as before and the WalletConnect button just stays disabled.
//
// Loaded as: <script type="module" src="presale-wallet.js"></script>

import { BrowserProvider, JsonRpcProvider, Contract, formatUnits, parseUnits } from 'https://cdn.jsdelivr.net/npm/ethers@6.13.4/+esm';

// ---------------------------------------------------------------------------
// CONFIG — testnet preview deployment (see t5d-checklist.md "Current
// testnet deployment"). Replace with mainnet values when that deploy lands.
// ---------------------------------------------------------------------------
const NETWORK = {
  chainIdHex: '0x14a34', // 84532
  chainIdDec: 84532,
  chainName: 'Base Sepolia',
  rpcUrls: ['https://sepolia.base.org'],
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

const PRESALE_ADDRESS = '0x47D2F3Bbd78844DCaB304Ce306B404B7Bc90eEb9';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const USDC_DECIMALS = 6;
const T5D_DECIMALS = 18;

const PRESALE_ABI = [
  'function contribute(uint256 usdcAmount) external',
  'function contributions(address) view returns (uint256 usdcContributed, uint256 tokensOwed, uint256 claimedAmount, bool refunded)',
  'function totalUsdcRaised() view returns (uint256)',
  'function totalTokensSold() view returns (uint256)',
  'function presaleSupply() view returns (uint256)',
  'function pricePerTokenUsdc() view returns (uint256)',
  'function softCapUsdc() view returns (uint256)',
  'function perWalletCapTokens() view returns (uint256)',
  'function startTime() view returns (uint256)',
  'function endTime() view returns (uint256)',
  'function finalized() view returns (bool)',
  'function softCapMet() view returns (bool)',
  'function softCapFailed() view returns (bool)',
  'function refund() external',
];

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

// ---------------------------------------------------------------------------
// DOM
// ---------------------------------------------------------------------------
const dom = {
  statusTag: document.getElementById('portal-status-tag'),
  networkTag: document.getElementById('portal-network-tag'),
  walletStatus: document.getElementById('wallet-status'),
  connectBtn: document.getElementById('portal-connect-btn'),
  walletConnectBtn: document.getElementById('portal-walletconnect-btn'),
  actionNote: document.getElementById('portal-action-note'),
  amountInput: document.getElementById('contribution-amount'),
  unitLabel: document.getElementById('amount-unit-label'),
  usdcChip: document.getElementById('asset-chip-usdc'),
  allowlistLabel: document.getElementById('asset-allowlist-label'),
  quoteAvailabilityLabel: document.getElementById('quote-availability-label'),
  quoteUsdcValue: document.getElementById('quote-usdc-value'),
  quoteT5dValue: document.getElementById('quote-t5d-value'),
  quoteNote: document.getElementById('quote-note'),
  refundPanel: document.getElementById('portal-refund-panel'),
  refundBtn: document.getElementById('portal-refund-btn'),
  refundNote: document.getElementById('portal-refund-note'),
};

if (dom.connectBtn || dom.walletConnectBtn) {
  init();
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let provider = null;
let signer = null;
let userAddress = null;
let presaleWrite = null; // signer-connected, set after a successful connect
let usdcWrite = null;
let snapshot = null; // last-read contract state (read-only, works pre-connect)
let selectedAsset = null;
let submitting = false;
let connectionSource = null; // 'injected' | 'walletconnect' — which path is live, for network-switch routing
let wcUnsubscribe = null;

function init() {
  const hasInjected = Boolean(window.ethereum);
  const hasWalletConnect = Boolean(window.T5DWalletConnect);

  if (!hasInjected && !hasWalletConnect) {
    setStatus('No wallet connection method is available right now. Install MetaMask, Coinbase Wallet, or another browser wallet, or reload the page and try again.', 'warning');
    if (dom.connectBtn) { dom.connectBtn.textContent = 'No wallet found'; dom.connectBtn.disabled = true; }
    if (dom.walletConnectBtn) { dom.walletConnectBtn.disabled = true; }
    refreshPresaleSnapshot(true);
    return;
  }

  if (hasInjected && dom.connectBtn) {
    dom.connectBtn.disabled = false;
    dom.connectBtn.textContent = 'Connect Wallet';
    dom.connectBtn.onclick = onConnectClick;
    window.ethereum.on?.('accountsChanged', () => window.location.reload());
    window.ethereum.on?.('chainChanged', () => window.location.reload());
  } else if (dom.connectBtn) {
    dom.connectBtn.disabled = true;
    dom.connectBtn.textContent = 'No browser wallet found';
  }

  if (hasWalletConnect && dom.walletConnectBtn) {
    dom.walletConnectBtn.disabled = false;
    dom.walletConnectBtn.onclick = onWalletConnectClick;
  } else if (dom.walletConnectBtn) {
    dom.walletConnectBtn.disabled = true;
    dom.walletConnectBtn.title = 'WalletConnect is unavailable right now — try a browser wallet instead.';
  }

  dom.usdcChip?.addEventListener('click', () => selectAsset('usdc'));
  dom.amountInput?.addEventListener('input', updateQuote);

  if (hasInjected) {
    // Reconnect silently if the site is already authorized — no popup.
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts) => { if (accounts && accounts.length > 0) connectWallet(window.ethereum, 'injected'); })
      .catch(() => {});
  }

  refreshPresaleSnapshot(true);
}

async function onConnectClick() {
  if (userAddress) return;
  try {
    dom.connectBtn.disabled = true;
    dom.connectBtn.textContent = 'Connecting…';
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    await connectWallet(window.ethereum, 'injected');
  } catch (err) {
    setStatus(friendlyError(err), 'warning');
    dom.connectBtn.disabled = false;
    dom.connectBtn.textContent = 'Connect Wallet';
  }
}

async function onWalletConnectClick() {
  if (userAddress || !window.T5DWalletConnect) return;
  try {
    dom.walletConnectBtn.disabled = true;
    dom.walletConnectBtn.textContent = 'Connecting…';
    await window.T5DWalletConnect.open();
    wcUnsubscribe?.();
    wcUnsubscribe = window.T5DWalletConnect.subscribe(async (state) => {
      if (state.isConnected && state.address && !userAddress) {
        wcUnsubscribe?.();
        wcUnsubscribe = null;
        const rawProvider = window.T5DWalletConnect.getProvider();
        await connectWallet(rawProvider, 'walletconnect');
      }
    });
  } catch (err) {
    setStatus(friendlyError(err), 'warning');
    dom.walletConnectBtn.disabled = false;
    dom.walletConnectBtn.textContent = 'Connect via WalletConnect';
  }
}

async function connectWallet(rawProvider, source) {
  connectionSource = source;
  provider = new BrowserProvider(rawProvider);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();

  const network = await provider.getNetwork();
  if (Number(network.chainId) !== NETWORK.chainIdDec) {
    dom.connectBtn.disabled = false;
    dom.connectBtn.textContent = `Switch to ${NETWORK.chainName}`;
    dom.connectBtn.onclick = onSwitchNetworkClick;
    if (dom.walletConnectBtn && source === 'injected') {
      // Leave the WalletConnect button available as an alternative path.
      dom.walletConnectBtn.disabled = false;
      dom.walletConnectBtn.textContent = 'Connect via WalletConnect';
    }
    setStatus(`Connected as ${short(userAddress)} — wrong network. Switch to ${NETWORK.chainName} to continue (this preview only runs there).`, 'warning');
    return;
  }

  if (dom.walletConnectBtn) {
    dom.walletConnectBtn.disabled = true;
    dom.walletConnectBtn.textContent = source === 'walletconnect' ? 'Connected' : 'Connect via WalletConnect';
  }

  presaleWrite = new Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
  usdcWrite = new Contract(USDC_ADDRESS, ERC20_ABI, signer);

  await refreshPresaleSnapshot(false);
  await refreshAccountState();
}

async function onSwitchNetworkClick() {
  dom.connectBtn.disabled = true;
  dom.connectBtn.textContent = 'Switching…';

  if (connectionSource === 'walletconnect') {
    try {
      await window.T5DWalletConnect.switchNetwork();
      const rawProvider = window.T5DWalletConnect.getProvider();
      await connectWallet(rawProvider, 'walletconnect');
    } catch (err) {
      setStatus(friendlyError(err), 'warning');
      dom.connectBtn.disabled = false;
      dom.connectBtn.textContent = `Switch to ${NETWORK.chainName}`;
    }
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK.chainIdHex }],
    });
    // A successful switch fires 'chainChanged', which reloads the page.
  } catch (switchErr) {
    if (switchErr?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: NETWORK.chainIdHex,
            chainName: NETWORK.chainName,
            rpcUrls: NETWORK.rpcUrls,
            nativeCurrency: NETWORK.nativeCurrency,
            blockExplorerUrls: NETWORK.blockExplorerUrls,
          }],
        });
        return;
      } catch (addErr) {
        setStatus(friendlyError(addErr), 'warning');
      }
    } else {
      setStatus(friendlyError(switchErr), 'warning');
    }
    dom.connectBtn.disabled = false;
    dom.connectBtn.textContent = `Switch to ${NETWORK.chainName}`;
  }
}

function selectAsset(asset) {
  if (dom.usdcChip?.disabled) return;
  selectedAsset = asset;
  document.querySelectorAll('.asset-chip').forEach((btn) => {
    btn.classList.toggle('is-selected', btn === dom.usdcChip);
  });
  dom.amountInput.disabled = false;
  dom.amountInput.placeholder = 'Enter USDC amount';
  if (dom.unitLabel) dom.unitLabel.textContent = 'USDC';
  if (dom.quoteAvailabilityLabel) dom.quoteAvailabilityLabel.textContent = 'Live quote';
  updateQuote();
}

async function refreshPresaleSnapshot(isInitial) {
  try {
    const readProvider = provider ?? (window.ethereum ? new BrowserProvider(window.ethereum) : new JsonRpcProvider(NETWORK.rpcUrls[0]));
    const presale = new Contract(PRESALE_ADDRESS, PRESALE_ABI, readProvider);
    // softCapFailed() only exists on the newer contract (90-day goal deadline);
    // older deployments fall back to "finalized without meeting the goal".
    const softCapFailedRead = presale.softCapFailed().catch(() => null);
    const [price, softCap, perWalletCap, start, end, finalized, softCapMet, supply, sold, raised] = await Promise.all([
      presale.pricePerTokenUsdc(),
      presale.softCapUsdc(),
      presale.perWalletCapTokens(),
      presale.startTime(),
      presale.endTime(),
      presale.finalized(),
      presale.softCapMet(),
      presale.presaleSupply(),
      presale.totalTokensSold(),
      presale.totalUsdcRaised(),
    ]);
    const softCapFailed = await softCapFailedRead;
    const refundOpen = softCapFailed === null ? (finalized && !softCapMet) : Boolean(softCapFailed);
    snapshot = {
      price, softCap, perWalletCap, supply, sold, raised,
      start: Number(start), end: Number(end), finalized, softCapMet, refundOpen,
    };
    if (isInitial && !userAddress) renderPublicSnapshot();
  } catch (err) {
    console.warn('T5D presale: could not read contract state', err);
    if (isInitial) setStatus('Could not reach the Base Sepolia preview contract right now — try refreshing.', 'warning');
  }
}

function renderPublicSnapshot() {
  if (!snapshot) return;
  const now = Math.floor(Date.now() / 1000);
  let windowState;
  if (snapshot.finalized) {
    windowState = snapshot.softCapMet
      ? 'This Community Funding preview is finalized — its funding goal was met.'
      : 'This Community Funding preview is finalized — its funding goal was not met; contributors can refund.';
  } else if (now < snapshot.start) {
    windowState = 'This Community Funding preview has not opened yet.';
  } else if (now >= snapshot.end) {
    windowState = 'This Community Funding preview’s window has closed (awaiting finalize()).';
  } else {
    windowState = 'This Community Funding preview is open for contributions.';
  }
  const raisedStr = Number(formatUnits(snapshot.raised, USDC_DECIMALS)).toLocaleString();
  const softCapStr = Number(formatUnits(snapshot.softCap, USDC_DECIMALS)).toLocaleString();
  setStatus(`${windowState} Testnet total raised: $${raisedStr} of a $${softCapStr} preview goal. Connect a wallet on ${NETWORK.chainName} to contribute.`, null);
}

async function refreshAccountState() {
  if (!userAddress || !usdcWrite || !presaleWrite || !snapshot) return;
  try {
    const [usdcBalance, contribution] = await Promise.all([
      usdcWrite.balanceOf(userAddress),
      presaleWrite.contributions(userAddress),
    ]);

    const now = Math.floor(Date.now() / 1000);
    const windowOpen = !snapshot.finalized && now >= snapshot.start && now < snapshot.end;

    const balanceStr = Number(formatUnits(usdcBalance, USDC_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    let msg = `Connected as ${short(userAddress)} on ${NETWORK.chainName}. USDC balance: $${balanceStr}.`;
    if (contribution.usdcContributed > 0n) {
      const already = Number(formatUnits(contribution.tokensOwed, T5D_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 });
      msg += ` You're already in for ${already} T5D (preview-scale).`;
    }

    // Refund button: only for wallets that contributed, only once refunds are open.
    const canRefund = snapshot.refundOpen && contribution.usdcContributed > 0n && !contribution.refunded;
    if (dom.refundPanel) dom.refundPanel.hidden = !canRefund;
    if (canRefund && dom.refundBtn) {
      const refundStr = Number(formatUnits(contribution.usdcContributed, USDC_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 });
      dom.refundBtn.textContent = `Withdraw my $${refundStr} USDC`;
      dom.refundBtn.disabled = false;
      dom.refundBtn.onclick = onRefundClick;
      if (dom.refundNote) dom.refundNote.textContent = 'The funding goal wasn’t reached in time, so your full contribution is available to withdraw.';
    }

    if (dom.statusTag) dom.statusTag.textContent = windowOpen ? 'PREVIEW LIVE' : 'PREVIEW — WINDOW CLOSED';
    if (dom.networkTag) dom.networkTag.textContent = NETWORK.chainName.toUpperCase();

    if (windowOpen) {
      dom.usdcChip.disabled = false;
      if (dom.allowlistLabel) dom.allowlistLabel.textContent = 'USDC direct — live on testnet';
      dom.connectBtn.textContent = selectedAsset === 'usdc' ? 'Contribute USDC' : 'Choose USDC to continue';
      dom.connectBtn.disabled = selectedAsset !== 'usdc';
      dom.connectBtn.onclick = onContributeClick;
      if (dom.actionNote) dom.actionNote.textContent = 'Base Sepolia testnet preview — no real funds are at risk. ETH/USDT auto-swap isn’t built yet, so USDC is the only live option for now.';
      setStatus(msg, 'ok');
    } else {
      dom.connectBtn.textContent = 'Contribution window not open';
      dom.connectBtn.disabled = true;
      if (dom.actionNote) dom.actionNote.textContent = 'This preview contract’s contribution window isn’t currently open (see status above) — ask whoever’s running the preview for a fresh testnet deploy to try the live flow.';
      setStatus(msg, 'ok');
    }
  } catch (err) {
    console.warn('T5D presale: could not read account state', err);
  }
}

function updateQuote() {
  if (!dom.amountInput) return;
  const raw = dom.amountInput.value.trim();
  const amount = Number(raw);

  if (!snapshot || !raw || !isFinite(amount) || amount <= 0) {
    if (dom.quoteUsdcValue) dom.quoteUsdcValue.textContent = 'Enter an amount';
    if (dom.quoteT5dValue) dom.quoteT5dValue.textContent = '—';
    if (userAddress && dom.connectBtn) dom.connectBtn.disabled = true;
    return;
  }

  try {
    const usdcAmount = parseUnits(raw, USDC_DECIMALS);
    const tokens = (usdcAmount * (10n ** BigInt(T5D_DECIMALS))) / snapshot.price;
    if (dom.quoteUsdcValue) dom.quoteUsdcValue.textContent = `$${amount.toLocaleString()}`;
    if (dom.quoteT5dValue) dom.quoteT5dValue.textContent = `${Number(formatUnits(tokens, T5D_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 })} T5D`;
    if (dom.quoteNote) dom.quoteNote.textContent = 'Quote uses the live on-chain preview price. The exact amount is fixed when your contribution transaction confirms.';
    if (userAddress && selectedAsset === 'usdc' && dom.connectBtn) dom.connectBtn.disabled = false;
  } catch {
    if (dom.quoteT5dValue) dom.quoteT5dValue.textContent = 'Invalid amount';
    if (dom.connectBtn) dom.connectBtn.disabled = true;
  }
}

async function onContributeClick() {
  if (submitting || !presaleWrite || !usdcWrite || !snapshot) return;

  let usdcAmount;
  try {
    usdcAmount = parseUnits(dom.amountInput.value.trim(), USDC_DECIMALS);
  } catch {
    setStatus('Enter a valid USDC amount.', 'warning');
    return;
  }
  if (usdcAmount <= 0n) return;

  submitting = true;
  dom.connectBtn.disabled = true;
  try {
    const [balance, allowance, contribution] = await Promise.all([
      usdcWrite.balanceOf(userAddress),
      usdcWrite.allowance(userAddress, PRESALE_ADDRESS),
      presaleWrite.contributions(userAddress),
    ]);

    if (usdcAmount > balance) {
      setStatus('That’s more USDC than your wallet currently holds.', 'warning');
      return;
    }
    const tokensForThis = (usdcAmount * (10n ** BigInt(T5D_DECIMALS))) / snapshot.price;
    if (contribution.tokensOwed + tokensForThis > snapshot.perWalletCap) {
      setStatus('That amount would exceed this preview’s per-wallet cap.', 'warning');
      return;
    }
    if (snapshot.sold + tokensForThis > snapshot.supply) {
      setStatus('That amount would exceed the remaining preview supply.', 'warning');
      return;
    }

    if (allowance < usdcAmount) {
      dom.connectBtn.textContent = 'Approving USDC…';
      setStatus('Approval submitted — confirm it in your wallet, then wait for it to mine.', null);
      const approveTx = await usdcWrite.approve(PRESALE_ADDRESS, usdcAmount);
      await approveTx.wait();
    }

    dom.connectBtn.textContent = 'Confirming contribution…';
    setStatus('Contribution submitted — waiting for confirmation…', null);
    const tx = await presaleWrite.contribute(usdcAmount);
    await tx.wait();

    setStatus(`Success — you contributed $${dom.amountInput.value.trim()} USDC on the preview contract. Reload to see your updated allocation.`, 'ok');
    dom.connectBtn.textContent = 'Contribution complete';
    await refreshPresaleSnapshot(false);
    await refreshAccountState();
  } catch (err) {
    setStatus(friendlyError(err), 'warning');
    dom.connectBtn.textContent = 'Contribute USDC';
    dom.connectBtn.disabled = false;
  } finally {
    submitting = false;
  }
}

async function onRefundClick() {
  if (submitting || !presaleWrite) return;
  submitting = true;
  dom.refundBtn.disabled = true;
  try {
    dom.refundBtn.textContent = 'Confirm in your wallet…';
    setStatus('Withdrawal submitted — confirm it in your wallet, then wait for it to mine.', null);
    const tx = await presaleWrite.refund();
    dom.refundBtn.textContent = 'Withdrawing…';
    await tx.wait();
    setStatus('Done — your USDC has been returned to your wallet.', 'ok');
    dom.refundBtn.textContent = 'Withdrawn';
    await refreshPresaleSnapshot(false);
    await refreshAccountState();
  } catch (err) {
    setStatus(friendlyError(err), 'warning');
    dom.refundBtn.textContent = 'Withdraw my USDC';
    dom.refundBtn.disabled = false;
  } finally {
    submitting = false;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setStatus(message, tone) {
  if (!dom.walletStatus) return;
  dom.walletStatus.textContent = message;
  dom.walletStatus.classList.remove('is-ok', 'is-warning');
  if (tone === 'ok') dom.walletStatus.classList.add('is-ok');
  if (tone === 'warning') dom.walletStatus.classList.add('is-warning');
}

function short(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function friendlyError(err) {
  const raw = err?.shortMessage || err?.reason || err?.info?.error?.message || err?.message || String(err);
  if (/user rejected/i.test(raw)) return 'Request cancelled in your wallet.';
  if (/not started/i.test(raw)) return 'The contribution window has not opened yet.';
  if (/window closed/i.test(raw)) return 'The contribution window has closed.';
  if (/already finalized/i.test(raw)) return 'This Community Funding preview has already been finalized.';
  if (/soft cap met|no refund/i.test(raw)) return 'Withdrawals aren’t open — the funding goal was reached.';
  if (/nothing to refund|already refunded/i.test(raw)) return 'There’s nothing left to withdraw for this wallet.';
  if (/exceeds per-wallet cap/i.test(raw)) return 'That would exceed the per-wallet cap.';
  if (/exceeds presale supply/i.test(raw)) return 'That would exceed the remaining Community Funding supply.';
  if (/insufficient funds/i.test(raw)) return 'Insufficient ETH for gas.';
  if (/4902/.test(raw)) return `Add ${NETWORK.chainName} to your wallet and try again.`;
  return raw.length > 160 ? 'Something went wrong completing that action.' : raw;
}
