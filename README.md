# Product Tracker DApp

A decentralized application for product traceability built with Solidity, Hardhat, React, and ethers.js.

## 🚀 Features

- **Product Registration**: Register products with unique IDs, quantities, and characterization hashes
- **Event Tracking**: Track lifecycle events for registered products
- **Real-time Logs**: View all product registrations and events in real-time
- **Fuji Testnet**: Deployed and ready to use on Avalanche Fuji Testnet
- **Modern UI**: Beautiful, responsive interface with toast notifications

## 🛠️ Tech Stack

- **Smart Contract**: Solidity ^0.8.28
- **Development**: Hardhat
- **Frontend**: React + TypeScript + Vite
- **Blockchain**: ethers.js v6
- **Network**: Avalanche Fuji Testnet
- **Styling**: Modern CSS with gradients and animations

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or Brave Browser with wallet functionality
- AVAX tokens on Fuji Testnet (get from faucet)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cetim-challenge
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
FUJI_PRIVATE_KEY=your_private_key_here
FUJI_RPC_URL=https://avalanche-fuji-c-chain-rpc.publicnode.com
```

### 3. Compile and Test

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

### 4. Deploy to Fuji Testnet

```bash
# Deploy contract to Fuji
npm run deploy:fuji
```

### 5. Run Frontend

```bash
# Start development server
npm run dev
```

### 6. View the Project

Open your browser and visit:
```
http://localhost:5173/
```

You should see the Product Tracker DApp running with a modern interface!

## 🌐 Network Configuration

### Fuji Testnet Setup

Configure your wallet with these settings:

- **Network Name**: Avalanche Fuji
- **RPC URL**: `https://avalanche-fuji-c-chain-rpc.publicnode.com`
- **Chain ID**: `43113`
- **Currency Symbol**: `AVAX`
- **Block Explorer**: `https://testnet.snowtrace.io/`

### Get Test AVAX

Visit the [Fuji Faucet](https://faucet.avax-test.network/) to get free test AVAX.

## 📦 Contract Information

### Deployed Contract Address

```
0x4AfAA2E7BE37b2A59f409438b32Af29fA6609e23
```

### Contract Functions

- `registerProduct(uint256 _id, uint256 _quantity, bytes32 _hash)` - Register a new product
- `registerEvent(uint256 _productId, string _eventType, string _eventData)` - Register an event for a product
- `getProduct(uint256 _id)` - Get product information
- `exists(uint256 _id)` - Check if product exists

### Events

- `ProductRegistered(uint256 indexed id, uint256 quantity, bytes32 characterizationHash, address indexed owner)`
- `ProductEvent(uint256 indexed productId, string eventType, string eventData, uint256 timestamp)`

## 🎯 Usage Guide

### 1. Connect Wallet

1. Open the DApp in your browser
2. Click "Connect Wallet"
3. Approve the connection in MetaMask/Brave
4. Ensure you're on Fuji Testnet (Chain ID: 43113)

### 2. Attach Contract

Click "Use Fuji Contract" to attach the deployed contract, or manually enter a contract address.

### 3. Register Products

1. Fill in the product form:
   - **Product ID**: Unique identifier (e.g., 12345)
   - **Quantity**: Number of units
   - **Characterization Hash**: Description or hash of product characteristics
2. Click "Register Product"
3. Confirm the transaction in your wallet

### 4. Register Events

1. Fill in the event form:
   - **Product ID**: ID of existing product
   - **Event Type**: Select from dropdown (CREATED, SHIPPED, DELIVERED, etc.)
   - **Event Data**: Additional information about the event
2. Click "Register Event"
3. Confirm the transaction in your wallet

### 5. View Activity

All product registrations and events appear in real-time in the "Activity Logs" section.

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start frontend development server

# Smart Contract
npm run compile         # Compile contracts
npm run test           # Run contract tests
npm run deploy:fuji    # Deploy to Fuji Testnet

# Code Quality
npm run format         # Format all code with Prettier
npm run lint           # Run ESLint
npm run lint:contracts # Lint Solidity contracts
```

## 📁 Project Structure

```
cetim-challenge/
├── contracts/              # Smart contracts
│   └── ProductRegistry.sol
├── frontend/               # React frontend
│   ├── components/
│   │   └── ProductForm.tsx
│   ├── pages/
│   │   └── index.tsx
│   ├── index.html
│   └── main.tsx
├── scripts/                # Deployment scripts
│   └── deploy.js
├── test/                   # Contract tests
│   └── ProductRegistry.test.js
├── hardhat.config.cjs      # Hardhat configuration
├── package.json
└── README.md
```

## 🔒 Security Features

- **Custom Errors**: Gas-efficient error handling
- **Access Control**: Only product owners can register events
- **Input Validation**: Comprehensive validation for all inputs
- **Type Safety**: Full TypeScript implementation

## 🐛 Troubleshooting

### Common Issues

1. **"Wallet not detected"**: Install MetaMask or use Brave Browser
2. **"Wrong network"**: Switch to Fuji Testnet (Chain ID: 43113)
3. **"Insufficient funds"**: Get AVAX from the faucet
4. **"Transaction failed"**: Check gas limits and network status

### Getting Help

- Check the browser console for detailed error messages
- Ensure your wallet has sufficient AVAX for gas fees
- Verify you're connected to the correct network

## Contributing

<p align="center">Made with ❤️ by <a href="https://github.com/luislucena16">Luis Lucena</a></p>