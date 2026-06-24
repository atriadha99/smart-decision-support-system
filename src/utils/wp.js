/**
 * Weighted Product (WP) Algorithm
 * 
 * Steps:
 * 1. Normalize Weights (so sum of weights = 1)
 * 2. Calculate S Vector for each alternative:
 *    S_i = product( x_ij ^ w_j )
 *    where:
 *      w_j is positive for benefit criteria
 *      w_j is negative for cost criteria
 * 3. Calculate V Vector for each alternative:
 *    V_i = S_i / sum(S_k)
 * 4. Rank alternatives based on V_i (descending)
 */

export function calculateWP(alternatives, criteria, scores) {
  if (!alternatives.length || !criteria.length) {
    return { weights: {}, sVector: [], vVector: [], results: [] };
  }

  // Map scores for easy lookup
  const scoreMap = {};
  scores.forEach(s => {
    scoreMap[`${s.alternative_id}-${s.criteria_id}`] = Number(s.value) || 0;
  });

  // Calculate sum of weights for normalization
  const totalWeight = criteria.reduce((sum, crit) => sum + (Number(crit.weight) || 0), 0) || 1;

  // Normalized weights
  const normalizedWeights = {};
  criteria.forEach(crit => {
    let w = (Number(crit.weight) || 0) / totalWeight;
    // For cost, weight is negative
    if (crit.type === 'cost') {
      w = -w;
    }
    normalizedWeights[crit.id] = w;
  });

  // Step 2: Calculate S Vector
  const sVector = alternatives.map(alt => {
    let sValue = 1;
    const details = {};

    criteria.forEach(crit => {
      // Avoid 0 to prevent division by zero for cost criteria (negative exponent)
      const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
      const safeVal = val === 0 ? 0.0001 : val;
      const w = normalizedWeights[crit.id];
      const factor = Math.pow(safeVal, w);
      sValue *= factor;
      details[crit.id] = Number(factor.toFixed(4));
    });

    return {
      alternativeId: alt.id,
      name: alt.name,
      value: sValue,
      details
    };
  });

  // Calculate sum of S Vector
  const sumS = sVector.reduce((sum, s) => sum + s.value, 0) || 1;

  // Step 3: Calculate V Vector
  const vVector = sVector.map(s => {
    const vValue = s.value / sumS;
    return {
      alternativeId: s.alternativeId,
      name: s.name,
      value: Number(vValue.toFixed(6)),
      sValue: Number(s.value.toFixed(6)),
      details: s.details
    };
  });

  // Step 4: Ranking
  const results = vVector.map(v => ({
    alternativeId: v.alternativeId,
    name: v.name,
    score: v.value, // V score
    sScore: v.sValue // S score
  }));

  // Sort descending
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    weights: normalizedWeights,
    sVector: sVector.map(s => ({ ...s, value: Number(s.value.toFixed(6)) })),
    vVector,
    results
  };
}
