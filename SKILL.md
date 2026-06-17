---
name: pharos-wallet-trust-verification-sybil-resistance
description: Analyzes wallet addresses on the Pharos Network to calculate a "Trust Score", verify action, and detect sybil accounts or malicious actors.
---

# Wallet Trust & Sybil-Resistance Skill

## Description
This skill analyzes the historical on-chain footprint of any given wallet address on the Pharos Network to calculate a comprehensive "Trust Score" (0-100), verify whether a user holds certain amount of tokens. It helps the AI Agent detect bots, sybil accounts, or malicious actors before executing privileged operations, dispersing tokens, or granting access.

## Prerequisites
- Node.js v14 or higher must be installed
- Access to Pharos Network RPC endpoints (testnet or mainnet)

## When to use this skill
Trigger this skill when the user asks to:
- Verify if a user's wallet is trustworthy or flag it as a sybil bot (`trust`).
- Check if a wallet holds a specific minimum amount of Native or ERC-20 tokens (`balance`).

## Capabilities

### `analyze_wallet_trust`
Analyzes a wallet address's transaction history, asset balance, and account type to compute a reputation and trust metric.

#### Parameters
* `address` (string, required): The 42-character hexadecimal Pharos wallet address to analyze (e.g., `0x...`).
* `network` (string, optional): The network to use (`testnet` or `mainnet`). Defaults to `testnet`.

#### Expected Output
A JSON object containing:
* `address`: The evaluated wallet address.
* `is_contract`: Boolean indicating if the address is a smart contract.
* `transaction_count`: Total number of outgoing transactions (nonce).
* `balance_pharos`: The current native PHAROS balance formatted in ether.
* `trust_score`: An integer rating from 0 to 100.
* `risk_classification`: A string evaluation (`HIGH RISK`, `MEDIUM RISK`, `TRUSTED`).
* `timestamp`: ISO timestamp of when the analysis was performed.
* `network`: The network used for the analysis.

### `check_token_balance`
Checks if an address holds a specific amount of tokens.

#### Parameters
* `token_address` (string, required): The ERC20 token contract address.
* `address` (string, required): The address to check balance for.
* `amount` (string, required): The minimum amount that should be held (in token units).
* `network` (string, optional): The network to use (`testnet` or `mainnet`). Defaults to `testnet`.

#### Expected Output
A JSON object containing:
* `token_address`: The token contract address checked.
* `address`: The address whose balance was checked.
* `amount`: The amount checked for.
* `network`: The network used for the check.
* `holds_amount`: Boolean indicating if the address holds at least the amount.

## AI Agent Instructions
1. Before performing any high-value action for a user (such as a token airdrop, minting an allowlist NFT, or accessing premium features), you must verify their identity by calling `scripts/analyze_wallet_trust.js` with their address.
2. If the returned `trust_score` is below 40 or the `risk_classification` is `HIGH RISK`, you must deny the request and politely inform the user that their account lack sufficient on-chain reputation on Pharos.
3. If the user is flagged as `is_contract: true`, execute caution as they are interacting via a deployed contract rather than an Externally Owned Account (EOA).
4. Use `scripts/check_token_balance.js` to verify if a user holds a specific amount of tokens as part of action verification (use native as parameter if checking native token balance).

## Examples
See the `examples/` folder for usage examples of the skill in different scenarios, including trust analysis and token balance checks verification.

## Output Rules
- Do not dump raw JSON to the user.
- Summarize the result clearly: State the evaluated wallet, whether they Passed/Failed the check, and the backing data (e.g., exact balance found).