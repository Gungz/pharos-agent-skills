#!/usr/bin/env node

/**
 * Example: Check if a wallet has sent a specific amount of tokens
 * Usage: node examples/checkTokenTransfer.js <token_address> <from_address> <to_address> <amount> [decimals] [network]
 */

/*const { hasSentTokenAmount } = require('../lib/tokenOperations');
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
const fromAddress = process.argv[3];
const toAddress = process.argv[4];
const amount = process.argv[5];
const networkArg = process.argv[6] || 'testnet';
const network = NETWORKS[networkArg] || NETWORKS.testnet;

// Validate inputs
if (!tokenAddress || !fromAddress || !toAddress || !amount) {
    console.error(JSON.stringify({
        error: "Missing required arguments. Usage: node checkTokenTransfer.js <token_address> <from_address> <to_address> <amount> [network]"
    }));
    process.exit(1);
}

async function main() {
    try {
        const rpcClient = new RPCClient({ rpcUrl: network.rpcUrl });
        
        const result = await hasSentTokenAmount(
            rpcClient, 
            tokenAddress, 
            fromAddress, 
            toAddress, 
            amount
        );
        
        console.log(JSON.stringify({
            tokenAddress,
            fromAddress,
            toAddress,
            amount,
            network: network.name,
            hasSentAmount: result
        }, null, 2));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    }
}

main();*/