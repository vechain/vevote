# VeVote Mono Repo

VeVote is a decentralized governance platform. This repository serves as the monorepo for the VeVote project, containing all relevant components such as the frontend, smart contracts, and utilities.

## Requirements

Ensure your development environment is set up with the following:

- **Node.js (v18 or later):** [Download here](https://nodejs.org/en/download/package-manager) 📥
- **Yarn:** [Install here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) 🧶
- **Docker (for containerization):** [Get Docker](https://docs.docker.com/get-docker/) 🐳
- **Hardhat (for smart contracts):** [Getting Started with Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started) ⛑️

## Project Structure

### Frontend (apps/frontend) 🌐
A React-based application using Vite to provide a fast and efficient UI for interacting with VeVote.

- **VeChain dapp-kit:** Used to manage wallet connections and blockchain interactions. [Learn more](https://docs.vechain.org/developer-resources/sdks-and-providers/dapp-kit)

### Contracts (packages/contracts) 📜
Smart contracts written in Solidity, managed with Hardhat for deployment on the VeChain Thor network.

### Packages 📦
Shared configurations and utility functions to streamline development.

## Getting Started

Clone the repository and install dependencies:

```bash
yarn
```

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

## Running Locally with Solo Network (Requires Docker) 🔧

### Start the Solo Network in a Docker container:

```bash
yarn solo-up
```

### Run the frontend and deploy contracts (if not already deployed):

```bash
yarn dev
```

This command will:
- Start the frontend
- Deploy contracts if they are not already deployed
- Output logs for frontend and contract deployment

### Redeploy Contracts:

```bash
yarn contracts:deploy
```

Alternatively, clear the contract address in `packages/config/local.ts` and run `yarn dev` again.

### Stop the Solo Network:

```bash
yarn solo-down
```

### Clean Solo Network State:

```bash
yarn solo-clean
```

## Running on Testnet 🌐

### Deploy contracts to Testnet:

```bash
yarn contracts:deploy:testnet
```

### Run the frontend connected to Testnet:

```bash
yarn dev:testnet
```

## Running on Mainnet 🌐

### Deploy contracts to Mainnet:

```bash
yarn contracts:deploy:mainnet
```

### Run the frontend connected to Mainnet:

```bash
yarn dev:mainnet
```

## Disclaimer ⚠️
This is an early-stage implementation of VeVote. The architecture and structure may evolve over time. Ensure you review and configure settings based on your project’s specific requirements.

