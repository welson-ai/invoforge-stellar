import * as StellarSdk from '@stellar/stellar-sdk';
import freighter from '@stellar/freighter-api';

const CONTRACT_ID = 'CDNONWHGE3D4UI77E6SXDNHYNIA6R4BHNP67X3FIWVTBSIM4HYX25K5G';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// Initialize Soroban RPC server
const server = new StellarSdk.SorobanRpc.Server(RPC_URL, {
  allowHttp: true,
});

// Types
interface TransactionResult {
  txHash: string;
  explorerUrl: string;
  status: string;
}

interface Project {
  project_id: number;
  asset_code: string;
  creator: string;
  github_url: string;
  license_type: string;
  royalty_percentage: number;
  metadata: string;
  version: string;
}

interface License {
  project_id: number;
  licensor: string;
  licensee: string;
  license_type: string;
  terms: string;
  expires_at: number;
}

interface RoyaltyPayment {
  project_id: number;
  from_address: string;
  amount: bigint;
  payment_type: string;
  timestamp: number;
}

// Connect wallet using Freighter
export async function connectWallet(): Promise<string> {
  try {
    const { address } = await freighter.getAddress();
    if (!address) {
      throw new Error('Failed to get wallet address from Freighter');
    }
    return address;
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw new Error('Failed to connect wallet: ' + (error as Error).message);
  }
}

// Helper function to build and submit transaction
async function submitTransaction(
  publicKey: string,
  contractMethod: string,
  params: any[]
): Promise<TransactionResult> {
  try {
    // Get account
    const account = await server.getAccount(publicKey);
    
    // Build transaction
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: '10000000', // 0.01 XLM fee
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(contractMethod, ...params))
      .setTimeout(30)
      .build();

    // Simulate transaction
    const simulated = await server.simulateTransaction(transaction);
    const prepareTransaction = await server.prepareTransaction(transaction);

    // Sign with Freighter
    const signResult = await freighter.signTransaction(prepareTransaction.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (signResult.error) {
      throw new Error('Failed to sign transaction: ' + signResult.error);
    }

    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE) as StellarSdk.Transaction;

    // Submit transaction
    const result = await server.sendTransaction(signedTransaction);
    
    // Poll for transaction status
    let txStatus = await server.getTransaction(result.hash);
    let attempts = 0;
    const maxAttempts = 30;
    
    while (txStatus.status === 'NOT_FOUND' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      txStatus = await server.getTransaction(result.hash);
      attempts++;
    }

    const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result.hash}`;
    
    return {
      txHash: result.hash,
      explorerUrl,
      status: txStatus.status,
    };
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Transaction failed: ' + (error as Error).message);
  }
}

// Contract functions

export async function initializeContract(admin: string): Promise<TransactionResult> {
  return submitTransaction(admin, 'initialize', [new StellarSdk.Address(admin).toScVal()]);
}

export async function registerProject(
  publicKey: string,
  assetCode: string,
  creator: string,
  githubUrl: string,
  licenseType: string,
  royaltyPercentage: number,
  metadata: string
): Promise<TransactionResult> {
  return submitTransaction(publicKey, 'register_project', [
    StellarSdk.xdr.ScVal.scvString(assetCode),
    new StellarSdk.Address(creator).toScVal(),
    StellarSdk.xdr.ScVal.scvString(githubUrl),
    StellarSdk.xdr.ScVal.scvString(licenseType),
    StellarSdk.xdr.ScVal.scvU32(royaltyPercentage),
    StellarSdk.xdr.ScVal.scvString(metadata),
  ]);
}

export async function transferOwnership(
  publicKey: string,
  projectId: number,
  from: string,
  to: string
): Promise<TransactionResult> {
  return submitTransaction(publicKey, 'transfer_ownership', [
    StellarSdk.xdr.ScVal.scvU32(projectId),
    new StellarSdk.Address(from).toScVal(),
    new StellarSdk.Address(to).toScVal(),
  ]);
}

export async function updateProject(
  publicKey: string,
  projectId: number,
  updater: string,
  newVersion?: string,
  newMetadata?: string
): Promise<TransactionResult> {
  const params = [
    StellarSdk.xdr.ScVal.scvU32(projectId),
    new StellarSdk.Address(updater).toScVal(),
    newVersion ? StellarSdk.xdr.ScVal.scvString(newVersion) : StellarSdk.xdr.ScVal.scvVoid(),
    newMetadata ? StellarSdk.xdr.ScVal.scvString(newMetadata) : StellarSdk.xdr.ScVal.scvVoid(),
  ];
  return submitTransaction(publicKey, 'update_project', params);
}

export async function grantLicense(
  publicKey: string,
  projectId: number,
  licensor: string,
  licensee: string,
  licenseType: string,
  terms: string,
  expiresAt: number
): Promise<TransactionResult> {
  // TODO: Fix type conversion for scvU64
  return submitTransaction(publicKey, 'grant_license', [
    StellarSdk.xdr.ScVal.scvU32(projectId),
    new StellarSdk.Address(licensor).toScVal(),
    new StellarSdk.Address(licensee).toScVal(),
    StellarSdk.xdr.ScVal.scvString(licenseType),
    StellarSdk.xdr.ScVal.scvString(terms),
    StellarSdk.xdr.ScVal.scvU32(expiresAt), // Temporary fix
  ]);
}

export async function recordRoyalty(
  publicKey: string,
  projectId: number,
  fromAddress: string,
  amount: bigint,
  paymentType: string
): Promise<TransactionResult> {
  // TODO: Fix type conversion for scvI128
  return submitTransaction(publicKey, 'record_royalty', [
    StellarSdk.xdr.ScVal.scvU32(projectId),
    new StellarSdk.Address(fromAddress).toScVal(),
    StellarSdk.xdr.ScVal.scvU32(Number(amount)), // Temporary fix
    StellarSdk.xdr.ScVal.scvString(paymentType),
  ]);
}

// Read functions - TODO: Implement with proper Stellar SDK types
export async function getProject(projectId: number): Promise<Project> {
  // TODO: Implement with proper contract data reading
  throw new Error('getProject not yet implemented');
}

export async function getLicenses(projectId: number): Promise<License[]> {
  // TODO: Implement with proper contract data reading
  throw new Error('getLicenses not yet implemented');
}

export async function getRoyalties(projectId: number): Promise<RoyaltyPayment[]> {
  // TODO: Implement with proper contract data reading
  throw new Error('getRoyalties not yet implemented');
}

export async function validateLicense(projectId: number, licensee: string): Promise<boolean> {
  // TODO: Implement with proper contract data reading
  throw new Error('validateLicense not yet implemented');
}

export async function getTransactionCount(): Promise<number> {
  // TODO: Implement with proper contract data reading
  throw new Error('getTransactionCount not yet implemented');
}
