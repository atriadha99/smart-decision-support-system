/**
 * Profile Matching Algorithm
 * 
 * Steps:
 * 1. Calculate GAP for each alternative and criteria:
 *    GAP = Alternative_Value - Target_Value
 * 2. Map GAP to Weight based on table:
 *    GAP =  0 -> Weight = 5     (No difference)
 *    GAP =  1 -> Weight = 4.5   (Exceeds by 1 level)
 *    GAP = -1 -> Weight = 4     (1 level below target)
 *    GAP =  2 -> Weight = 3.5   (Exceeds by 2 levels)
 *    GAP = -2 -> Weight = 3     (2 levels below target)
 *    GAP =  3 -> Weight = 2.5   (Exceeds by 3 levels)
 *    GAP = -3 -> Weight = 2     (3 levels below target)
 *    GAP =  4 -> Weight = 1.5   (Exceeds by 4 levels)
 *    GAP = -4 -> Weight = 1     (4 levels below target)
 *    Any other positive GAP -> Weight = 5 - (GAP * 0.5) (capped at 1)
 *    Any other negative GAP -> Weight = 5 - (abs(GAP) * 0.5) (capped at 1)
 * 3. Calculate Core Factor (CF) Average and Secondary Factor (SF) Average:
 *    CF = Sum(GAP_Weight_Core) / Count(Core)
 *    SF = Sum(GAP_Weight_Secondary) / Count(Secondary)
 * 4. Calculate Total Score:
 *    Total = 0.6 * CF + 0.4 * SF
 * 5. Rank alternatives based on Total (descending)
 */

export function mapGapToWeight(gap) {
  // Map integer gaps to standard profile matching weights
  const roundedGap = Math.round(gap * 2) / 2; // Allow half steps if any
  
  if (roundedGap === 0) return 5;
  if (roundedGap === 0.5) return 4.8;
  if (roundedGap === -0.5) return 4.5;
  if (roundedGap === 1) return 4.5;
  if (roundedGap === -1) return 4;
  if (roundedGap === 2) return 3.5;
  if (roundedGap === -2) return 3;
  if (roundedGap === 3) return 2.5;
  if (roundedGap === -3) return 2;
  if (roundedGap === 4) return 1.5;
  if (roundedGap === -4) return 1;
  
  // Fallback formula capped between 1 and 5
  const penalty = Math.abs(roundedGap) * 0.5;
  const weight = roundedGap > 0 ? 5 - penalty + 0.5 : 5 - penalty; // Slight edge for positive gap
  return Math.max(1, Math.min(5, weight));
}

export function calculateProfileMatching(alternatives, criteria, scores) {
  if (!alternatives.length || !criteria.length) {
    return { gaps: [], gapWeights: [], coreSecondary: [], results: [] };
  }

  // Map scores for easy lookup
  const scoreMap = {};
  scores.forEach(s => {
    scoreMap[`${s.alternative_id}-${s.criteria_id}`] = Number(s.value) || 0;
  });

  const gaps = [];
  const gapWeights = [];

  alternatives.forEach(alt => {
    const gapRow = { alternativeId: alt.id, name: alt.name };
    const weightRow = { alternativeId: alt.id, name: alt.name };

    criteria.forEach(crit => {
      const val = scoreMap[`${alt.id}-${crit.id}`] ?? 0;
      const target = Number(crit.target_value) ?? 3.0; // Default target
      
      const gap = val - target;
      const weight = mapGapToWeight(gap);

      gapRow[crit.id] = Number(gap.toFixed(2));
      weightRow[crit.id] = weight;
    });

    gaps.push(gapRow);
    gapWeights.push(weightRow);
  });

  // Calculate CF and SF averages
  const coreCriteria = criteria.filter(c => c.is_core_factor === true || c.is_core_factor === 'true' || c.is_core_factor === 1);
  const secondaryCriteria = criteria.filter(c => !coreCriteria.includes(c));

  const coreSecondary = alternatives.map(alt => {
    const wRow = gapWeights.find(row => row.alternativeId === alt.id);
    
    let sumCF = 0;
    let sumSF = 0;

    coreCriteria.forEach(c => {
      sumCF += wRow[c.id] || 0;
    });

    secondaryCriteria.forEach(c => {
      sumSF += wRow[c.id] || 0;
    });

    const cfAvg = coreCriteria.length ? sumCF / coreCriteria.length : 0;
    const sfAvg = secondaryCriteria.length ? sumSF / secondaryCriteria.length : 0;

    // Default weight: 60% Core, 40% Secondary
    let total = 0;
    if (coreCriteria.length && secondaryCriteria.length) {
      total = 0.6 * cfAvg + 0.4 * sfAvg;
    } else if (coreCriteria.length) {
      total = cfAvg;
    } else if (secondaryCriteria.length) {
      total = sfAvg;
    }

    return {
      alternativeId: alt.id,
      name: alt.name,
      cf: Number(cfAvg.toFixed(4)),
      sf: Number(sfAvg.toFixed(4)),
      score: Number(total.toFixed(4))
    };
  });

  // Ranking
  const results = coreSecondary.map(cs => ({
    alternativeId: cs.alternativeId,
    name: cs.name,
    score: cs.score,
    cf: cs.cf,
    sf: cs.sf
  }));

  results.sort((a, b) => b.score - a.score);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    gaps,
    gapWeights,
    coreSecondary,
    results
  };
}
