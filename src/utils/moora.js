/**
 * Multi-Objective Optimization on the basis of Ratio Analysis (MOORA) Algorithm
 * 
 * Steps:
 * 1. Create Decision Matrix
 * 2. Calculate Normalized Decision Matrix (R):
 *    R_ij = x_ij / sqrt(sum_k(x_kj^2))
 * 3. Calculate Weighted Normalized Matrix (V):
 *    V_ij = R_ij * w_j
 * 4. Calculate Optimization Value (y_i):
 *    y_i = sum_benefit(V_ij) - sum_cost(V_ij)
 * 5. Rank alternatives based on y_i (descending)
 */

export function calculateMOORA(alternatives, criteria, scores) {
  if (!alternatives.length || !criteria.length) {
    return { matrix: [], normalized: [], weighted: [], results: [] };
  }

  // Map scores for easy lookup
  const scoreMap = {};
  scores.forEach(s => {
    scoreMap[`${s.alternative_id}-${s.criteria_id}`] = Number(s.value) || 0;
  });

  // Step 1: Decision Matrix
  const matrix = alternatives.map(alt => {
    const row = { alternativeId: alt.id, name: alt.name };
    criteria.forEach(crit => {
      row[crit.id] = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
    });
    return row;
  });

  // Step 2: Normalization divisor for each criterion (sqrt of sum of squares, same as TOPSIS)
  const divisors = {};
  criteria.forEach(crit => {
    const sumSquares = alternatives.reduce((sum, alt) => {
      const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
      return sum + (val * val);
    }, 0);
    divisors[crit.id] = Math.sqrt(sumSquares) || 1; // Avoid division by zero
  });

  // Calculate Normalized (R) and Weighted Normalized (V) matrices
  const normalized = [];
  const weighted = [];

  alternatives.forEach(alt => {
    const normRow = { alternativeId: alt.id, name: alt.name };
    const weightRow = { alternativeId: alt.id, name: alt.name };

    criteria.forEach(crit => {
      const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
      const w = Number(crit.weight) || 0;
      
      const r = val / divisors[crit.id];
      const v = r * w;

      normRow[crit.id] = Number(r.toFixed(4));
      weightRow[crit.id] = Number(v.toFixed(4));
    });

    normalized.push(normRow);
    weighted.push(weightRow);
  });

  // Step 4: Calculate Optimization Value (y_i)
  const results = alternatives.map(alt => {
    const wRow = weighted.find(row => row.alternativeId === alt.id);
    
    let sumBenefit = 0;
    let sumCost = 0;

    criteria.forEach(crit => {
      const v = wRow[crit.id] || 0;
      if (crit.type === 'benefit') {
        sumBenefit += v;
      } else {
        sumCost += v;
      }
    });

    const y = sumBenefit - sumCost;

    return {
      alternativeId: alt.id,
      name: alt.name,
      score: Number(y.toFixed(4)), // y_i score
      benefitSum: Number(sumBenefit.toFixed(4)),
      costSum: Number(sumCost.toFixed(4))
    };
  });

  // Step 5: Rank results descending
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    matrix,
    normalized,
    weighted,
    results
  };
}
