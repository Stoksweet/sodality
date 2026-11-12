Sodality

An AI-Native Small Business Stock Market on the XRP Ledger (XRPL)

Sodality is a decentralized equity and micro-investment platform designed to empower small businesses to tokenize equity, raise capital, and connect directly with community investors on the XRP Ledger. By combining XRPL's fast, low-cost settlement layer with AI-native business valuation, automated reporting, and market-making tools, Sodality lowers the barrier to entry for small business public offerings.

🌟 Vision & Use Case

Traditional equity markets are prohibitively expensive and complex for small and local businesses. Sodality reimagines small business capital formation through:

Tokenized Small Business Equity: Businesses issue compliant, fractionalized equity tokens directly on the XRPL.

AI-Native Underwriting & Insights: Automated AI agents analyze business cash flows, operational metrics, and market sentiment to provide transparent, real-time valuations and investor briefings.

Instant Settlement & Micro-Liquidity: Leveraging XRPL's native decentralized exchange (DEX) and low transaction fees to allow everyday investors to buy, sell, and earn dividends seamlessly.

🔌 Ghostsig Wallet Integration (services/ghostsig-wallet-connect.ts)

Sodality uses xrpl-connect alongside xrpl to manage user authentication and transaction signing via the Ghostsig wallet adapter. Currently, the integration targets the XRPL Testnet.

Key Features Implemented

Network & Adapter Setup (setupNetwork)

Initializes a WalletManager configured with the GhostsigAdapter targeting the testnet network.

Connects to the user's Ghostsig wallet (walletManager.connect('ghostsig')) and retrieves the active XRPL account address.

Transaction Signing & Submission (signTransaction)

Converts human-readable XRP amounts into drops using xrpToDrops.

Supports standalone transaction signing (walletManager.sign) to inspect or store the raw tx_blob.

Supports end-to-end signing and ledger submission (walletManager.signAndSubmit) for Payment transactions, returning the transaction hash and submission status.

UI State Binding (connectUI)

Binds wallet connection states, active account addresses, network status, and disconnect triggers directly to DOM elements (#wallet-connector, #account-info, #address, #network, #wallet, and #disconnect-btn).

🛠️ Project Structure

SODALITY/
├── services/
│   └── ghostsig-wallet-connect.ts   # Ghostsig wallet connection, UI binding, & tx signing
├── app.ts                           # Application entry point
├── index.html                       # Frontend UI markup
├── package.json                     # Project dependencies (xrpl, xrpl-connect)
└── tsconfig.json                    # TypeScript configuration


🚀 Getting Started

Prerequisites

Node.js (v18+ recommended)

Ghostsig Wallet browser extension or compatible client set to XRPL Testnet

Installation & Local Development

Install dependencies:

npm install


Run the local development server (using Vite):

npx vite


Open in Browser:
Navigate to the local URL provided in your terminal (typically http://localhost:5173) to connect your Ghostsig wallet and test transactions on the XRPL Testnet.