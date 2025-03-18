# 📄 VeVote Smart Contracts Documentation

This document provides a technical summary of the smart contracts that make up the VeVote governance system. It explains the architecture, roles, upgrade mechanics, use of libraries, and how contracts interact with external components.

---

## 🧩 Contract Architecture

VeVote is designed as a modular system using the **UUPS proxy pattern**, which separates contract logic from storage. This allows logic to be upgraded while preserving state.

### Core Contracts

| Contract                   | Purpose                                                             |
|----------------------------|----------------------------------------------------------------------|
| `VeVote.sol`               | VeVote system smart contract, routes proposal and voting calls, handles access control and storage |

> 🧠 These contracts define the high-level behavior and state management of the system. All logic is offloaded to libraries.

---

## 📦 Libraries in VeVote

VeVote uses a set of specialized **library contracts** to keep the logic modular, testable, and upgradable without increasing the size of the main contract. These libraries are stateless and rely on a shared storage layout defined in `VeVoteStorage.sol`.

### Why Libraries?
- ✅ **Modularity** – Each library focuses on a single area of functionality (e.g. voting, timing)
- 🔁 **Reusability** – Logic can be reused across governance versions or other DAO systems
- ⚡ **Gas Efficiency** – Smaller contract size reduces deployment and interaction costs
- 🧱 **Upgrade Flexibility** – Allows logic updates without touching unrelated modules

### Core Logic Libraries

| Library Contract           | Responsibility                                                  |
|----------------------------|------------------------------------------------------------------|
| `VeVoteVoteLogic.sol`      | Voting logic: casting, tallying, validation                      |
| `VeVoteProposalLogic.sol`  | Proposal creation: input validation, role checks, setup          |
| `VeVoteQuorumLogic.sol`    | Quorum calculation and pass/fail logic                           |
| `VeVoteClockLogic.sol`     | Time-related logic  |
| `VeVoteConfigurator.sol`   | Admin-only config updates: vote durations, multipliers, quorum   |

> 📌 These libraries are called via delegatecall from `VeVote.sol`, and all read/write operations interact with `VeVoteStorage.sol`.

---

## 👤 Roles & Access Control

VeVote uses OpenZeppelin's `AccessControlUpgradeable` to manage permissions.

| Role                 | Capability                                                   |
|----------------------|---------------------------------------------------------------|
| `DEFAULT_ADMIN_ROLE` | Full control: manage roles and governance parameters          |
| `UPGRADER_ROLE`      | Grants ability to upgrade logic contracts via proxy           |
| `WHITELISTED_ROLE`   | Can submit proposals to the VeVote system                     |
| `SETTINGS_MANAGER_ROLE` | Manages contract configurations |
| `EXECUTOR_ROLE` | Can mark proposals as executed, as execution happens off-chain  |
| `VOTE_PARAMS_MANAGER_ROLE` | Can update parameters of the vote weighting formula |
---

## 🔐 Upgradeability

VeVote supports upgradeability through the **UUPS Proxy Pattern**:

- The **proxy contract** holds all persistent data
- **Logic contracts (libraries)** are called via delegatecall
- **`VeVoteStorage.sol`** defines a stable layout to prevent storage collisions

> 🔄 Logic can be upgraded module-by-module without resetting or migrating data.

---

## 🔗 External Integrations

| External Contract       | Purpose                                                     |
|--------------------------|-------------------------------------------------------------|
| `NodeManagement.sol`     | Validates Node ownership and delegation relationships       |
| `ThunderFactory.sol`     | Vehchain Node Staking contract (TODO: Update) 

---

## 📬 Deployed Addresses

This section will list the deployed VeVote contract addresses by network.

| Contract                  | Address                                                   |
|---------------------------|------------------------------------------------   |
| `VeVote.sol`              | `0x0000000000000000000000000000000000000000`                                                      |

| Library                  | Address        |
|---------------------------|----------------|
| `VeVoteVoteLogic.sol`              | `0x0000000000000000000000000000000000000000`          |
| `VeVoteQuorumLogic.sol`  | `0x0000000000000000000000000000000000000000`          |
| `VeVoteProposalLogic.sol`  | `0x0000000000000000000000000000000000000000`          |
| `VeVoteConfigurator.sol`  | `0x0000000000000000000000000000000000000000`          |





