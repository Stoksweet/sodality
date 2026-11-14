// Import the library along with the TypeScript types you use below.
import {
    Client,
    Wallet,
    xrpToDrops,
    validate
} from 'xrpl';

import type {
    Payment,
    AccountInfoRequest,
    AccountInfoResponse,
} from 'xrpl';

let client: any;
let testWallet: Wallet;

const SERVER_URL = 'wss://s.altnet.rippletest.net:51233/';

// Helper to ensure client exists
const getClient = () => {
    if (!client) {
        client = new Client(SERVER_URL);
    }
    return client;
};

// Network setup with testnet
const setupNetwork = () => {
    client = getClient();
    return client.connect()
        .then(() => {
            console.log('Connected to Testnet');
        })
        .catch((error: any) => {
            console.error('Failed to connect to Testnet:', error);
            throw error;
        });
};

const createAndFundWallet = () => {
    const c = getClient();
    console.log('\nCreating a new wallet and funding it with Testnet XRP...');
    return c.fundWallet()
        .then((fundResult: any) => {
            testWallet = fundResult.wallet;
            console.log(`Wallet: ${testWallet.address}`);
            console.log(`Balance: ${fundResult.balance}`);
            console.log('Account Testnet Explorer URL:');
            console.log(`  https://testnet.xrpl.org/accounts/${testWallet.address}`);
        })
        .catch((error: any) => {
            console.error('Failed to create and fund wallet:', error);
            throw error;
        });
};

const createWallet = () => {
    const generatedWallet: Wallet = Wallet.generate();
    console.log('Generated wallet: ', generatedWallet);
    return Promise.resolve(generatedWallet);
};

const fundWallet = (wallet: Wallet, XRPAmount: number, seed: string) => {
    const c = getClient();
    const existingWallet = Wallet.fromSeed(seed);
    return c.fundWallet(
        existingWallet,
        { amount: '25' }
    )
        .then((fundResult: any) => {
            const updatedBalance = fundResult.balance;
            console.log('Updated Balance:', updatedBalance);
        })
        .catch((error: any) => {
            console.error('Failed to fund wallet:', error);
            throw error;
        });
};

const newAccountInfoRequest = () => {
    const c = getClient();
    if (!testWallet) {
        throw new Error('testWallet is not defined. Create or set a wallet before requesting account info.');
    }
    console.log('\nGetting account info...');
    const request: AccountInfoRequest = {
        command: 'account_info',
        account: testWallet.address,
        ledger_index: 'validated'
    };
    return c.request(request)
        .then((response: AccountInfoResponse) => {
            console.log(JSON.stringify(response, null, 2));
        })
        .catch((error: any) => {
            console.error('Failed to get account info:', error);
            throw error;
        });
};

const newPayment = (XRPAmount: number, Destination: string, wallet: Wallet) => {
    const c = getClient();
    
    const payment: Payment = {
        TransactionType: 'Payment',
        Account: wallet.address,
        Amount: xrpToDrops(XRPAmount),
        Destination
    };
    
    validate(payment as unknown as Record<string, unknown>);
    console.log('\nBuilt and validated a Payment transaction: ', payment);
    console.log(JSON.stringify(payment, null, 2));
    
    return c.submitSigned(payment, { wallet: wallet })
        .then((submitResponse: any) => {
            console.log('\nSubmitted the transaction:');
            console.log(JSON.stringify(submitResponse.result, null, 2));
        })
        .catch((error: any) => {
            console.error('Failed to submit payment transaction:', error);
            throw error;
        });
};

    // Ensure setupNetwork is called before subscribing or running requests
    setupNetwork().then(() => {
        console.log('\nListening for ledger close events...');
        return client.request({
            command: 'subscribe',
            streams: ['ledger']
        });
    }).catch((error: any) => {
        console.error('Failed to subscribe to ledger stream:', error);
    });

// client?.on('ledgerClosed', (ledger: any) => {
//     console.log(`Ledger #${ledger.ledger_index} validated ` +
//         `with ${ledger.txn_count} transactions!`);
// });

// setTimeout(() => {
//     if (client) {
//         client.disconnect()
//             .then(() => {
//                 console.log('\nDisconnected');
//             })
//             .catch((error: any) => {
//                 console.error('Error disconnecting client:', error);
//             });
//     }
// }, 10000);

export { setupNetwork, createAndFundWallet, newAccountInfoRequest, newPayment, createWallet, fundWallet };