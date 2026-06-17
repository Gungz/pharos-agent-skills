#!/usr/bin/env node

/**
 * Example: Check if a wallet holds a specific amount of tokens
 * Usage: node examples/checkTokenBalance.js <token_address> <address> <amount> [decimals] [network]
 */

const { holdsTokenAmount } = require('../lib/tokenOperations');
const RPCClient = require('../lib/rpcClient');

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
const tokenAddress = process.argv[2];
const address = process.argv[3];
const amount = process.argv[4];
const networkArg = process.argv[6] || 'testnet';
const network = NETWORKS[networkArg] || NETWORKS.testnet;

// Validate inputs
if (!tokenAddress || !address || !amount) {
    console.error(JSON.stringify({
        error: "Missing required arguments. Usage: node checkTokenBalance.js <token_address> <address> <amount> [network]"
    }));
    process.exit(1);
}

async function main() {
    try {
        const rpcClient = new RPCClient({ rpcUrl: network.rpcUrl });
        
        const result = await holdsTokenAmount(
            rpcClient, 
            tokenAddress, 
            address, 
            amount
        );
        
        console.log(JSON.stringify({
            tokenAddress,
            address,
            amount,
            network: network.name,
            holdsAmount: result
        }, null, 2));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    }
}

main();