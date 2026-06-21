# Invoforge - Tokenized Code Ownership Platform

A modern, vibrant platform for tokenized code ownership on the Stellar blockchain. Invoforge enables developers to tokenize their projects as Stellar assets, manage ownership transfers, and track transaction history with a beautiful, bright UI.

## Features

- **Wallet Connection**: Connect with multiple Stellar-compatible wallets (Freighter, xBull, Albedo, Rabet, Lobstr, Hana, WalletConnect)
- **Project Tokenization**: Create unique owner tokens for your projects with custom asset codes
- **Balance Display**: View XLM balance and other assets with real-time updates
- **Payment System**: Send XLM payments with memo support
- **Transaction History**: Track all ownership transfers and payments with links to Stellar Expert
- **Project Management**: Update project metadata and version information
- **Bright Modern UI**: Vibrant color palette with glassmorphism effects and smooth animations

## Design System

### Color Palette

Invoforge uses a bright, vibrant color palette designed for excellent readability and visual appeal:

- **Primary (Orange)**: `#f97316` - Main actions and CTAs
- **Secondary (Blue)**: `#0ea5e9` - Secondary actions and information
- **Accent (Purple)**: `#d946ef` - Special highlights and accents
- **Success (Green)**: `#22c55e` - Success states and confirmations
- **Warning (Yellow)**: `#f59e0b` - Warnings and important notices
- **Danger (Red)**: `#ef4444` - Error states and destructive actions

### UI Components

- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Gradient Backgrounds**: Smooth color transitions for visual depth
- **Custom Scrollbars**: Styled scrollbars matching the color scheme
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animations**: Smooth transitions and hover effects

## Project Structure

```
invoforge/
├── app/
│   ├── globals.css          # Global styles and custom CSS
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main application page with tabs
├── components/
│   ├── BalanceDisplay.tsx   # XLM and asset balance display
│   ├── BonusFeatures.tsx    # Placeholder components for features
│   ├── PaymentForm.tsx      # XLM payment form with validation
│   ├── TransactionHistory.tsx # Transaction list with explorer links
│   ├── WalletConnection.tsx # Wallet connection/disconnection
│   └── example-components.tsx # Reusable UI components
├── lib/
│   └── stellar-helper.ts    # Stellar SDK integration and wallet logic
├── public/                  # Static assets
├── .github/                 # GitHub workflows
├── package.json             # Project dependencies
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
└── postcss.config.js        # PostCSS configuration
```

## Architecture

### Technology Stack

- **Framework**: Next.js 14.2.0 (React 18.3.1)
- **Language**: TypeScript 5.4.5
- **Styling**: Tailwind CSS 3.4.4
- **Blockchain**: Stellar SDK 12.3.0
- **Wallet Integration**: @creit.tech/stellar-wallets-kit 1.9.5
- **Icons**: react-icons 5.0.1

### Component Architecture

The application follows a component-based architecture with clear separation of concerns:

#### Main Components

1. **WalletConnection**: Handles wallet connection/disconnection
   - Supports multiple wallet providers
   - Manages connection state
   - Provides address copying functionality

2. **BalanceDisplay**: Shows user's XLM and asset balances
   - Real-time balance fetching
   - Refresh functionality
   - USD estimation placeholder

3. **PaymentForm**: Enables XLM transfers
   - Form validation
   - Recipient address verification
   - Transaction confirmation display

4. **TransactionHistory**: Lists recent transactions
   - Pagination support
   - Explorer links
   - Transaction type indicators

5. **ProjectCreator**: Creates tokenized project assets
   - Asset code validation
   - GitHub URL integration
   - Success state management

6. **ProjectManager**: Updates project metadata
   - Version tracking
   - Description updates
   - Issuer-only access

#### Reusable Components

- **Card**: Container component with glassmorphism
- **Input**: Form input with validation
- **Button**: Action buttons with variants
- **Alert**: Success/error notifications
- **Modal**: Dialog component
- **EmptyState**: Placeholder for empty lists

### Data Flow

```
User Action → Component → Stellar Helper → Stellar SDK → Blockchain
                ↓
            State Update
                ↓
            UI Re-render
```

### Stellar Integration

The `stellar-helper.ts` file encapsulates all Stellar blockchain interactions:

- **Network Configuration**: Testnet/Mainnet switching
- **Wallet Management**: Connection, disconnection, address retrieval
- **Balance Queries**: XLM and custom asset balances
- **Payment Operations**: XLM transfers with memos
- **Transaction History**: Recent payment records
- **Explorer Integration**: Links to Stellar Expert

### State Management

The application uses React's built-in state management:

- **Local Component State**: Form inputs, loading states
- **Prop Drilling**: Passing wallet state to child components
- **Callback Functions**: Parent component updates on child actions

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Stellar-compatible wallet (Freighter recommended)
- Testnet XLM (get from [Friendbot](https://friendbot.stellar.org/))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/invoforge.git
cd invoforge

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Usage Guide

### Connecting Your Wallet

1. Click the "Connect Wallet" button
2. Select your preferred wallet from the modal
3. Approve the connection request
4. Your wallet address will be displayed

### Creating a Tokenized Project

1. Navigate to the "Project Creator" tab
2. Enter a unique asset code (max 12 characters)
3. Provide your GitHub repository URL
4. Click "Projeyi Tokenize Et"
5. The owner token will be created in your wallet

### Sending Payments

1. Navigate to the "Dashboard" tab
2. Enter the recipient's Stellar address
3. Specify the XLM amount
4. Add an optional memo
5. Click "Send Payment"
6. Confirm the transaction in your wallet

### Managing Projects

1. Navigate to the "Project Manager" tab
2. Enter the project's asset code
3. Update version number and description
4. Click "Meta Veriyi Güncelle"
5. Changes will be recorded on-chain

## Security Considerations

- **Testnet Only**: This application currently operates on Stellar Testnet
- **No Real XLM**: Never use mainnet XLM with this application
- **Wallet Security**: Always verify transaction details in your wallet
- **Address Verification**: Double-check recipient addresses before sending
- **Private Keys**: The application never has access to your private keys

## Development

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- Clear component separation
- Descriptive variable names

### Adding New Features

1. Create a new component in `components/`
2. Add necessary state management
3. Integrate with `stellar-helper.ts` for blockchain operations
4. Update the main page to include the new component
5. Test on Stellar Testnet

### Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## Network Configuration

The application defaults to Stellar Testnet. To switch to Mainnet:

```typescript
// In stellar-helper.ts
const stellar = new StellarHelper('mainnet'); // Change from 'testnet'
```

**Warning**: Only use Mainnet for production deployments with proper security measures.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check Stellar documentation at [stellar.org](https://stellar.org)
- Review Soroban documentation for smart contract integration

## Future Enhancements

- [ ] Soroban smart contract integration for advanced ownership rules
- [ ] Multi-signature support for project transfers
- [ ] Royalty distribution system
- [ ] NFT integration for project certificates
- [ ] Mobile app development
- [ ] Mainnet deployment
- [ ] Advanced analytics dashboard
- [ ] Project marketplace

## Acknowledgments

- Stellar Development Foundation for the blockchain infrastructure
- Creit.tech for the Stellar Wallets Kit
- The open-source community for the tools and libraries used

---

Built on the Stellar Network
