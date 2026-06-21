# Invoforge Soroban Smart Contract

This directory contains the Soroban smart contract for the Invoforge platform, providing advanced ownership management, licensing, and royalty distribution features that complement the existing Stellar asset-based system.

## Contract Overview

The `InvoforgeContract` is a Soroban smart contract written in Rust that manages:

- **Project Registration**: Register tokenized projects with metadata
- **Ownership Management**: Transfer and track project ownership
- **Licensing System**: Grant, validate, and revoke project licenses
- **Royalty Tracking**: Record and track royalty payments
- **Version Control**: Update project versions and metadata

## Contract Structure

### Data Structures

#### Project
```rust
pub struct Project {
    pub asset_code: String,           // Stellar asset code
    pub creator: Address,             // Original creator address
    pub current_owner: Address,       // Current owner address
    pub github_url: String,           // GitHub repository URL
    pub version: String,              // Current version
    pub license_type: String,         // License type (MIT, Apache, etc.)
    pub royalty_percentage: u32,      // Royalty percentage (0-100)
    pub created_at: u64,              // Creation timestamp
    pub metadata: String,            // Additional metadata
}
```

#### License
```rust
pub struct License {
    pub project_id: String,           // Associated project ID
    pub licensee: Address,           // Licensee address
    pub license_type: String,         // Type of license
    pub terms: String,               // License terms
    pub expires_at: Option<u64>,     // Optional expiration
    pub is_active: bool,             // Active status
    pub granted_at: u64,             // Grant timestamp
}
```

#### RoyaltyPayment
```rust
pub struct RoyaltyPayment {
    pub project_id: String,           // Associated project ID
    pub from_address: Address,        // Payer address
    pub amount: i128,                 // Payment amount
    pub payment_type: String,         // Type of payment
    pub timestamp: u64,              // Payment timestamp
}
```

## Contract Functions

### Initialization

#### `initialize(env, admin)`
Initializes the contract with an admin address.
- **Parameters**: `admin: Address` - Admin wallet address
- **Returns**: `Result<(), Error>`
- **Errors**: `AlreadyInitialized`

### Project Management

#### `register_project(env, asset_code, creator, github_url, license_type, royalty_percentage, metadata)`
Registers a new tokenized project.
- **Parameters**:
  - `asset_code: String` - Stellar asset code
  - `creator: Address` - Creator wallet address
  - `github_url: String` - GitHub repository URL
  - `license_type: String` - License type
  - `royalty_percentage: u32` - Royalty percentage (0-100)
  - `metadata: String` - Additional metadata
- **Returns**: `Result<String, Error>` - Project ID
- **Errors**: `InvalidInput`

#### `transfer_ownership(env, project_id, from, to)`
Transfers project ownership.
- **Parameters**:
  - `project_id: String` - Project identifier
  - `from: Address` - Current owner address
  - `to: Address` - New owner address
- **Returns**: `Result<(), Error>`
- **Errors**: `ProjectNotFound`, `NotAuthorized`

#### `update_project(env, project_id, updater, new_version, new_metadata)`
Updates project version and metadata.
- **Parameters**:
  - `project_id: String` - Project identifier
  - `updater: Address` - Authorized updater (creator or owner)
  - `new_version: Option<String>` - New version number
  - `new_metadata: Option<String>` - New metadata
- **Returns**: `Result<(), Error>`
- **Errors**: `ProjectNotFound`, `NotAuthorized`

### Licensing

#### `grant_license(env, project_id, licensor, licensee, license_type, terms, expires_at)`
Grants a license for a project.
- **Parameters**:
  - `project_id: String` - Project identifier
  - `licensor: Address` - Current owner address
  - `licensee: Address` - Licensee address
  - `license_type: String` - Type of license
  - `terms: String` - License terms
  - `expires_at: Option<u64>` - Optional expiration timestamp
- **Returns**: `Result<(), Error>`
- **Errors**: `ProjectNotFound`, `NotAuthorized`

#### `validate_license(env, project_id, licensee)`
Validates if a license is active and not expired.
- **Parameters**:
  - `project_id: String` - Project identifier
  - `licensee: Address` - Licensee address
- **Returns**: `Result<bool, Error>` - License validity
- **Errors**: `ProjectNotFound`

#### `revoke_license(env, project_id, revoker, licensee)`
Revokes an active license.
- **Parameters**:
  - `project_id: String` - Project identifier
  - `revoker: Address` - Current owner address
  - `licensee: Address` - Licensee address
- **Returns**: `Result<(), Error>`
- **Errors**: `ProjectNotFound`, `NotAuthorized`

### Royalty Management

#### `record_royalty(env, project_id, from_address, amount, payment_type)`
Records a royalty payment.
- **Parameters**:
  - `project_id: String` - Project identifier
  - `from_address: Address` - Payer address
  - `amount: i128` - Payment amount
  - `payment_type: String` - Type of payment
- **Returns**: `Result<(), Error>`
- **Errors**: `ProjectNotFound`

### Query Functions

#### `get_project(env, project_id)`
Retrieves project information.
- **Parameters**: `project_id: String` - Project identifier
- **Returns**: `Result<Project, Error>`
- **Errors**: `ProjectNotFound`

#### `get_licenses(env, project_id)`
Retrieves all licenses for a project.
- **Parameters**: `project_id: String` - Project identifier
- **Returns**: `Result<Vec<License>, Error>`
- **Errors**: `ProjectNotFound`

#### `get_royalties(env, project_id)`
Retrieves royalty payment history.
- **Parameters**: `project_id: String` - Project identifier
- **Returns**: `Result<Vec<RoyaltyPayment>, Error>`
- **Errors**: `ProjectNotFound`

## Error Codes

| Error Code | Description |
|------------|-------------|
| 1 | AlreadyInitialized |
| 2 | NotAuthorized |
| 3 | ProjectNotFound |
| 4 | InvalidInput |
| 5 | LicenseExpired |
| 6 | InsufficientBalance |
| 7 | TransferRestricted |

## Building and Deployment

### Prerequisites

- Rust 1.70+ with `wasm32-unknown-unknown` target
- Soroban CLI tools
- Stellar Testnet account with XLM for deployment

### Build Contract

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

### Deploy Contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/invoforge_contract.wasm \
  --source <your-secret-key> \
  --network testnet
```

### Initialize Contract

```bash
soroban contract invoke \
  --id <contract-id> \
  --source <your-secret-key> \
  --network testnet \
  initialize \
  --admin <your-public-key>
```

## Testing

### Run Tests

```bash
cd contracts
cargo test
```

### Test Coverage

The contract includes comprehensive test coverage for:
- Initialization
- Project registration
- Ownership transfers
- License granting and validation
- Royalty recording
- Error handling

## Integration with Frontend

The Soroban contract is designed to work alongside the existing Stellar asset system:

1. **Asset Creation**: Projects still use Stellar assets for ownership tokens
2. **Enhanced Features**: Soroban contract provides advanced licensing and royalty tracking
3. **Dual System**: Both systems can be used independently or together
4. **Frontend Integration**: Use `@stellar/stellar-sdk` to interact with the contract

### Example Integration

```typescript
import { Contract, xdr, SorobanRpc } from '@stellar/stellar-sdk';

const rpc = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const contract = new Contract(contractId);

// Register a project
const tx = await contract.call(
  'register_project',
  xdr.ScVal.scvString('MYPROJECT'),
  xdr.ScVal.scvAddress(publicKey),
  xdr.ScVal.scvString('https://github.com/user/repo'),
  xdr.ScVal.scvString('MIT'),
  xdr.ScVal.scvU32(10),
  xdr.ScVal.scvString('metadata')
);
```

## Storage Layout

The contract uses the following storage keys:

- `ADMIN`: Contract administrator address
- `PROJECTS`: Map of project_id → Project
- `LICENSES`: Map of project_id → Vec<License>
- `ROYALTIES`: Map of project_id → Vec<RoyaltyPayment>
- `COUNTER`: Project ID counter

## Security Considerations

- **Admin Privileges**: Only admin can initialize the contract
- **Authorization**: Only project owners can transfer ownership and grant licenses
- **Input Validation**: All inputs are validated before processing
- **Access Control**: Creator and current owner have update permissions
- **Time-based Validation**: Licenses can have expiration dates

## Future Enhancements

- [ ] Multi-signature support for critical operations
- [ ] Escrow system for ownership transfers
- [ ] Automated royalty distribution
- [ ] NFT integration for project certificates
- [ ] Marketplace integration
- [ ] Audit trail for all operations
- [ ] Upgradeable contract pattern

## License

MIT License - See main project LICENSE file

## Contributing

When contributing to the contract:

1. Follow Rust best practices
2. Add tests for new functions
3. Update documentation
4. Ensure gas optimization
5. Test on both testnet and local sandbox

## Support

For contract-related issues:
- Check Soroban documentation at [soroban.stellar.org](https://soroban.stellar.org)
- Review Stellar SDK documentation
- Open an issue on GitHub

---

**Built with Soroban for the Stellar Network**
