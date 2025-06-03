# VeVote Governance Documentation

## 🗳️ What Is VeVote?

**VeVote** is VeChain’s official decentralized governance system. It allows **endorsers of Authority** Master Nodes, holders of eligible **Stargate NFTs**—or wallets with delegated Stargate NFTs—to vote on proposals that shape the ecosystem’s future.

From protocol upgrades to community initiatives, VeVote ensures decision-making is **transparent**, **fair**, and **decentralised**.

---

## 👥 Who Can Vote?

You’re eligible to vote if:

- ✅ You **own** a Stargate NFT
- ✅ A Stargate NFT has been **delegated** to your wallet
- ✅ You are an **endorser** of an Authority Master Node (AMN)

Supported Stargate NFT levels include **MjolnirX**, **ThunderX**, **StrengthX**, **VeThorX**, **Mjolnir**, **Thunder**, **Strength**, **Flash**, **Lightning**, and **Dawn**.

> 🔐 **Delegation**: Stargate NFT holders can assign their voting rights to another wallet—enabling trusted representatives to participate in governance.

> ⚠️ Users of legacy Vehchain Nodes who have not migrated it to Stargate NFT contract will not be eligible for voting. 

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

Example: ThunderX Node (840 units), selecting 2 options:

```
Each option receives 420 units
```

### 🚨 **One Vote Per Proposal**:
Each wallet can only vote **once** per proposal.
You **cannot change or re-submit** your vote once it has been cast.

---

## 💪 How Stargate NFTs and AMN's affect Voting Power

VeVote uses a **weighted voting system** based on your Stargate NFT level or if you hold an AMN. Larger, higher-level NFTs grant **more influence**.

Voting power is calculated using **Voting Units**, determined by any combination of:

1. The tier and VET stake of your Stargate NFT

2. Your endorsement of an Authority Master Node

> ℹ️ For simplicity, throughout the rest of this documentation, we will refer to all eligible voting power sources (Stargate NFT tiers or AMN endorsement) collectively as *"Nodes."*

### 🧮 Step 1: Base Voting Power

Every node is compared to the minimum staked VET requirement of the lowest Stargate NFT tier -**Dawn (10,000 VET)** - which equals **1 voting unit**:

```
Base Voting Power = Required Staked VET to hold your Node ÷ 10,000
```

Example: Thunder X (5,600,000 VET)

```
5,600,000 ÷ 10,000 = 560 base units
```

### 🔁 Step 2: Apply the Multiplier

Each node has a multiplier. Thunder X uses **1.5x**:

```
Final Voting Power = Base Units × Multiplier
                   = 560 × 1.5
                   = 840 voting units
```

> 🧑‍💻 Dev Note: In the smart contract, multipliers are stored as whole numbers scaled by 100 (e.g. 150 = 1.5).

### ➕ Holding Multiple Nodes

If you hold—or are delegated—more than one Node, your **total voting power** is the sum of all their voting units. For example:

- Thunder X = 840 units
- Strength X = 240 units

🧮 Total = **1,080 voting units**

> 📌 When you vote, your combined power is automatically calculated from all eligible Nodes—both owned and delegated—based on the snapshot. You only vote once, and VeVote determines which Nodes are available to you and applies their combined voting power behind the scenes.

### 📊 Voting Power Table

| Node Type   | VET Required | Multiplier | Voting Units |
| ----------- | ------------ | ---------- | ------------ |
| AMN Endorser| 25,000,000   | 2.0×       | 5,000        |
| Mjolnir X   | 15,600,000   | 1.5×       | 2,340        |
| Thunder X   | 5,600,000    | 1.5×       | 840          |
| Strength X  | 1,600,000    | 1.5×       | 240          |
| VeThor X    | 600,000      | 1.5×       | 90           |
| Mjolnir     | 15,000,000   | 1.0×       | 1,500        |
| Thunder     | 5,000,000    | 1.0×       | 500          |
| Strength    | 1,000,000    | 1.0×       | 100          |
| Flash\*     | 200,000      | 1.0×       | 20           |
| Lightning\* | 50,000       | 1.0×       | 5            |
| Dawn\*      | 10,000       | 1.0×       | 1            |


> ℹ️ Note: the voting units in the smart are scaled by 100 to avoid underflow when determining to total vote weight. 

### ⚖️ When Is Voting Power Counted?

Voting power is calculated at the **moment you cast your vote**, not at the proposal’s start.

Although a startBlock snapshot defines when voting begins, your voting power depends on your live status during the voting period. This includes:

- Stargate NFTs you currently hold
- Stargate NFTs currently delegated to you
- Whether your address is listed as an Authority Master Node endorser

> 🔒  **Important Notes**:
>    - NFTs minted after voting begins can **not** be used to vote.
>    - NFTs burned, transferred, or undelegated before voting will not count.
>    - Eligibility and voting strength are assessed in real time when you vote — not at startBlock.

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

- Voting begins at the specified `startBlock`
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

- Creator or other users with the `WHITELISTED_ROLE` may cancel proposals before they start
- Admins may cancel proposals before they complete

---

## 📊 Quorum

A proposal only passes if it reaches **quorum**—a minimum number of voting units participating.

- Defined as a **percentage of total voting units**
- Configurable via `VeVoteConfigurator`
- Calculated at proposal end using the snapshot

If quorum isn’t met, the proposal automatically **fails** (**DEFEATED**).

---

## 📝 Proposal Creation

Only users with the `WHITELISTED_ROLE` can submit proposals on-chain.

To suggest a proposal:

👉 Open a thread on [Discourse](https://vechain.discourse.group/latest).
You can use the same channel to get some help to:

- Review your proposal
- Get some endorsement
- Format it correctly
- Funnel it to a whitelisted member (`WHITELISTED_ROLE`)

Proposal Creation Format:

| Field          | Type        | Description                                |
| -------------- | ----------- | ------------------------------------------ |
| `description`  | `string`    | IPFS CID for full Markdown content         |
| `startBlock`    | `uint256`   | Block when voting starts (after delay) |
| `voteDuration` | `uint256`   | Duration in seconds                        |
| `choices`      | `bytes32[]` | List of voting options                     |
| `maxSelection` | `uint8`     | Max choices a voter can select             |
| `minSelection` | `uint8`     | Min choices a voter must select            |

## 📍 Summary

VeVote enables:

- On-chain governance with off-chain execution
- Node-weighted multi-choice voting
- Configurable proposal rules and quorum
- Upgradeable and modular smart contract architecture

It’s a flexible governance tool purpose-built for the VeChain ecosystem.
