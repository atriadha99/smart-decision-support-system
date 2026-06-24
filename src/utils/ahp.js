/**
 * Analytic Hierarchy Process (AHP) Algorithm
 * 
 * Steps for Criteria Weight Calculation:
 * 1. Build Criteria Pairwise Comparison Matrix (n x n)
 * 2. Sum each column
 * 3. Normalize matrix (divide each cell by its column sum)
 * 4. Calculate Priority Vector (eigenvector) by averaging the rows of the normalized matrix
 * 5. Calculate Consistency:
 *    - Lambda Max = sum_j (Column_Sum_j * Weight_j)
 *    - Consistency Index (CI) = (Lambda_Max - n) / (n - 1)
 *    - Consistency Ratio (CR) = CI / RI
 *    - RI is Random Index from Saaty's table
 *    - Matrix is consistent if CR < 0.1
 * 
 * Steps for Alternative Synthesis:
 * 1. Normalize alternative scores per criterion:
 *    - Benefit: R_ij = x_ij / sum_k(x_kj)
 *    - Cost: R_ij = (1 / x_ij) / sum_k(1 / x_kj)
 * 2. Calculate Final Score:
 *    V_i = sum_j (w_j * R_ij)
 * 3. Rank alternatives descending
 */

// Saaty's Random Index (RI) table
const RI_TABLE = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49
};

export function calculateAHPWeights(comparisonMatrix, criteriaIds) {
  const n = criteriaIds.length;
  if (n === 0) return { weights: {}, cr: 0, ci: 0, isConsistent: true, lambdaMax: 0 };

  // 1. Column sums
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += comparisonMatrix[i][j];
    }
  }

  // 2. Normalize and compute row averages (Priority Vector / weights)
  const weights = Array(n).fill(0);
  const normalizedMatrix = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      const normVal = colSums[j] === 0 ? 0 : comparisonMatrix[i][j] / colSums[j];
      normalizedMatrix[i][j] = normVal;
      rowSum += normVal;
    }
    weights[i] = rowSum / n;
  }

  // 3. Consistency Index (CI) and Ratio (CR)
  let lambdaMax = 0;
  for (let j = 0; j < n; j++) {
    lambdaMax += colSums[j] * weights[j];
  }

  let ci = 0;
  if (n > 1) {
    ci = (lambdaMax - n) / (n - 1);
  }

  const ri = RI_TABLE[n] || 1.49;
  const cr = ri === 0 ? 0 : ci / ri;
  const isConsistent = cr < 0.1;

  // Map weights back to criteria IDs
  const weightsMap = {};
  criteriaIds.forEach((id, idx) => {
    weightsMap[id] = Number(weights[idx].toFixed(4));
  });

  return {
    weights: weightsMap,
    normalizedMatrix,
    lambdaMax: Number(lambdaMax.toFixed(4)),
    ci: Number(ci.toFixed(4)),
    cr: Number(cr.toFixed(4)),
    isConsistent
  };
}

export function calculateAHP(alternatives, criteria, scores, customWeights = null) {
  if (!alternatives.length || !criteria.length) {
    return { normalized: [], weighted: [], results: [] };
  }

  // Map scores for easy lookup
  const scoreMap = {};
  scores.forEach(s => {
    scoreMap[`${s.alternative_id}-${s.criteria_id}`] = Number(s.value) || 0;
  });

  // Determine criteria weights to use (either derived from AHP or equal fallback)
  const weights = {};
  criteria.forEach(crit => {
    if (customWeights && customWeights[crit.id] !== undefined) {
      weights[crit.id] = customWeights[crit.id];
    } else {
      weights[crit.id] = Number(crit.weight) || (1 / criteria.length);
    }
  });

  // Calculate sum of scores for normal synthesis (AHP alternative normalization)
  const criterionSums = {};
  criteria.forEach(crit => {
    if (crit.type === 'benefit') {
      const sum = alternatives.reduce((acc, alt) => acc + (scoreMap[`${alt.id}-${crit.id}`] ?? 0), 0);
      criterionSums[crit.id] = sum || 1; // Avoid division by zero
    } else {
      // cost: reciprocal sum
      const sum = alternatives.reduce((acc, alt) => {
        const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
        return acc + (val === 0 ? 0 : 1 / val);
      }, 0);
      criterionSums[crit.id] = sum || 1;
    }
  });

  // Calculate normalized (R) and weighted normalized (V) matrices for alternatives
  const normalized = [];
  const weighted = [];

  alternatives.forEach(alt => {
    const normRow = { alternativeId: alt.id, name: alt.name };
    const weightRow = { alternativeId: alt.id, name: alt.name };

    criteria.forEach(crit => {
      const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
      const w = weights[crit.id];
      let r = 0;

      if (crit.type === 'benefit') {
        r = val / criterionSums[crit.id];
      } else {
        // cost
        r = val === 0 ? 0 : (1 / val) / criterionSums[crit.id];
      }

      normRow[crit.id] = Number(r.toFixed(4));
      weightRow[crit.id] = Number((r * w).toFixed(4));
    });

    normalized.push(normRow);
    weighted.push(weightRow);
  });

  // Calculate final score
  const results = alternatives.map(alt => {
    const wRow = weighted.find(row => row.alternativeId === alt.id);
    let score = 0;

    criteria.forEach(crit => {
      score += wRow[crit.id] || 0;
    });

    return {
      alternativeId: alt.id,
      name: alt.name,
      score: Number(score.toFixed(4))
    };
  });

  // Rank results descending
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    normalized,
    weighted,
    results,
    weightsUsed: weights
  };
}
