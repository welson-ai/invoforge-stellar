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
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Simulate transaction
    console.log(`🔄 Simulating transaction...`);
    const simulated = await server.simulateTransaction(transaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation error: ${simulated.error}`);
    }

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

    // Poll for transaction completion
    console.log(`⏳ Waiting for transaction confirmation...`);
    let status = 'PENDING';
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txResult = await server.getTransaction(txHash);
      
      if (txResult.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        status = 'SUCCESS';
        console.log(`✅ Transaction confirmed!`);
        break;
      } else if (txResult.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.FAILED) {
        status = 'FAILED';
        console.log(`❌ Transaction failed`);
        break;
      }
      
      attempts++;
      console.log(`⏳ Polling... (${attempts}/${maxAttempts})`);
    }

    if (status === 'PENDING') {
      console.log(`⚠️ Transaction still pending after ${maxAttempts} attempts`);
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

async function testRegisterProject(publicKey: string) {
  console.log('\n🎯 Testing register_project...');
  
  const params = [
    StellarSdk.xdr.ScVal.scvString('TESTCLI'),
    new StellarSdk.Address(publicKey).toScVal(),
    StellarSdk.xdr.ScVal.scvString('https://github.com/test/cli-test'),
    StellarSdk.xdr.ScVal.scvString('MIT'),
    StellarSdk.xdr.ScVal.scvU32(5),
    StellarSdk.xdr.ScVal.scvString('CLI test project'),
  ];

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
    console.log('� Loading keypair from PRIVATE_KEY environment variable...');
    const keypair = getKeypair();
    const publicKey = keypair.publicKey();
    console.log(`✅ Public key: ${publicKey}\n`);

    // Test register_project
    console.log('🎯 Testing register_project...');
    const result1 = await testRegisterProject(publicKey);
    console.log(`\n📊 Result:`);
    console.log(`   Hash: ${result1.txHash}`);
    console.log(`   Status: ${result1.status}`);
    console.log(`   Explorer: ${result1.explorerUrl}`);

    // Test update_project
    await new Promise(resolve => setTimeout(resolve, 3000));
    const result2 = await testUpdateProject(publicKey);
    console.log(`\n📊 Result:`);
    console.log(`   Hash: ${result2.txHash}`);
    console.log(`   Status: ${result2.status}`);
    console.log(`   Explorer: ${result2.explorerUrl}`);

    console.log('\n✅ All tests completed successfully!');
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
