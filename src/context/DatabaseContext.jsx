import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { dbClient } from '../db/client';

const DatabaseContext = createContext();

export function DatabaseProvider({ children }) {
  const [studies, setStudies] = useState([]);
  const [currentStudyId, setCurrentStudyId] = useState(() => {
    // Try to restore last active study from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sdss_active_study_id') || '';
    }
    return '';
  });
  
  const [criteria, setCriteria] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [scores, setScores] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Load all cases/studies
  const fetchStudies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dbClient.getStudies();
      setStudies(data);
      if (data.length > 0 && !currentStudyId) {
        setCurrentStudyId(data[0].id);
        localStorage.setItem('sdss_active_study_id', data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch studies", err);
    } finally {
      setLoading(false);
    }
  }, [currentStudyId]);

  // Load criteria, alternatives, scores, calculations for the active study
  const fetchStudyDetails = useCallback(async () => {
    if (!currentStudyId) {
      setCriteria([]);
      setAlternatives([]);
      setScores([]);
      setCalculations([]);
      return;
    }

    setDetailsLoading(true);
    try {
      const [critList, altList, scoreList, calcList] = await Promise.all([
        dbClient.getCriteria(currentStudyId),
        dbClient.getAlternatives(currentStudyId),
        dbClient.getScores(currentStudyId),
        dbClient.getCalculations(currentStudyId)
      ]);

      setCriteria(critList);
      setAlternatives(altList);
      setScores(scoreList);
      setCalculations(calcList);
    } catch (err) {
      console.error("Failed to fetch study details", err);
    } finally {
      setDetailsLoading(false);
    }
  }, [currentStudyId]);

  // Initial fetch of cases
  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  // Fetch details whenever selected study changes
  useEffect(() => {
    fetchStudyDetails();
    if (currentStudyId) {
      localStorage.setItem('sdss_active_study_id', currentStudyId);
    } else {
      localStorage.removeItem('sdss_active_study_id');
    }
  }, [currentStudyId, fetchStudyDetails]);

  // --- CRUD Actions ---

  // Study Case
  const addStudy = async (study) => {
    const newStudy = await dbClient.saveStudy(study);
    setStudies(prev => [newStudy, ...prev]);
    setCurrentStudyId(newStudy.id);
    return newStudy;
  };

  const updateStudy = async (study) => {
    const updated = await dbClient.saveStudy(study);
    setStudies(prev => prev.map(s => s.id === updated.id ? updated : s));
    return updated;
  };

  const deleteStudy = async (id) => {
    await dbClient.deleteStudy(id);
    setStudies(prev => prev.filter(s => s.id !== id));
    if (currentStudyId === id) {
      const remaining = studies.filter(s => s.id !== id);
      setCurrentStudyId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  // Criteria (Bulk update)
  const saveCriteria = async (criteriaList) => {
    if (!currentStudyId) return;
    const list = await dbClient.saveAllCriteria(currentStudyId, criteriaList);
    // Reload criteria and scores (since adding criteria auto-populates scores)
    const critList = await dbClient.getCriteria(currentStudyId);
    const scoreList = await dbClient.getScores(currentStudyId);
    setCriteria(critList);
    setScores(scoreList);
    return list;
  };

  const deleteCriterion = async (id) => {
    await dbClient.deleteCriterion(id);
    setCriteria(prev => prev.filter(c => c.id !== id));
    setScores(prev => prev.filter(s => s.criteria_id !== id));
  };

  // Alternatives
  const saveAlternative = async (alt) => {
    if (!currentStudyId) return;
    const saved = await dbClient.saveAlternative({ ...alt, study_id: currentStudyId });
    
    // Refresh alternatives & scores
    const altList = await dbClient.getAlternatives(currentStudyId);
    const scoreList = await dbClient.getScores(currentStudyId);
    setAlternatives(altList);
    setScores(scoreList);
    return saved;
  };

  const deleteAlternative = async (id) => {
    await dbClient.deleteAlternative(id);
    setAlternatives(prev => prev.filter(a => a.id !== id));
    setScores(prev => prev.filter(s => s.alternative_id !== id));
  };

  // Scores
  const saveScores = async (scoresList) => {
    await dbClient.saveScores(scoresList);
    const scoreList = await dbClient.getScores(currentStudyId);
    setScores(scoreList);
  };

  // Calculations (Save calculations log)
  const saveCalculationLog = async (method, result) => {
    if (!currentStudyId) return;
    const saved = await dbClient.saveCalculation(currentStudyId, method, result);
    setCalculations(prev => [saved, ...prev]);
    return saved;
  };

  // Get active case study object
  const activeStudy = studies.find(s => s.id === currentStudyId) || null;

  return (
    <DatabaseContext.Provider value={{
      studies,
      currentStudyId,
      setCurrentStudyId,
      activeStudy,
      criteria,
      alternatives,
      scores,
      calculations,
      loading,
      detailsLoading,
      refreshStudies: fetchStudies,
      refreshDetails: fetchStudyDetails,
      
      // Operations
      addStudy,
      updateStudy,
      deleteStudy,
      saveCriteria,
      deleteCriterion,
      saveAlternative,
      deleteAlternative,
      saveScores,
      saveCalculationLog
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
