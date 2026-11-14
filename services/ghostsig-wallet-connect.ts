import { xrpToDrops, Client, Wallet } from "xrpl";
import { GhostsigAdapter, WalletManager } from "xrpl-connect";

let walletManager: WalletManager;
let currentAccount: any;

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
    console.log('Ghostsig Account: ', account);
    currentAccount = account;
    console.log('Current Account: ', currentAccount);
};

// Sign & Submit transaction
const signTransaction = async (Account: string, Amount: number, toAddress: string) => {
    const signed = await walletManager.sign({
        TransactionType: 'Payment',
        Destination: toAddress,
        Amount: xrpToDrops(Amount),
        Account: currentAccount.address
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

let balanceEl: any = document.getElementById('balance');
const connectUI = () => {
    // Get DOM elements
    const connector: any = document.getElementById('wallet-connector');
    const accountInfo: any = document.getElementById('account-info');
    const addressEl: any = document.getElementById('address');
    const networkEl: any = document.getElementById('network');
    const walletEl: any = document.getElementById('wallet');
    const disconnectBtn = document.getElementById('disconnect-btn');

    const getbalance = async (account: any) => {
        const address = account.address;

        console.log('Connecting client using address: ', address);
        const client = new Client('wss://s.altnet.rippletest.net:51233/');
        await client.connect();
        
        console.log('Getting Account balance...');
        const xrpBalance = await client.getXrpBalance(address);
        const allBalances = await client.getBalances(address); // Includes trust line tokens
        balanceEl.textContent = xrpBalance;
        
        console.log('XRP Balance:', xrpBalance);
        console.log('All Balances: ', allBalances);
        await client.disconnect();
    };

    // Connect component to wallet manager
    connector.setWalletManager(walletManager);

    // Handle connection
    walletManager.on('connect', (account) => {
        console.log('Connected:', account.address);
        addressEl.textContent = account.address;
        networkEl.textContent = account.network.name;
        walletEl.textContent = walletManager.wallet?.name;
        accountInfo.style.display = 'block';
        getbalance(account);
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