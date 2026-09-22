# Vouchera — Verified Digital Subsidy Protocol

> A decentralized, multi-organization subsidy/voucher distribution platform on Bohr Testnet.
> Organizations fund restricted BOT-backed vouchers. Beneficiaries spend them at approved merchants. Merchants receive actual BOT.

---

## What is Vouchera?

Vouchera is a Web3 protocol for organizations to distribute **digital subsidy vouchers** to approved beneficiaries. Each voucher is backed by actual native BOT held in the smart contract, restricted to specific categories and merchants, non-transferable, and enforced entirely on-chain.

> **Important:** Vouchera vouchers are restricted subsidy entitlements backed by funded BOT. They are **not** freely transferable ERC-20 tokens. Beneficiaries receive assistance — they do not earn or trade.

---

## Core Flow

```
Eligible User
  ↓
Creates Organization (becomes Organization Owner)
  ↓
Creates Subsidy Program (e.g. Food Support 2026)
  ↓
Funds Program with BOT (held in contract)
  ↓
Approves Beneficiaries
  ↓
Approves Merchants (with category codes)
  ↓
Issues Voucher to Beneficiary (non-transferable, restricted)
  ↓
Beneficiary Uses Voucher with Approved Merchant
  ↓
Contract Validates Everything On-Chain
  ↓
Merchant Receives Actual BOT
  ↓
Redemption Recorded On-Chain
```

---

## Roles

### Protocol Admin

The wallet that deployed Vouchera. Responsible for:

- Setting organization-creation eligibility threshold
- Granting activity scores to verified users (analogous to KYC approval)
- Protocol-level emergency safeguards (narrow scope only)

> **The Protocol Admin does NOT own organizations and cannot withdraw organization funds.**

### Organization Owner

An eligible user who calls `createOrganization()`. Responsible for:

- Creating and funding subsidy programs
- Approving beneficiaries and merchants
- Issuing and managing vouchers
- Monitoring their organization's accounting

> Multiple organizations exist independently. Alice cannot manage Bob's organization.

### Beneficiary

An approved wallet that receives subsidy vouchers. Can:

- View their vouchers and restrictions
- Initiate redemptions at approved merchants
- Cannot issue themselves vouchers or change restrictions

### Merchant

An approved business wallet that accepts vouchers. Receives actual BOT upon valid beneficiary-authorized redemption.

---

## Eligibility Mechanism

Users must accumulate an **activity score** to create an organization. The Protocol Admin grants activity points (via `recordActivity(address, amount)`) to verified participants — analogous to a KYC/verification process.

```solidity
mapping(address => uint256) public activityScore;
uint256 public organizationCreationThreshold; // default: 10
```

Once `activityScore[user] >= organizationCreationThreshold`, the user is eligible to call `createOrganization()`.

---

## Organization Creation

```solidity
createOrganization(string name, string description)
```

- Checks eligibility on-chain
- Sets `organization.owner = msg.sender` (NOT the Protocol Admin)
- Emits `OrganizationCreated`

---

## Voucher System

Vouchers are **not** ERC-20 tokens. They are on-chain records:

```solidity
struct Voucher {
    uint256 id;
    uint256 organizationId;
    uint256 programId;
    address beneficiary;        // Only this wallet can redeem
    uint256 allocatedAmount;    // Total BOT
    uint256 remainingAmount;    // Available to spend
    uint256 redeemedAmount;     // Already spent
    bytes32 categoryCode;       // e.g. keccak256("FOOD")
    address allowedMerchant;    // address(0) = any approved category merchant
    uint64 issuedAt;
    uint64 expiresAt;
    VoucherStatus status;
}
```

### Voucher Categories

| Category   | Description                    |
| ---------- | ------------------------------ |
| FOOD       | Food & Grocery stores          |
| EDUCATION  | Schools, bookstores, tutoring  |
| HEALTHCARE | Clinics, pharmacies            |
| TRANSPORT  | Public transport, fuel         |
| ESSENTIALS | Housing, utilities, essentials |

---

## Funding Accounting

```
Available Funds = totalFunded - totalAllocated - totalRedeemed - totalRefunded
```

The contract enforces:

- Voucher value ≤ available program funds
- Each redemption ≤ remaining voucher balance
- Actual BOT transferred to merchant on redemption

---

## Security

| Mechanism                   | Description                                       |
| --------------------------- | ------------------------------------------------- |
| Protocol Admin separation   | Admin cannot withdraw org funds                   |
| Organization isolation      | Cross-org access prevented                        |
| Eligibility gate            | Random wallets cannot create orgs                 |
| On-chain expiry             | Contract enforces expiry, not frontend            |
| Reentrancy protection       | OpenZeppelin ReentrancyGuard + CEI pattern        |
| Category restrictions       | Merchant category must match voucher              |
| Beneficiary-only redemption | Only voucher.beneficiary can call redeemVoucher() |
| Non-transferability         | No transferVoucher() function                     |
| No double spending          | remainingAmount tracked per voucher               |
| Funded issuance only        | Cannot issue unfunded vouchers                    |

### Limitation & Physical Inspection Boundary Resolution

The blockchain cannot directly inspect physical goods (e.g. rice, medicine) in the offline world. Vouchera resolves this boundary through a multi-tier cryptographic and audit framework:

1. **On-Chain Cryptographic Gate:** Restricts redemptions exclusively to organization-approved merchants matching the exact program category code (`bytes32` category check), preventing funds from leaving the authorized merchant network.
2. **Beneficiary Signature Authorization:** The beneficiary must initiate and sign the transaction, preventing merchants from unilaterally claiming funds.
3. **On-Chain Invoice & Receipt Anchoring:** Each redemption anchors a merchant purchase/order reference directly in the immutable `Redemption` struct and emits `VoucherRedeemed` events with indexed parameters.
4. **Itemized Digital Redemption Receipts:** The UI generates a verified digital redemption receipt detailing organization, program, merchant, timestamp, and transaction hash for off-chain accounting and physical inventory audits.

---

## Smart Contract

| Item           | Value                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------ |
| Contract       | `Vouchera.sol`                                                                             |
| Address        | `0xCad5b0572f4bD9732d26B319530254b477dA9711`                                               |
| Network        | Bohr Testnet (Chain ID: 968)                                                               |
| Deployment TX  | `0xefbbd255901fad2dd3dc8d03314aa5febcf2efb2ff9e561029268fc7a19dedbc`                       |
| Protocol Admin | `0xC357A22d19e72abA2d4cd954a38774D98ebF0868`                                               |
| Bohr Explorer  | [View Contract](https://scan.bohr.life/address/0xCad5b0572f4bD9732d26B319530254b477dA9711) |

### Live Broadcasted E2E On-Chain Transactions

- **Record Activity (50 pts)**: [`0xd001a1f6e3214a7c646588426fb918aaf6ef00dec8aebfeae19d9e211f8571e8`](https://scan.bohr.life/tx/0xd001a1f6e3214a7c646588426fb918aaf6ef00dec8aebfeae19d9e211f8571e8)
- **Create Organization**: [`0xbc20638c5341d60a2ba334fc9ca064bf552e9d6879bc7a8310890ee94ce30d52`](https://scan.bohr.life/tx/0xbc20638c5341d60a2ba334fc9ca064bf552e9d6879bc7a8310890ee94ce30d52)
- **Create Program**: [`0x3c5bb0240da170a67f93a14fea8fce135307c168ac034449cb6ff956f5809b66`](https://scan.bohr.life/tx/0x3c5bb0240da170a67f93a14fea8fce135307c168ac034449cb6ff956f5809b66)
- **Fund Program (0.05 BOT)**: [`0x386ab34256ef3265dfcdfe87cc396e43ff264449613e2488049d7fc3e1e6cd5f`](https://scan.bohr.life/tx/0x386ab34256ef3265dfcdfe87cc396e43ff264449613e2488049d7fc3e1e6cd5f)
- **Activate Program**: [`0x77c0a3e8295f71d001845e41d011bdea266a14773bdba6a78c999c0639135e34`](https://scan.bohr.life/tx/0x77c0a3e8295f71d001845e41d011bdea266a14773bdba6a78c999c0639135e34)
- **Approve Merchant**: [`0x0f274d7411b2c13268641ffbca7ec21c7025171208169f864f7ccb182fc1dd1e`](https://scan.bohr.life/tx/0x0f274d7411b2c13268641ffbca7ec21c7025171208169f864f7ccb182fc1dd1e)
- **Approve Beneficiary**: [`0x61dabe9e6e1767bfa9941dd48944ca98f48e83fd67e253aa3ed0c10a1fac4dcb`](https://scan.bohr.life/tx/0x61dabe9e6e1767bfa9941dd48944ca98f48e83fd67e253aa3ed0c10a1fac4dcb)
- **Issue Voucher (0.02 BOT)**: [`0xeb600541bb46018ea9c476b5d56c939a337d99abe5fb2c6b57806ee160789940`](https://scan.bohr.life/tx/0xeb600541bb46018ea9c476b5d56c939a337d99abe5fb2c6b57806ee160789940)

---

## Bohr Testnet

| Setting      | Value                   |
| ------------ | ----------------------- |
| Network      | Bohr Testnet            |
| Chain ID     | 968                     |
| RPC URL      | https://rpc.bohr.life   |
| Native Token | BOT                     |
| Explorer     | https://scan.bohr.life/ |

---

## Repository Structure

```
Vouchera/
├── contract/                    # Foundry project
│   ├── src/Vouchera.sol         # Core protocol contract
│   ├── script/Deploy.s.sol      # Deployment script
│   ├── test/Vouchera.t.sol      # 82 comprehensive tests
│   ├── lib/                     # forge-std, openzeppelin-contracts
│   └── foundry.toml
├── frontend/                    # Vite + React + TypeScript
│   ├── public/vouchers/         # SVG voucher artwork (5 categories)
│   ├── src/
│   │   ├── abi/Vouchera.json    # Contract ABI
│   │   ├── config/              # wagmi + reown + contract config
│   │   ├── components/          # Layout, VoucherCard, etc.
│   │   ├── hooks/               # useVouchera, contract hooks
│   │   ├── pages/               # 9 pages
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # formatting, categories
│   ├── .env.example
│   └── package.json
├── .env                         # Root environment (gitignored)
└── .gitignore
```

---

## Local Development

### Prerequisites

- [Foundry](https://getfoundry.sh)
- Node.js 18+
- npm

### Contract

```bash
cd contract
forge build
forge test
```

### Frontend

```bash
cd frontend
cp ../.env.example .env.local
# Fill in your VITE_REOWN_PROJECT_ID
npm install
npm run dev
```

### Deploy Contract

```bash
cd contract
# Set PRIVATE_KEY in environment
forge script script/Deploy.s.sol --rpc-url https://rpc.bohr.life --broadcast
```

---

## Environment Variables

### Frontend (.env.local)

```env
VITE_REOWN_PROJECT_ID=your_reown_project_id_here
VITE_BOT_CHAIN_ID=968
VITE_BOT_RPC_URL=https://rpc.bohr.life
VITE_BOT_EXPLORER_URL=https://scan.bohr.life/
VITE_VOUCHERA_CONTRACT_ADDRESS=0xCad5b0572f4bD9732d26B319530254b477dA9711
```

> Never commit `.env` or `.env.local`. Never put `PRIVATE_KEY` in a `VITE_*` variable.

---

## Test Results

```
forge test

Ran 82 tests for test/Vouchera.t.sol:VoucheraTest
Suite result: ok. 82 passed; 0 failed; 0 skipped
```

All 15 accounting invariants verified. Tests cover:

- Protocol Admin authority and boundaries
- Eligibility gate enforcement
- Organization creation and isolation
- Program lifecycle and funding
- Beneficiary and merchant management
- Voucher issuance, expiry, cancellation
- Redemption flow with actual BOT transfer
- Double-spending prevention
- Cross-organization access prevention
- Protocol Admin cannot access org funds

---

## Live Frontend

> URL will be updated after Vercel deployment.

---

## Security Checklist

- [x] No hardcoded private keys
- [x] No hardcoded Reown project IDs in source
- [x] `.env` and `.env.local` in `.gitignore`
- [x] `broadcast/` and `out/` in `.gitignore`
- [x] Protocol Admin ≠ Organization Owner
- [x] Beneficiary-only redemption enforced on-chain
- [x] No unfunded voucher issuance
- [x] No double-spending
- [x] Reentrancy guard on redemption and cancellation
- [x] Vouchers non-transferable
- [x] Expiry enforced in contract (not frontend)
- [x] Category and merchant restrictions enforced on-chain
- [x] Organization isolation enforced on-chain
