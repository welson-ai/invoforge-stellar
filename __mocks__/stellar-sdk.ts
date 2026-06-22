export class Horizon {
  static Server = class {
    constructor(url: string) {}
    
    async loadAccount(accountId: string) {
      return {
        balances: [
          {
            asset_type: 'native',
            balance: '100.0000000'
          }
        ]
      }
    }
    
    transactions() {
      return {
        forAccount: () => ({
          limit: () => ({
            order: () => ({
              call: () => Promise.resolve({
                records: []
              })
            })
          })
        })
      }
    }
  }
}

export class Networks {
  static TESTNET = 'Test SDF Network ; September 2015'
  static PUBLIC = 'Public Global Stellar Network ; September 2015'
}

export class TransactionBuilder {
  static fromXDR: any
}
