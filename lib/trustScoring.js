/**
 * Trust Scoring Module
 * Calculates trust scores based on wallet activity and balance
 */

/**
 * Calculate trust score based on transaction count and balance
 * @param {number} txCount - Transaction count (nonce)
 * @param {number} balance - Balance in PHAROS (ether)
 * @returns {Object} - Object containing trustScore and riskClassification
 */
function calculateTrustScore(txCount, balance) {
  let trustScore = 0;

  // Metric A: Transaction Activity (Max 60 points)
  if (txCount > 50) {
    trustScore += 60;
  } else if (txCount > 20) {
    trustScore += 45;
  } else if (txCount > 5) {
    trustScore += 30;
  } else if (txCount > 0) {
    trustScore += 15;
  }

  // Metric B: Financial Skin in the Game / Balance (Max 40 points)
  if (balance >= 5.0) {
    trustScore += 40;
  } else if (balance >= 1.0) {
    trustScore += 30;
  } else if (balance >= 0.1) {
    trustScore += 20;
  } else if (balance > 0.001) {
    trustScore += 10;
  }

  // Penalize completely empty, dead-end burner accounts
  if (txCount === 0 && balance < 0.001) {
    trustScore = 5; // Absolute baseline for an empty wallet
  }

  // Determine Risk Classification
  let riskClassification = 'MEDIUM RISK';
  if (trustScore >= 70) {
    riskClassification = 'TRUSTED';
  } else if (trustScore < 35) {
    riskClassification = 'HIGH RISK';
  }

  return { trustScore, riskClassification };
}

module.exports = { calculateTrustScore };