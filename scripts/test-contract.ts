#!/usr/bin/env npx ts-node

/**
 * CLI script to test Soroban contract directly from terminal
 * Usage: PRIVATE_KEY=your_secret_key npx ts-node scripts/test-contract.ts
 */

import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = 'CDNONWHGE3D4UI77E6SXDNHYNIA6R4BHNP67X3FIWVTBSIM4HYX25K5G';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

const server = new StellarSdk.SorobanRpc.Server(RPC_URL, { allowHttp: true });

function getKeypair(): StellarSdk.Keypair {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }
  return StellarSdk.Keypair.fromSecret(privateKey);
}

async function submitTransaction(
  publicKey: string,
  contractMethod: string,
  params: StellarSdk.xdr.ScVal[]
): Promise<{ txHash: string; explorerUrl: string; status: string }> {
  try {
    console.log(`\n📝 Building transaction for ${contractMethod}...`);
    
    // Get account
    const account = await server.getAccount(publicKey);
    console.log(`✅ Account loaded: ${account.accountId()}`);

    // Build transaction
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const operation = contract.call(contractMethod, ...params);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: '10000000', // Higher fee for Soroban
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Simulate transaction
    console.log(`🔄 Simulating transaction...`);
    const simulated = await server.simulateTransaction(transaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      console.log(`❌ Simulation error: ${simulated.error}`);
      if (simulated.events) {
        console.log(`Events: ${JSON.stringify(simulated.events)}`);
      }
      throw new Error(`Simulation error: ${simulated.error}`);
    }

    console.log(`✅ Simulation successful`);

    // Prepare transaction
    console.log(`🔧 Preparing transaction...`);
    const preparedTx = await server.prepareTransaction(transaction);

    // Sign transaction with private key
    console.log(`🔐 Signing transaction with private key...`);
    const keypair = getKeypair();
    preparedTx.sign(keypair);

    const signedTx = preparedTx;

    // Submit transaction
    console.log(`🚀 Submitting transaction...`);
    const sendResult = await server.sendTransaction(signedTx);
    
    if (sendResult.errorResult) {
      throw new Error(`Transaction submission failed: ${sendResult.errorResult}`);
    }

    const txHash = sendResult.hash;
    console.log(`✅ Transaction submitted: ${txHash}`);
    console.log(`🔍 Explorer: https://stellar.expert/explorer/testnet/tx/${txHash}`);

    // Wait a bit then check transaction status
    console.log(`⏳ Waiting 20 seconds before checking status...`);
    await new Promise(resolve => setTimeout(resolve, 20000));

    console.log(`🔍 Checking transaction status via RPC...`);
    try {
      // Use getLatestLedger to check if transaction was included
      const latestLedger = await server.getLatestLedger();
      console.log(`Latest ledger: ${latestLedger.sequence}`);
      
      // Try to get transaction with different method
      const txResult = await server.getTransaction(txHash);
      console.log(`Transaction status: ${txResult.status}`);
      
      if (txResult.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        console.log(`✅ Transaction confirmed successfully!`);
        return {
          txHash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
          status: 'SUCCESS',
        };
      } else if (txResult.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.FAILED) {
        console.log(`❌ Transaction failed`);
        if (txResult.resultXdr) {
          console.log(`Result XDR: ${txResult.resultXdr}`);
        }
        return {
          txHash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
          status: 'FAILED',
        };
      } else {
        console.log(`Transaction status: ${txResult.status}`);
        return {
          txHash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
          status: txResult.status,
        };
      }
    } catch (error) {
      console.log(`Error getting transaction: ${(error as Error).message}`);
      console.log(`Transaction may still be processing or failed`);
      console.log(`Please check manually on Stellar Expert`);
      console.log(`Also check your account: https://stellar.expert/explorer/testnet/account/${publicKey}`);
      // Return the hash anyway so user can check manually
      return {
        txHash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
        status: 'UNKNOWN',
      };
    }

    return {
      txHash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
      status,
    };
  } catch (error) {
    throw new Error(`Transaction failed: ${(error as Error).message}`);
  }
}

async function testInitialize(publicKey: string) {
  console.log('\n🎯 Testing initialize...');
  
  const params = [
    new StellarSdk.Address(publicKey).toScVal(),
  ];

  return submitTransaction(publicKey, 'initialize', params);
}

async function testRegisterProject(publicKey: string) {
  console.log('\n🎯 Testing register_project...');
  
  // Try with different Address encoding
  const address = new StellarSdk.Address(publicKey);
  const params = [
    StellarSdk.xdr.ScVal.scvString('TEST'),
    address.toScVal(),
    StellarSdk.xdr.ScVal.scvString('https://github.com/test'),
    StellarSdk.xdr.ScVal.scvString('MIT'),
    StellarSdk.xdr.ScVal.scvU32(5),
    StellarSdk.xdr.ScVal.scvString('Test'),
  ];

  console.log('Parameters:', params.map((p, i) => `${i}: ${p.toString()}`));
  console.log('Address:', address.toString());
  console.log('Address ScVal:', address.toScVal().toString());
  
  return submitTransaction(publicKey, 'register_project', params);
}

async function testUpdateProject(publicKey: string) {
  console.log('\n🎯 Testing update_project...');
  
  const params = [
    StellarSdk.xdr.ScVal.scvU32(1),
    new StellarSdk.Address(publicKey).toScVal(),
    StellarSdk.xdr.ScVal.scvString('v2.0.0'),
    StellarSdk.xdr.ScVal.scvString('Updated via CLI'),
  ];

  return submitTransaction(publicKey, 'update_project', params);
}

async function main() {
  console.log('🚀 Soroban Contract CLI Test');
  console.log('============================\n');
  console.log(`Contract ID: ${CONTRACT_ID}`);
  console.log(`RPC URL: ${RPC_URL}`);
  console.log(`Network: ${NETWORK_PASSPHRASE}\n`);

  try {
    // Get keypair from private key
    console.log('🔑 Loading keypair from PRIVATE_KEY environment variable...');
    const keypair = getKeypair();
    const publicKey = keypair.publicKey();
    console.log(`✅ Public key: ${publicKey}\n`);

    // Try a simple read operation first
    console.log('🎯 Testing get_transaction_count (read operation)...');
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(publicKey);
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_transaction_count'))
        .setTimeout(30)
        .build();

      const simulated = await server.simulateTransaction(transaction);
      console.log('✅ Read operation successful');
      if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulated) && simulated.result) {
        console.log(`   Transaction count: ${simulated.result.retval.value || 0}`);
      }
      console.log('   Contract is already initialized, skipping initialize step');
    } catch (error) {
      console.log(`❌ Read operation failed: ${(error as Error).message}`);
    }

    // Test register_project
    console.log('🎯 Testing register_project...');
    const result1 = await testRegisterProject(publicKey);
    console.log(`\n📊 Result:`);
    console.log(`   Hash: ${result1.txHash}`);
    console.log(`   Status: ${result1.status}`);
    console.log(`   Explorer: ${result1.explorerUrl}`);
    console.log(`   Account: https://stellar.expert/explorer/testnet/account/${publicKey}`);

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error(`\n❌ Error: ${(error as Error).message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Set PRIVATE_KEY environment variable with your Stellar secret key');
    console.log('   2. Make sure the account has testnet XLM: https://friendbot.stellar.org/');
    console.log('   3. Run: PRIVATE_KEY=your_secret_key npx ts-node scripts/test-contract.ts');
    process.exit(1);
  }
}

main();
