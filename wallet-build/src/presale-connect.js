// presale-connect.js — WalletConnect / mobile-wallet support for the T5D
// presale, via Reown AppKit (the current WalletConnect SDK). Compiled by
// Vite into presale-connect.bundle.js (a single IIFE) and loaded by
// t5d-presale.html as a plain <script> tag, alongside the existing
// injected-wallet flow in presale-wallet.js.
//
// This module does NOT touch the contract (approve/contribute) at all —
// that logic already exists and is tested in presale-wallet.js. All this
// does is get a connected EIP-1193 provider from a wallet (desktop
// extension OR mobile app via QR) and hand it to presale-wallet.js through
// a small, explicit bridge: window.T5DWalletConnect.
//
// API confirmed 2026-10-01 directly against the installed packages in
// wallet-build/node_modules (@reown/appkit@1.8.24,
// @reown/appkit-adapter-ethers@1.8.24) — not guessed from docs or training
// data. See wallet-build/README.md for how that was verified.

import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { baseSepolia, base } from '@reown/appkit/networks';

// --- Config -----------------------------------------------------------
// Testnet rehearsal for now, matching presale-wallet.js's current target.
// Flip to `base` (mainnet) at the same time presale-wallet.js's own
// NETWORK/PRESALE_ADDRESS/USDC_ADDRESS constants get re-pointed at mainnet.
const ACTIVE_NETWORK = baseSepolia;

const PROJECT_ID = '9e48128b0e2ce86b827effbce4c92b55';

const METADATA = {
  name: 'T5D Community Funding',
  description: 'T5D Community Funding — connect a wallet to contribute.',
  url: 'https://tec5uportdimension.com',
  icons: ['https://tec5uportdimension.com/assets/t5d-brand/t5d-shield-transparent-speck-clean.png'],
};

// --- AppKit instance ----------------------------------------------------
const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [ACTIVE_NETWORK],
  defaultNetwork: ACTIVE_NETWORK,
  projectId: PROJECT_ID,
  metadata: METADATA,
  // Keep the modal to wallet connections only — no email/social login,
  // this is a presale contribution flow, not a consumer app login.
  features: {
    email: false,
    socials: false,
  },
});

// --- Bridge exposed to presale-wallet.js --------------------------------
// presale-wallet.js never imports this module directly (it's a plain
// <script type="module">, this is a separately-built bundle) — instead it
// reads window.T5DWalletConnect at runtime, so neither file has to know
// the other's internal structure. If this bundle hasn't loaded for any
// reason, window.T5DWalletConnect is simply undefined and
// presale-wallet.js's existing injected-wallet-only flow keeps working
// exactly as it does today.
const listeners = new Set();

function notify(state) {
  for (const cb of listeners) {
    try {
      cb(state);
    } catch (err) {
      console.error('[T5DWalletConnect] subscriber error', err);
    }
  }
}

appKit.subscribeAccount((state) => {
  notify({
    isConnected: Boolean(state.isConnected),
    address: state.address,
  });
});

window.T5DWalletConnect = {
  /** Opens the Reown connect modal (QR for mobile wallets + a wallet list). */
  open() {
    return appKit.open();
  },

  /** Closes the modal, if open. */
  close() {
    return appKit.close();
  },

  /** Disconnects the current WalletConnect session. */
  disconnect() {
    return appKit.disconnect();
  },

  /**
   * Asks the connected wallet to switch to ACTIVE_NETWORK. AppKit handles
   * this over the WalletConnect session itself (no wallet_switchEthereumChain
   * needed, since that's an injected-provider-only RPC method).
   */
  switchNetwork() {
    return appKit.switchNetwork(ACTIVE_NETWORK);
  },

  /** Current connection snapshot: { isConnected, address }. */
  getAccount() {
    const acct = appKit.getAccount() || {};
    return {
      isConnected: Boolean(acct.isConnected),
      address: acct.address,
    };
  },

  /**
   * Returns the raw EIP-1193 provider for the connected wallet (desktop
   * extension or mobile app, whichever the visitor picked in the modal),
   * or undefined if nothing is connected yet. presale-wallet.js wraps this
   * in an ethers BrowserProvider exactly like it already does for
   * window.ethereum — same downstream code path, different provider
   * source.
   */
  getProvider() {
    return appKit.getProvider('eip155');
  },

  /** Subscribe to connection changes. Returns an unsubscribe function. */
  subscribe(callback) {
    listeners.add(callback);
    // Fire immediately with current state so callers don't have to also
    // call getAccount() separately just to get the initial snapshot.
    callback(this.getAccount());
    return () => listeners.delete(callback);
  },
};
