#!/usr/bin/env node

/**
 * Pharos Skill Engine - Wallet Trust Score Script
 * Evaluates a wallet's reputation using direct JSON-RPC calls to the Pharos Network.
 * Supports both mainnet and testnet environments.
 */

const RPCClient = require('../lib/rpcClient');
const { calculateTrustScore } = require('../lib/trustScoring');

// Network configurations
const NETWORKS = {
  testnet: {
    name: 'pharos-testnet',
    rpcUrl: 'https://atlantic.dplabs-internal.com'
  },
  mainnet: {
    name: 'pharos-mainnet',
    rpcUrl: 'https://rpc.pharos.xyz' // Placeholder - replace with actual mainnet URL
  }
};

// Extract target address from command-line arguments
const targetAddress = process.argv[2];

// Extract network from command-line arguments (default to testnet)
const networkArg = process.argv[3];
const network = NETWORKS[networkArg] || NETWORKS.testnet;

if (!targetAddress || !targetAddress.startsWith('0x') || targetAddress.length !== 42) {
    console.error(JSON.stringify({
        error: "Invalid or missing Pharos wallet address. Usage: node analyze_wallet_trust.js <0x_address> [testnet|mainnet]"
    }));
    process.exit(1);
}

/**
 * Main function to analyze wallet trust
 */
async function main() {
    try {
        // Initialize RPC client for selected network
        const rpcClient = new RPCClient({ rpcUrl: network.rpcUrl });

        // 1. Fetch Transaction Count (Nonce)
        const hexTxCount = await rpcClient.call('eth_getTransactionCount', [targetAddress, 'latest']);
        const txCount = parseInt(hexTxCount, 16);

        // 2. Fetch Native Balance
        const hexBalance = await rpcClient.call('eth_getBalance', [targetAddress, 'latest']);
        const rawBalance = BigInt(hexBalance);
        // Convert Wei to Ether (18 decimals)
        const balancePharos = Number(rawBalance) / 1e18;

        // 3. Check if the address is a Smart Contract or an EOA
        const code = await rpcClient.call('eth_getCode', [targetAddress, 'latest']);
        const isContract = code !== '0x' && code !== '0x0';

        // 4. Calculate Trust Score Logic (0 - 100 scale)
        const { trustScore, riskClassification } = calculateTrustScore(txCount, balancePharos);

        // 5. Return Structured JSON string back to the Pharos Skill Engine / LLM
        const output = {
            address: targetAddress,
            is_contract: isContract,
            transaction_count: txCount,
            balance_pharos: balancePharos.toFixed(4),
            trust_score: trustScore,
            risk_classification: riskClassification,
            timestamp: new Date().toISOString(),
            network: network.name
        };

        console.log(JSON.stringify(output, null, 2));

    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    }
}

main();