# VeVote Governance Documentation

## 🗳️ What Is VeVote?

**VeVote** is VeChain’s official decentralized governance system. It allows holders of eligible **VeChain Nodes**—or wallets with delegated Nodes—to vote on proposals that shape the ecosystem’s future.

From protocol upgrades to community initiatives, VeVote ensures decision-making is **transparent**, **fair**, and **community-driven**.

---

## 👥 Who Can Vote?

You’re eligible to vote if:

- ✅ You **own** a VeChain Node
- ✅ A Node has been **delegated** to your wallet

Supported Node types include **Validator**, **MjolnirX**, **ThunderX**, **StrengthX**, **VeThorX**, **Mjolnir**, **Thunder**, **Strength**, **Flash**, **Lightning**,  and **Dawn**.

> 🔐 **Delegation**: Node holders can assign their voting rights to another wallet—enabling trusted representatives to participate in governance.

---

## 🧠 How Voting Works

VeVote uses **multiple-choice voting**. Unlike `YES`/`NO`/`ABSTAIN` voting systems, voters select from a list of **custom options** defined for each proposal.

Each proposal defines:

- A list of voting **choices**
- A **minimum** and **maximum** number of options voters can select

Your total voting power is **evenly split** among selected choices:
```
Power per Choice = Voting Units ÷ Choices Selected
```

Example: Thunder X Node (840 units), selecting 2 options:
```
Each option receives 420 units
```

---


## 💪 How Node Type Affects Voting Power

VeVote uses a **weighted voting system** based on your Node type. Larger, higher-tier Nodes grant **more influence**.

Voting power is calculated using **Voting Units**, determined by:

1. The minimum requirement of **VET staked** for your Node (compared to the smallest tier)
2. A **multiplier** based on the Node tier

### 🧮 Step 1: Base Voting Power

Every Node is compared to the minimum requirement of the lowest Node tier —**Dawn (10,000 VET)**—which equals **1 voting unit**:

```
Base Voting Power = Your Node’s VET ÷ 10,000
```

Example: Thunder X (5,600,000 VET)
```
5,600,000 ÷ 10,000 = 560 base units
```

### 🔁 Step 2: Apply the Multiplier

Each Node tier has a multiplier. Thunder X uses **1.5x**:
```
Final Voting Power = Base Units × Multiplier
                   = 560 × 1.5
                   = 840 voting units
```

> 🧑‍💻 Dev Note: In the contract, multipliers are stored as whole numbers scaled by 100 (e.g. 150 = 1.5).

### ➕ Holding Multiple Nodes
If you hold—or are delegated—more than one Node, your **total voting power** is the sum of all their voting units. For example:

- Thunder X = 840 units
- Strength X = 240 units

🧮 Total = **1,080 voting units**


> 📌 When you vote, your combined power is automatically calculated from all eligible Nodes—both owned and delegated—based on the snapshot. You only vote once, and VeVote determines which Nodes are available to you and applies their combined voting power behind the scenes.

### 📊 Voting Power Table

| Node Type     | VET Required | Multiplier | Voting Units |
|---------------|--------------|------------|---------------|
| Validator     | 25,000,000   | 2.0×       | 5,000         |
| Mjolnir X     | 15,600,000   | 1.5×       | 2,340         |
| Thunder X     | 5,600,000    | 1.5×       | 840           |
| Strength X    | 1,600,000    | 1.5×       | 240           |
| VeThor X      | 600,000      | 1.5×       | 90            |
| Mjolnir       | 15,000,000   | 1.0×       | 1,500         |
| Thunder       | 5,000,000    | 1.0×       | 500           |
| Strength      | 1,000,000    | 1.0×       | 100           |
| Flash*        | 200,000      | 1.0×       | 20            |
| Lightning*    | 50,000       | 1.0×       | 5             |
| Dawn*         | 10,000       | 1.0×       | 1             |


### 🕒 When Is Voting Power Counted?

A **snapshot** is taken at the **start** of every proposal’s voting period. Your voting power is locked in based on:

- All Nodes you own directly
- Any Nodes delegated to your wallet

> 🔒 Changes after voting starts (buying/selling/delegating Nodes) **don’t affect** that proposal.

---
## 🔄 Proposal Lifecycle

Each proposal moves through the following stages:

### 1. **Creation**
- Submitted by a user with the `WHITELISTED_ROLE`
- Includes: title, IPFS description, list of choices, vote config

### 2. **Pending**
- Proposal is registered but not live yet
- Delayed start gives time for voter awareness

### 3. **Active**
- Voting begins at the specified `startTime`
- Snapshot taken for voter eligibility and power
- Each Node can vote once

### 4. **Closed**
- Voting ends after `voteDuration`
- Results become locked

### 5. **Evaluation**
- Results tallied
- If quorum is met and at least one choice has support → **SUCCEEDED**
- Otherwise → **DEFEATED**

### 6. **Execution (Off-chain)**
- Passed proposals may be manually implemented by VeChain Foundation or others
- Selected accounts can mark the proposal as Executed after the decision has become effective

### 7. **Cancellation**
- Creators or admins may cancel proposals before they complete

---

## 📊 Quorum

A proposal only passes if it reaches **quorum**—a minimum number of voting units participating.

- Defined as a **percentage of total staked VET in Node contracts**
- Configurable via `VeVoteConfigurator`
- Calculated at proposal end using the snapshot

If quorum isn’t met, the proposal automatically **fails**.

---

## 📝 Proposal Creation

Only users with the `WHITELISTED_ROLE` can submit proposals on-chain.

To suggest a proposal:

👉 Contact the **VeChain Foundation**.
They can help:
- Review your proposal
- Format it correctly
- Submit it through a whitelisted address

Proposal Creation Format: 

| Field | Type | Description |
|-------|------|-------------|
| `description` | `string` | IPFS CID for full Markdown content |
| `startTime` | `uint256` | Timestamp when voting starts (after delay) |
| `voteDuration` | `uint256` | Duration in seconds |
| `choices` | `bytes32[]` | List of voting options |
| `maxSelection` | `uint8` | Max choices a voter can select |
| `minSelection` | `uint8` | Min choices a voter must select |


## 📍 Summary

VeVote enables:
- On-chain governance with off-chain execution
- Node-weighted multi-choice voting
- Configurable proposal rules and quorum
- Upgradeable and modular smart contract architecture

It’s a flexible governance tool purpose-built for the VeChain ecosystem.


