# VeVote Mono Repo

VeVote is a decentralized governance platform. This repository serves as the monorepo for the VeVote project, containing all relevant components such as the frontend, smart contracts, and utilities.

## Requirements

Ensure your development environment is set up with the following:

- **Node.js (v18 or later):** [Download here](https://nodejs.org/en/download/package-manager) 📥
- **Yarn:** [Install here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) 🧶
- **Docker (for containerization):** [Get Docker](https://docs.docker.com/get-docker/) 🐳
- **Hardhat (for smart contracts):** [Getting Started with Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started) ⛑️

## Project Structure

The main project is the `apps/frontend` folder. Everytime we start the frontend it will also compile the contracts (under the `packages/contracts` folder) and deploy them if they are not deployed yet. This will allow to have up to date ABIs, addresses and types in the frontend

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
_____

## 🧪 Smart Contract Development

The VeVote smart contracts are located in `packages/contracts` and use **Hardhat** for compilation, deployment, testing, and documentation. These commands must be run from the **root of the repository**.

---

### 📦 Compile Contracts

Compile all Solidity contracts:

```bash
yarn contracts:compile
```

> ✅ This must be run from the root directory. It compiles contracts using Hardhat and generates:
>
> * ABI files (for the frontend)
> * TypeChain TypeScript bindings
> * Bytecode and metadata artifacts

---

### 🧪 Run Contract Tests

To run local unit tests:

```bash
yarn contracts:test
```

To run tests against a Solo Thor network in Docker:

```bash
yarn contracts:test:thor-solo
```

Tests are located in `packages/contracts/test/` and use Mocha + Chai.

---

### 📊 Test Coverage

Generate a Solidity test coverage report:

```bash
yarn test:coverage:solidity
```

> 📁 Coverage reports are written to `packages/contracts/coverage/`.

---

### 📖 Generate Documentation

Automatically generate Markdown docs from your contract NatSpec comments:

```bash
yarn contracts:generate-docs
```

Useful for syncing with developer portals, GitBook, or Notion.

> 📁 Contract documentation is written to `packages/contracts/docs/`.

---

### 📤 Deploy Contracts

To deploy contracts to the **local Solo network**:

```bash
yarn contracts:deploy
```

To deploy to other networks:

```bash
yarn contracts:deploy:testnet
yarn contracts:deploy:mainnet
```

> 💡 If you need to force a redeploy locally, clear the addresses in `packages/config/local.ts` and re-run `yarn dev`.

---