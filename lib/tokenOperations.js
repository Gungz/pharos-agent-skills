/**
 * Token Operations Module
 * Provides functions to check token transfers and balances
 */

const ERC20_ABI = [
  // BalanceOf
  "function balanceOf(address) view returns (uint256)",
  // Transfer event
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

/*
 * Check if an address has sent a specific amount of tokens to another address
 * @param {RPCClient} rpcClient - The RPC client instance
 * @param {string} tokenAddress - The ERC20 token contract address
 * @param {string} fromAddress - The sender address to check
 * @param {string} toAddress - The recipient address
 * @param {string} amount - The minimum amount that should have been sent (in token units, not wei)
 * @param {number} decimals - The token decimals (default 18)
 * @param {number} fromBlock - The starting block to check from (optional)
 * @returns {Promise<boolean>} - True if the amount has been sent, false otherwise
 */
/* async function hasSentTokenAmount(rpcClient, tokenAddress, fromAddress, toAddress, amount) {
  const currentBlockHex = await rpcClient.call('eth_blockNumber');
  const currentBlock = parseInt(currentBlockHex, 16);
  const decimals = await getTokenDecimals(rpcClient, tokenAddress);
  // Convert amount to wei equivalent
  const amountWei = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
  let requirement_met = false;
  
  // Get logs for Transfer events from this address to the target address
  try {
    if (tokenAddress.toLowerCase() === 'native') {
        const scanStart = Math.max(0, currentBlock - 100);
        let found = false;
        let foundAmount = 0;
        
        for (let i = currentBlock; i >= scanStart; i--) {
            const block = await rpcClient.call('eth_getBlockByNumber', ['0x' + i.toString(16), true]);
            if (!block || !block.transactions) continue;
            
            for (const tx of block.transactions) {
                if (tx.from.toLowerCase() === fromAddress.toLowerCase() && 
                    tx.to && tx.to.toLowerCase() === toAddress.toLowerCase() && 
                    tx.value !== '0x0') {
                    
                    const val = Number(BigInt(tx.value)) / (10 ** decimals);
                    if (val >= Number(amountWei)) {
                        found = true;
                        foundAmount = val;
                        requirement_met = true;
                        break;
                    }
                }
            }
            if (found) break;
        }
        console.log(JSON.stringify({ 
            type: 'native_transfer_check', token_decimals: decimals, blocks_scanned: 100, found, 
            amount_found: foundAmount, requirement_met: found 
        }, null, 2));
        
    } else {
        // ERC20 Transfer event (Topic 0: Transfer, Topic 1: From, Topic 2: To)
        const fromBlockHex = '0x' + Math.max(0, currentBlock - 5000).toString(16);
        const logs = await rpcClient.call('eth_getLogs', [{
            fromBlock: fromBlockHex,
            toBlock: 'latest',
            address: tokenAddress,
            topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x' + padAddress(fromAddress),
                '0x' + padAddress(toAddress)
            ]
        }]);
        
        
        let totalFound = 0;
        
        for (const log of logs) {
            const val = Number(BigInt(log.data)) / (10 ** decimals);
            totalFound += val;
            if (val >= Number(amountWei)) {
                requirement_met = true;
            }
        }
        console.log(JSON.stringify({ 
            type: 'erc20_transfer_check', token_decimals: decimals, blocks_scanned: 5000, 
            transfer_found: logs.length > 0, total_amount_transferred: totalFound, 
            requirement_met: requirement_met 
        }, null, 2));
    }
    return requirement_met;
  } catch (error) {
    throw new Error(`Failed to check token transfers: ${error.message}`);
  }
} */

/**
 * Check if an address holds a specific amount of tokens
 * @param {RPCClient} rpcClient - The RPC client instance
 * @param {string} tokenAddress - The ERC20 token contract address
 * @param {string} address - The address to check balance for
 * @param {string} amount - The minimum amount that should be held (in token units, not wei)
 * @param {number} decimals - The token decimals (default 18)
 * @returns {Promise<boolean>} - True if the address holds at least the amount, false otherwise
 */
async function holdsTokenAmount(rpcClient, tokenAddress, address, amount) {
  try {
    let balanceNum = 0;    
    const decimals = await getTokenDecimals(rpcClient, tokenAddress);
    //console.log(`Checking balance for ${address} on token ${tokenAddress} with decimals ${decimals}`);
    if (tokenAddress.toLowerCase() === 'native') {
        const hex = await rpcClient.call('eth_getBalance', [address, 'latest']);
        balanceNum = Number(BigInt(hex)) / Math.pow(10, decimals);
    } else {
        // Standard ERC-20 balanceOf(address) signature: 0x70a08231
        const data = '0x70a08231' + padAddress(address);
        const hex = await rpcClient.call('eth_call', [{ to: tokenAddress, data }, 'latest']);
        balanceNum = hex === '0x' ? 0 : Number(BigInt(hex)) / Math.pow(10, decimals);
    }
    
    const meetsReq = balanceNum >= Number(amount);
    console.log(JSON.stringify({ 
        action: 'balance_check', address, tokenAddress, required_amount: amount, 
        actual_balance: balanceNum, requirement_met: meetsReq 
    }, null, 2));
    return meetsReq;
  } catch (error) {
    throw new Error(`Failed to check token balance: ${error.message}`);
  }
}

function padAddress(addr) {
    return addr.toLowerCase().replace('0x', '').padStart(64, '0');
}

/**
 * Dynamically queries the token contract for its decimal configuration.
 * Defaults to 18 if the token is 'native' or if the contract call fails.
 */
async function getTokenDecimals(rpcClient, token) {
    if (token.toLowerCase() === 'native') return 18;
    try {
        // ERC-20 decimals() method signature is 0x313ce567
        const hex = await rpcClient.call('eth_call', [{ to: token, data: '0x313ce567' }, 'latest']);
        if (hex === '0x' || !hex) return 18; 
        return parseInt(hex, 16);
    } catch (e) {
        // Fallback to 18 if the contract doesn't explicitly implement decimals or errors out
        return 18;
    }
}

module.exports = {
  holdsTokenAmount
};