import { xrpToDrops } from "xrpl";
import { GhostsigAdapter, WalletManager } from "xrpl-connect";

let walletManager: WalletManager;

// Network Setup - testnet only for now
const setupNetwork = async () => {
    // Basic Network Setup
    walletManager = new WalletManager({
        adapters: [new GhostsigAdapter()],
        network: 'testnet',
    });
    console.log("Setting up test network...");
    
    const account = await walletManager.connect('ghostsig');
    console.log('Ghostsig Connected:', account.address);
};

// Sign & Submit transaction
const signTransaction = async (Account: string, Amount: number, toAddress: string) => {
    const signed = await walletManager.sign({
        TransactionType: 'Payment',
        Destination: toAddress,
        Amount: xrpToDrops(Amount),
        Account
    });
    console.log("Signed Transaction blob: ", signed.tx_blob);
    
    const submitted = await walletManager.signAndSubmit({
        TransactionType: 'Payment',
        Destination: toAddress,
        Amount: xrpToDrops(Amount),
        Account
    });
    console.log('Signed Tx Submitted: ', submitted.hash, submitted.submitted);
};

const connectUI = () => {
    // Get DOM elements
    const connector: any = document.getElementById('wallet-connector');
    const accountInfo: any = document.getElementById('account-info');
    const addressEl: any = document.getElementById('address');
    const networkEl: any = document.getElementById('network');
    const walletEl: any = document.getElementById('wallet');
    const disconnectBtn = document.getElementById('disconnect-btn');

    // Connect component to wallet manager
    connector.setWalletManager(walletManager);

    // Handle connection
    walletManager.on('connect', (account) => {
        console.log('Connected:', account.address);
        addressEl.textContent = account.address;
        networkEl.textContent = account.network.name;
        walletEl.textContent = walletManager.wallet?.name;
        accountInfo.style.display = 'block';
    });

    // Handle disconnection
    walletManager.on('disconnect', () => {
        console.log('Disconnected');
        accountInfo.style.display = 'none';
    });

    // Disconnect button
    disconnectBtn?.addEventListener('click', async () => {
        try {
            await walletManager.disconnect();
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    });
};

export { setupNetwork, signTransaction, connectUI };