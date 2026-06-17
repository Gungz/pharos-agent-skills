#!/usr/bin/env node

/**
 * Comprehensive Example: Complete wallet analysis including trust score and token operations
 * Usage: node examples/comprehensiveAnalysis.js <wallet_address> [network]
 */

const RPCClient = require('../lib/rpcClient');
const { calculateTrustScore } = require('../lib/trustScoring');
const { hasSentTokenAmount, holdsTokenAmount } = require('../lib/tokenOperations');

// Network configurations
const NETWORKS = {
  testnet: {
    name: 'pharos-testnet',
    rpcUrl: 'https://atlantic.dplabs-internal.com'
  },
  mainnet: {
    name: 'pharos-mainnet',
    rpcUrl: 'https://rpc.pharos.xyz' // Placeholder
  }
};

// Parse command line arguments
const walletAddress = process.argv[2];
const networkArg = process.argv[3] || 'testnet';
const network = NETWORKS[networkArg] || NETWORKS.testnet;

// Example token address (would be replaced with actual token contract)
const EXAMPLE_TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890';

// Validate inputs
if (!walletAddress) {
    console.error(JSON.stringify({
        error: "Missing required argument. Usage: node comprehensiveAnalysis.js <wallet_address> [network]"
    }));
    process.exit(1);
}

async function main() {
    try {
        const rpcClient = new RPCClient({ rpcUrl: network.rpcUrl });
        
        console.log(`Analyzing wallet ${walletAddress} on ${network.name}...\n`);
        
        // 1. Basic wallet analysis (trust score)
        const hexTxCount = await rpcClient.call('eth_getTransactionCount', [walletAddress, 'latest']);
        const txCount = parseInt(hexTxCount, 16);
        
        const hexBalance = await rpcClient.call('eth_getBalance', [walletAddress, 'latest']);
        const rawBalance = BigInt(hexBalance);
        const balancePharos = Number(rawBalance) / 1e18;
        
        const code = await rpcClient.call('eth_getCode', [walletAddress, 'latest']);
        const isContract = code !== '0x' && code !== '0x0';
        
        const { trustScore, riskClassification } = calculateTrustScore(txCount, balancePharos);
        
        // 2. Token operations examples
        console.log('Performing token operations checks...');
        
        // Check if wallet has sent at least 100 example tokens
        let holdsResult = false;
        
        try {
            holdsResult = await holdsTokenAmount(
                rpcClient, 
                EXAMPLE_TOKEN_ADDRESS, 
                walletAddress, 
                '50' // 50 tokens
            );
        } catch (tokenError) {
            // Token contract might not exist, which is fine for this example
        }
        
        // 3. Return comprehensive results
        const output = {
            address: walletAddress,
            is_contract: isContract,
            transaction_count: txCount,
            balance_pharos: balancePharos.toFixed(4),
            trust_score: trustScore,
            risk_classification: riskClassification,
            timestamp: new Date().toISOString(),
            network: network.name,
            token_analysis: {
                example_token_address: EXAMPLE_TOKEN_ADDRESS,
                holds_at_least_50_tokens: holdsResult
            }
        };

        console.log('\nAnalysis Results:');
        console.log(JSON.stringify(output, null, 2));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    }
}

main();