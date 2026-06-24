/**
 * SMART (Simple Multi-Attribute Rating Technique) Algorithm
 * 
 * Steps:
 * 1. Normalize Weights (so sum of weights = 1)
 * 2. Find Min and Max values for each criterion across all alternatives
 * 3. Calculate Utility Value (U) for each cell:
 *    - Benefit: U_ij = 100 * (x_ij - min_j) / (max_j - min_j)
 *    - Cost: U_ij = 100 * (max_j - x_ij) / (max_j - min_j)
 *    Note: If max_j === min_j, Utility is set to 100
 * 4. Calculate Final Value (V) for each alternative:
 *    V_i = sum_j (w_j * U_ij)
 * 5. Rank alternatives based on V_i (descending)
 */

export function calculateSMART(alternatives, criteria, scores) {
  if (!alternatives.length || !criteria.length) {
    return { weights: {}, utility: [], results: [] };
  }

  // Map scores for easy lookup
  const scoreMap = {};
  scores.forEach(s => {
    scoreMap[`${s.alternative_id}-${s.criteria_id}`] = Number(s.value) || 0;
  });

  // Step 1: Weight Normalization
  const totalWeight = criteria.reduce((sum, crit) => sum + (Number(crit.weight) || 0), 0) || 1;
  const normalizedWeights = {};
  criteria.forEach(crit => {
    normalizedWeights[crit.id] = (Number(crit.weight) || 0) / totalWeight;
  });

  // Step 2: Find Min and Max values for each criterion
  const minMax = {};
  criteria.forEach(crit => {
    const values = alternatives.map(alt => scoreMap[`${alt.id}-${crit.id}`] ?? 0);
    minMax[crit.id] = {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0
    };
  });

  // Step 3: Calculate Utility Matrix
  const utility = [];
  alternatives.forEach(alt => {
    const utilityRow = { alternativeId: alt.id, name: alt.name };

    criteria.forEach(crit => {
      const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
      const { min, max } = minMax[crit.id];
      let u = 100;

      if (max !== min) {
        if (crit.type === 'benefit') {
          u = 100 * (val - min) / (max - min);
        } else {
          // cost
          u = 100 * (max - val) / (max - min);
        }
      }

      utilityRow[crit.id] = Number(u.toFixed(4));
    });

    utility.push(utilityRow);
  });

  // Step 4: Calculate Final Value and Results
  const results = alternatives.map(alt => {
    const uRow = utility.find(row => row.alternativeId === alt.id);
    let finalScore = 0;

    criteria.forEach(crit => {
      const u = uRow[crit.id] || 0;
      const w = normalizedWeights[crit.id];
      finalScore += w * u;
    });

    return {
      alternativeId: alt.id,
      name: alt.name,
      score: Number(finalScore.toFixed(4))
    };
  });

  // Step 5: Rank results descending
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  // Map weights back to a readable object
  const readableWeights = {};
  criteria.forEach(crit => {
    readableWeights[crit.id] = Number(normalizedWeights[crit.id].toFixed(4));
  });

  return {
    weights: readableWeights,
    utility,
    results
  };
}
