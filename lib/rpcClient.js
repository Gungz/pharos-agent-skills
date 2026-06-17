/**
 * RPC Client for Pharos Network
 * Handles JSON-RPC calls to Pharos mainnet and testnet
 */

class RPCClient {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.rpcUrl - The RPC endpoint URL
   * @param {number} config.timeout - Request timeout in milliseconds (optional)
   */
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl || process.env.PHAROS_RPC_URL || 'https://atlantic.dplabs-internal.com';
    this.timeout = config.timeout || 10000; // 10 seconds default
  }

  /**
   * Execute a standard EVM JSON-RPC request
   * @param {string} method - The RPC method to call
   * @param {Array} params - Parameters for the RPC call
   * @returns {Promise<any>} - The result from the RPC call
   * @throws {Error} - If the RPC call fails
   */
  async call(method, params = []) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: method,
          params: params
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.result;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`RPC Timeout after ${this.timeout}ms`);
      }
      throw new Error(`RPC Error (${method}): ${err.message}`);
    }
  }
}

module.exports = RPCClient;