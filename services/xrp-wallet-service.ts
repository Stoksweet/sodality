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

// Network setup with testnet
const setupNetwork = async () => {
    const SERVER_URL = 'wss://s.altnet.rippletest.net:51233/';
    client = new Client(SERVER_URL);
    await client.connect();
    console.log('Connected to Testnet');
};

const createAndFundWallet = async () => {
    // Create a wallet and fund it with the Testnet faucet.
    console.log('\nCreating a new wallet and funding it with Testnet XRP...');
    const fundResult = await client.fundWallet();
    
    // Annotating with the Wallet type lets TypeScript check every field you touch.
    testWallet = fundResult.wallet;
    console.log(`Wallet: ${testWallet.address}`);
    console.log(`Balance: ${fundResult.balance}`);
    console.log('Account Testnet Explorer URL:');
    console.log(`  https://testnet.xrpl.org/accounts/${testWallet.address}`);
};

// To generate a wallet without funding it, uncomment the code below.
// const testWallet: Wallet = Wallet.generate()

// To provide your own seed, replace the testWallet value with the below.
// const testWallet: Wallet = Wallet.fromSeed('your-seed-key')

const newAccountInfoRequest = async () => {
    // Build the request as an AccountInfoRequest. TypeScript verifies the command
    // name and fields, and infers the matching AccountInfoResponse for the result.
    console.log('\nGetting account info...');
    const request: AccountInfoRequest = {
        command: 'account_info',
        account: testWallet.address,
        ledger_index: 'validated'
    };
    const response: AccountInfoResponse = await client.request(request);
    console.log(JSON.stringify(response, null, 2));
};

const newPayment = async () => {
    // Turn your own input values into a valid transaction. Typing the object as a
    // Payment makes the compiler require every field and reject the wrong ones.
    const xrpToSend = 22; // a value you might read from user input
    const payment: Payment = {
        TransactionType: 'Payment',
        Account: testWallet.address,
        // xrpToDrops converts the XRP amount into the drops string the ledger expects.
        Amount: xrpToDrops(xrpToSend),
        Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe' // example destination
    };
    
    // validate() runs the same structural checks the server does, at runtime. It
    // takes a generic transaction object, so pass the typed value through to it.
    validate(payment as unknown as Record<string, unknown>);
    console.log('\nBuilt and validated a Payment transaction:');
    console.log(JSON.stringify(payment, null, 2));
    
    // Sign and submit the transaction in one call, then show the result.
    const submitResponse = await client.submitAndWait(payment, { wallet: testWallet });
    console.log('\nSubmitted the transaction:');
    console.log(JSON.stringify(submitResponse.result, null, 2));
};


// Listen to ledger close events. The ledger argument is typed for you, so
// ledger.ledger_index and ledger.txn_count are checked at compile time.
console.log('\nListening for ledger close events...');
client.request({
    command: 'subscribe',
    streams: ['ledger']
});

client.on('ledgerClosed', (ledger: any) => {
    console.log(`Ledger #${ledger.ledger_index} validated ` +
        `with ${ledger.txn_count} transactions!`)
});

// Disconnect when done so Node.js can end the process.
// Delay this by 10 seconds to give the ledger event listener time to receive
// and display some ledger events.
setTimeout(async () => {
    await client.disconnect()
    console.log('\nDisconnected')
}, 10000);

export { setupNetwork, createAndFundWallet, newAccountInfoRequest, newPayment };