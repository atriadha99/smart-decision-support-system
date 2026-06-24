/**
 * TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) Algorithm
 * 
 * Steps:
 * 1. Create Decision Matrix
 * 2. Calculate Normalized Decision Matrix (R):
 *    R_ij = x_ij / sqrt(sum_k(x_kj^2))
 * 3. Calculate Weighted Normalized Matrix (V):
 *    V_ij = R_ij * w_j
 * 4. Determine Positive Ideal Solution (A+) and Negative Ideal Solution (A-):
 *    - A+_j = max(V_ij) for Benefit, min(V_ij) for Cost
 *    - A-_j = min(V_ij) for Benefit, max(V_ij) for Cost
 * 5. Calculate Distance to Positive Ideal (D+) and Negative Ideal (D-):
 *    - D+_i = sqrt(sum_j(V_ij - A+_j)^2)
 *    - D-_i = sqrt(sum_j(V_ij - A-_j)^2)
 * 6. Calculate Preference Value (C_i):
 *    C_i = D-_i / (D+_i + D-_i)
 * 7. Rank alternatives based on C_i (descending)
 */

export function calculateTOPSIS(alternatives, criteria, scores) {
  if (!alternatives.length || !criteria.length) {
    return {
      matrix: [],
      normalized: [],
      weighted: [],
      idealPositive: {},
      idealNegative: {},
      distances: [],
      results: []
    };
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

  // Step 2: Normalization divisor for each criterion (sqrt of sum of squares)
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

  // Step 4: Determine Positive (A+) and Negative (A-) Ideal Solutions
  const idealPositive = {};
  const idealNegative = {};

  criteria.forEach(crit => {
    const values = weighted.map(row => row[crit.id]);
    
    if (crit.type === 'benefit') {
      idealPositive[crit.id] = Number(Math.max(...values).toFixed(4));
      idealNegative[crit.id] = Number(Math.min(...values).toFixed(4));
    } else {
      // cost
      idealPositive[crit.id] = Number(Math.min(...values).toFixed(4));
      idealNegative[crit.id] = Number(Math.max(...values).toFixed(4));
    }
  });

  // Step 5 & 6: Calculate distances and preference values
  const distances = [];
  const results = alternatives.map(alt => {
    const wRow = weighted.find(row => row.alternativeId === alt.id);
    
    let sumPositiveSquare = 0;
    let sumNegativeSquare = 0;

    criteria.forEach(crit => {
      const v = wRow[crit.id];
      const aPlus = idealPositive[crit.id];
      const aMinus = idealNegative[crit.id];

      sumPositiveSquare += Math.pow(v - aPlus, 2);
      sumNegativeSquare += Math.pow(v - aMinus, 2);
    });

    const dPlus = Math.sqrt(sumPositiveSquare);
    const dMinus = Math.sqrt(sumNegativeSquare);
    
    // Relative Closeness C_i = dMinus / (dPlus + dMinus)
    const divisor = dPlus + dMinus;
    const preference = divisor === 0 ? 0 : dMinus / divisor;

    distances.push({
      alternativeId: alt.id,
      name: alt.name,
      dPlus: Number(dPlus.toFixed(4)),
      dMinus: Number(dMinus.toFixed(4)),
      closeness: Number(preference.toFixed(4))
    });

    return {
      alternativeId: alt.id,
      name: alt.name,
      score: Number(preference.toFixed(4)),
      dPlus: Number(dPlus.toFixed(4)),
      dMinus: Number(dMinus.toFixed(4))
    };
  });

  // Step 7: Rank results descending
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    matrix,
    normalized,
    weighted,
    idealPositive,
    idealNegative,
    distances,
    results
  };
}
