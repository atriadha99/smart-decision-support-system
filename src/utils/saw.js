/**
 * Simple Additive Weighting (SAW) Algorithm
 * 
 * Steps:
 * 1. Create Decision Matrix
 * 2. Normalize Decision Matrix:
 *    - Benefit: R_ij = x_ij / max(x_j)
 *    - Cost: R_ij = min(x_j) / x_ij
 * 3. Calculate Weighted Matrix: V_ij = R_ij * w_j
 * 4. Sum Weighted values: preference_score_i = sum(V_ij)
 * 5. Rank alternatives based on preference score (descending)
 */

export function calculateSAW(alternatives, criteria, scores) {
  if (!alternatives.length || !criteria.length) {
    return { matrix: [], normalized: [], weighted: [], results: [] };
  }

  // Map scores for easy lookup: { [alternativeId-criteriaId]: value }
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

  // Find min and max for each criterion
  const minMax = {};
  criteria.forEach(crit => {
    const values = alternatives.map(alt => scoreMap[`${alt.id}-${crit.id}`] ?? 0);
    minMax[crit.id] = {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 1
    };
    // Avoid division by zero
    if (minMax[crit.id].max === 0) minMax[crit.id].max = 1;
    if (minMax[crit.id].min === 0) minMax[crit.id].min = 1;
  });

  // Step 2 & 3: Normalization and Weighting
  const normalized = [];
  const weighted = [];

  alternatives.forEach(alt => {
    const normRow = { alternativeId: alt.id, name: alt.name };
    const weightRow = { alternativeId: alt.id, name: alt.name };

    criteria.forEach(crit => {
      const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
      const w = Number(crit.weight) || 0;
      let r = 0;

      if (crit.type === 'benefit') {
        const maxVal = minMax[crit.id].max || 1;
        r = val / maxVal;
      } else {
        // cost
        const minVal = minMax[crit.id].min || 1;
        r = val === 0 ? 0 : minVal / val;
      }

      normRow[crit.id] = Number(r.toFixed(4));
      weightRow[crit.id] = Number((r * w).toFixed(4));
    });

    normalized.push(normRow);
    weighted.push(weightRow);
  });

  // Step 4 & 5: Preference & Ranking
  const results = alternatives.map(alt => {
    const wRow = weighted.find(r => r.alternativeId === alt.id);
    let score = 0;
    criteria.forEach(crit => {
      score += wRow[crit.id] || 0;
    });

    return {
      alternativeId: alt.id,
      name: alt.name,
      score: Number(score.toFixed(4)),
    };
  });

  // Sort results descending
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
