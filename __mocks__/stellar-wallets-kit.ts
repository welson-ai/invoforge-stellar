export enum WalletNetwork {
  TESTNET = 'testnet',
  PUBLIC = 'public'
}

export const FREIGHTER_ID = 'freighter';

export function allowAllModules() {
  return [];
}

export class StellarWalletsKit {
  constructor() {}
  
  async openModal() {
    return Promise.resolve()
  }
  
  async getAddress() {
    return Promise.resolve({
      address: 'GBQHD24ONBXMQV2WQ7YYEJGNW5R736LDXK3ULAPDR5QTA3XKFICBU33Z'
    })
  }
  
  async disconnect() {
    return Promise.resolve()
  }
  
  setWallet(id: string) {}
  
  async signTransaction(xdr: string, options: any) {
    return Promise.resolve({
      signedTxXdr: xdr
    })
  }
}
