/**
 * Database Client - Dual Adapter Pattern (Local Storage & Neon PostgreSQL)
 * 
 * Auto-detects if Neon connection string is present:
 * - If VITE_NEON_DATABASE_URL is set, it routes all queries to Neon PostgreSQL via raw SQL.
 * - Otherwise, it falls back to Local Storage mode so the app is instantly usable.
 */

import { sql } from './neonClient';

const DB_TYPE = import.meta.env.VITE_NEON_DATABASE_URL && 
               !import.meta.env.VITE_NEON_DATABASE_URL.includes('placeholder') 
               ? 'neon' : 'local';

console.log(`[SDSS DB ADAPTER] Active database mode: "${DB_TYPE.toUpperCase()}"`);

// ==========================================
// SEED DATA FOR LOCAL STORAGE
// ==========================================
const DEFAULT_STUDIES = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Pemilihan Laptop Terbaik',
    description: 'Rekomendasi laptop untuk kebutuhan software engineering dan produktivitas harian dengan kriteria harga, RAM, storage, dan performa processor.',
    created_at: new Date('2026-06-24T00:00:00Z').toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Pemilihan Karyawan Terbaik',
    description: 'Evaluasi performa tahunan karyawan untuk menentukan penerima penghargaan karyawan terbaik berdasarkan kedisiplinan, produktivitas, kerjasama, dan perilaku.',
    created_at: new Date('2026-06-24T00:00:00Z').toISOString()
  }
];

const DEFAULT_CRITERIA = [
  // Laptop Criteria
  { id: 'c1111111-1111-1111-1111-111111111111', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'Harga', weight: 0.3, type: 'cost', target_value: 3, is_core_factor: false },
  { id: 'c1111111-2222-2222-2222-222222222222', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'RAM', weight: 0.2, type: 'benefit', target_value: 4, is_core_factor: true },
  { id: 'c1111111-3333-3333-3333-333333333333', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'Storage', weight: 0.2, type: 'benefit', target_value: 4, is_core_factor: false },
  { id: 'c1111111-4444-4444-4444-444444444444', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'Processor', weight: 0.3, type: 'benefit', target_value: 5, is_core_factor: true },
  
  // Employee Criteria
  { id: 'c2222222-1111-1111-1111-111111111111', study_id: 'b2222222-2222-2222-2222-222222222222', name: 'Kedisiplinan', weight: 0.25, type: 'benefit', target_value: 4, is_core_factor: true },
  { id: 'c2222222-2222-2222-2222-222222222222', study_id: 'b2222222-2222-2222-2222-222222222222', name: 'Produktivitas', weight: 0.3, type: 'benefit', target_value: 5, is_core_factor: true },
  { id: 'c2222222-3333-3333-3333-333333333333', study_id: 'b2222222-2222-2222-2222-222222222222', name: 'Kerjasama', weight: 0.25, type: 'benefit', target_value: 4, is_core_factor: false },
  { id: 'c2222222-4444-4444-4444-444444444444', study_id: 'b2222222-2222-2222-2222-222222222222', name: 'Sikap / Perilaku', weight: 0.2, type: 'benefit', target_value: 4, is_core_factor: false }
];

const DEFAULT_ALTERNATIVES = [
  // Laptop Alternatives
  { id: 'a2111111-1111-1111-1111-111111111111', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'MacBook Air M2', description: 'Apple M2 8-Core, 8GB RAM, 256GB SSD, 13.6 inch Liquid Retina. Sangat tipis, baterai tahan lama.', category: 'Apple' },
  { id: 'a2111111-2222-2222-2222-222222222222', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'Lenovo ThinkPad X1 Carbon', description: 'Intel Core i7-1260P, 16GB RAM, 512GB SSD, 14 inch WUXGA. Durabilitas militer, keyboard terbaik.', category: 'Lenovo' },
  { id: 'a2111111-3333-3333-3333-333333333333', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'Dell XPS 13 Plus', description: 'Intel Core i7-1280P, 16GB RAM, 1TB SSD, 13.4 inch UHD+ Touch. Desain futuristik bezel-less.', category: 'Dell' },
  { id: 'a2111111-4444-4444-4444-444444444444', study_id: 'a1111111-1111-1111-1111-111111111111', name: 'ASUS Zenbook 14 OLED', description: 'AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD, 14 inch 2.8K OLED. Layar berkualitas tinggi, value for money.', category: 'ASUS' },
  
  // Employee Alternatives
  { id: 'a2222222-1111-1111-1111-111111111111', study_id: 'b2222222-2222-2222-2222-222222222222', name: 'Budi Santoso', description: 'Staff IT Support - Rajin, selalu tepat waktu, namun kurang aktif di forum kerjasama tim.', category: 'IT Support' },
  { id: 'a2222222-2222-2222-2222-222222222222', study_id: 'b2222222-2222-2222-2222-222222222222', name: 'Ani Wijaya', description: 'Senior Developer - Produktivitas sangat tinggi, sering memimpin tim, terkadang terlambat datang.', category: 'Engineering' },
  { id: 'a2222222-3333-3333-3333-333333333333', study_id: 'b2222222-2222-2222-2222-222222222222', name: 'Citra Lestari', description: 'Quality Assurance - Komunikatif, kerjasama tim sangat baik, output pekerjaan stabil.', category: 'QA' }
];

const DEFAULT_SCORES = [
  // Laptop scores
  { id: 's1', alternative_id: 'a2111111-1111-1111-1111-111111111111', criteria_id: 'c1111111-1111-1111-1111-111111111111', value: 2 },
  { id: 's2', alternative_id: 'a2111111-1111-1111-1111-111111111111', criteria_id: 'c1111111-2222-2222-2222-222222222222', value: 2 },
  { id: 's3', alternative_id: 'a2111111-1111-1111-1111-111111111111', criteria_id: 'c1111111-3333-3333-3333-333333333333', value: 2 },
  { id: 's4', alternative_id: 'a2111111-1111-1111-1111-111111111111', criteria_id: 'c1111111-4444-4444-4444-444444444444', value: 4 },

  { id: 's5', alternative_id: 'a2111111-2222-2222-2222-222222222222', criteria_id: 'c1111111-1111-1111-1111-111111111111', value: 3 },
  { id: 's6', alternative_id: 'a2111111-2222-2222-2222-222222222222', criteria_id: 'c1111111-2222-2222-2222-222222222222', value: 4 },
  { id: 's7', alternative_id: 'a2111111-2222-2222-2222-222222222222', criteria_id: 'c1111111-3333-3333-3333-333333333333', value: 3 },
  { id: 's8', alternative_id: 'a2111111-2222-2222-2222-222222222222', criteria_id: 'c1111111-4444-4444-4444-444444444444', value: 4 },

  { id: 's9', alternative_id: 'a2111111-3333-3333-3333-333333333333', criteria_id: 'c1111111-1111-1111-1111-111111111111', value: 1 },
  { id: 's10', alternative_id: 'a2111111-3333-3333-3333-333333333333', criteria_id: 'c1111111-2222-2222-2222-222222222222', value: 4 },
  { id: 's11', alternative_id: 'a2111111-3333-3333-3333-333333333333', criteria_id: 'c1111111-3333-3333-3333-333333333333', value: 4 },
  { id: 's12', alternative_id: 'a2111111-3333-3333-3333-333333333333', criteria_id: 'c1111111-4444-4444-4444-444444444444', value: 5 },

  { id: 's13', alternative_id: 'a2111111-4444-4444-4444-444444444444', criteria_id: 'c1111111-1111-1111-1111-111111111111', value: 4 },
  { id: 's14', alternative_id: 'a2111111-4444-4444-4444-444444444444', criteria_id: 'c1111111-2222-2222-2222-222222222222', value: 4 },
  { id: 's15', alternative_id: 'a2111111-4444-4444-4444-444444444444', criteria_id: 'c1111111-3333-3333-3333-333333333333', value: 3 },
  { id: 's16', alternative_id: 'a2111111-4444-4444-4444-444444444444', criteria_id: 'c1111111-4444-4444-4444-444444444444', value: 3 },

  // Employee scores
  { id: 's17', alternative_id: 'a2222222-1111-1111-1111-111111111111', criteria_id: 'c2222222-1111-1111-1111-111111111111', value: 5 },
  { id: 's18', alternative_id: 'a2222222-1111-1111-1111-111111111111', criteria_id: 'c2222222-2222-2222-2222-222222222222', value: 3 },
  { id: 's19', alternative_id: 'a2222222-1111-1111-1111-111111111111', criteria_id: 'c2222222-3333-3333-3333-333333333333', value: 2 },
  { id: 's20', alternative_id: 'a2222222-1111-1111-1111-111111111111', criteria_id: 'c2222222-4444-4444-4444-444444444444', value: 4 },

  { id: 's21', alternative_id: 'a2222222-2222-2222-2222-222222222222', criteria_id: 'c2222222-1111-1111-1111-111111111111', value: 3 },
  { id: 's22', alternative_id: 'a2222222-2222-2222-2222-222222222222', criteria_id: 'c2222222-2222-2222-2222-222222222222', value: 5 },
  { id: 's23', alternative_id: 'a2222222-2222-2222-2222-222222222222', criteria_id: 'c2222222-3333-3333-3333-333333333333', value: 4 },
  { id: 's24', alternative_id: 'a2222222-2222-2222-2222-222222222222', criteria_id: 'c2222222-4444-4444-4444-444444444444', value: 3 },

  { id: 's25', alternative_id: 'a2222222-3333-3333-3333-333333333333', criteria_id: 'c2222222-1111-1111-1111-111111111111', value: 4 },
  { id: 's26', alternative_id: 'a2222222-3333-3333-3333-333333333333', criteria_id: 'c2222222-2222-2222-2222-222222222222', value: 4 },
  { id: 's27', alternative_id: 'a2222222-3333-3333-3333-333333333333', criteria_id: 'c2222222-3333-3333-3333-333333333333', value: 5 },
  { id: 's28', alternative_id: 'a2222222-3333-3333-3333-333333333333', criteria_id: 'c2222222-4444-4444-4444-444444444444', value: 5 }
];

const DEFAULT_CALCULATIONS = [];

// Helper functions for LocalStorage DB
function initializeLocalStorageDB() {
  if (!localStorage.getItem('sdss_studies')) {
    localStorage.setItem('sdss_studies', JSON.stringify(DEFAULT_STUDIES));
  }
  if (!localStorage.getItem('sdss_criteria')) {
    localStorage.setItem('sdss_criteria', JSON.stringify(DEFAULT_CRITERIA));
  }
  if (!localStorage.getItem('sdss_alternatives')) {
    localStorage.setItem('sdss_alternatives', JSON.stringify(DEFAULT_ALTERNATIVES));
  }
  if (!localStorage.getItem('sdss_scores')) {
    localStorage.setItem('sdss_scores', JSON.stringify(DEFAULT_SCORES));
  }
  if (!localStorage.getItem('sdss_calculations')) {
    localStorage.setItem('sdss_calculations', JSON.stringify(DEFAULT_CALCULATIONS));
  }
}

// Generate simple UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize on import
if (typeof window !== 'undefined') {
  initializeLocalStorageDB();
}

// Helper to read/write from localStorage
const readTable = (tableName) => JSON.parse(localStorage.getItem(`sdss_${tableName}`) || '[]');
const writeTable = (tableName, data) => localStorage.setItem(`sdss_${tableName}`, JSON.stringify(data));

// ==========================================
// DUAL-ADAPTER DB METHODS IMPLEMENTATION
// ==========================================

export const dbClient = {
  // --- Studies ---
  async getStudies() {
    if (DB_TYPE === 'neon' && sql) {
      const data = await sql`SELECT * FROM studies ORDER BY created_at DESC`;
      return data;
    } else {
      return readTable('studies');
    }
  },

  async saveStudy(study) {
    if (DB_TYPE === 'neon' && sql) {
      if (study.id) {
        const data = await sql`UPDATE studies SET name = ${study.name}, description = ${study.description} WHERE id = ${study.id} RETURNING *`;
        return data[0];
      } else {
        const data = await sql`INSERT INTO studies (name, description) VALUES (${study.name}, ${study.description}) RETURNING *`;
        return data[0];
      }
    } else {
      const studies = readTable('studies');
      if (study.id) {
        const index = studies.findIndex(s => s.id === study.id);
        if (index !== -1) {
          studies[index] = { ...studies[index], ...study };
          writeTable('studies', studies);
          return studies[index];
        }
      }
      
      const newStudy = {
        id: generateUUID(),
        name: study.name,
        description: study.description,
        created_at: new Date().toISOString()
      };
      studies.push(newStudy);
      writeTable('studies', studies);
      return newStudy;
    }
  },

  async deleteStudy(id) {
    if (DB_TYPE === 'neon' && sql) {
      await sql`DELETE FROM studies WHERE id = ${id}`;
      return true;
    } else {
      // cascade deletes manually for local storage
      const studies = readTable('studies').filter(s => s.id !== id);
      const criteria = readTable('criteria').filter(c => c.study_id !== id);
      
      const alts = readTable('alternatives').filter(a => a.study_id === id);
      const altIds = alts.map(a => a.id);
      const alternatives = readTable('alternatives').filter(a => a.study_id !== id);
      
      const scores = readTable('scores').filter(s => !altIds.includes(s.alternative_id));
      const calculations = readTable('calculations').filter(c => c.study_id !== id);

      writeTable('studies', studies);
      writeTable('criteria', criteria);
      writeTable('alternatives', alternatives);
      writeTable('scores', scores);
      writeTable('calculations', calculations);
      return true;
    }
  },

  // --- Criteria ---
  async getCriteria(studyId) {
    if (DB_TYPE === 'neon' && sql) {
      const data = await sql`SELECT * FROM criteria WHERE study_id = ${studyId}`;
      return data.map(c => ({
        ...c,
        weight: Number(c.weight) || 0,
        target_value: Number(c.target_value) || 3,
        is_core_factor: c.is_core_factor === true || c.is_core_factor === 'true' || c.is_core_factor === 1
      }));
    } else {
      return readTable('criteria').filter(c => c.study_id === studyId);
    }
  },

  async saveCriterion(criterion) {
    if (DB_TYPE === 'neon' && sql) {
      if (criterion.id) {
        const data = await sql`UPDATE criteria SET name = ${criterion.name}, weight = ${Number(criterion.weight)}, type = ${criterion.type}, target_value = ${Number(criterion.target_value)}, is_core_factor = ${criterion.is_core_factor} WHERE id = ${criterion.id} RETURNING *`;
        return data[0];
      } else {
        const data = await sql`INSERT INTO criteria (study_id, name, weight, type, target_value, is_core_factor) VALUES (${criterion.study_id}, ${criterion.name}, ${Number(criterion.weight)}, ${criterion.type}, ${Number(criterion.target_value)}, ${criterion.is_core_factor}) RETURNING *`;
        return data[0];
      }
    } else {
      const criteria = readTable('criteria');
      if (criterion.id) {
        const index = criteria.findIndex(c => c.id === criterion.id);
        if (index !== -1) {
          criteria[index] = { ...criteria[index], ...criterion };
          writeTable('criteria', criteria);
          return criteria[index];
        }
      }
      
      const newCriterion = {
        id: generateUUID(),
        study_id: criterion.study_id,
        name: criterion.name,
        weight: Number(criterion.weight) || 0,
        type: criterion.type || 'benefit',
        target_value: Number(criterion.target_value) ?? 3.0,
        is_core_factor: criterion.is_core_factor !== undefined ? criterion.is_core_factor : true
      };
      criteria.push(newCriterion);
      writeTable('criteria', criteria);
      return newCriterion;
    }
  },

  async saveAllCriteria(studyId, criteriaList) {
    if (DB_TYPE === 'neon' && sql) {
      const existingCrit = await sql`SELECT id FROM criteria WHERE study_id = ${studyId}`;
      const existingIds = existingCrit.map(c => c.id);
      
      const newIds = criteriaList.map(c => c.id).filter(Boolean);
      const toDelete = existingIds.filter(id => !newIds.includes(id));
      
      for (const deleteId of toDelete) {
        await sql`DELETE FROM criteria WHERE id = ${deleteId}`;
      }
      
      const results = [];
      for (const c of criteriaList) {
        const isCore = c.is_core_factor === 'true' || c.is_core_factor === true || c.is_core_factor === 1;
        if (c.id) {
          const res = await sql`UPDATE criteria SET name = ${c.name}, weight = ${Number(c.weight)}, type = ${c.type}, target_value = ${Number(c.target_value)}, is_core_factor = ${isCore} WHERE id = ${c.id} RETURNING *`;
          results.push(res[0]);
        } else {
          const res = await sql`INSERT INTO criteria (study_id, name, weight, type, target_value, is_core_factor) VALUES (${studyId}, ${c.name}, ${Number(c.weight)}, ${c.type}, ${Number(c.target_value)}, ${isCore}) RETURNING *`;
          results.push(res[0]);
        }
      }
      return results;
    } else {
      const criteria = readTable('criteria').filter(c => c.study_id !== studyId);
      const updatedList = criteriaList.map(c => ({
        id: c.id || generateUUID(),
        study_id: studyId,
        name: c.name,
        weight: Number(c.weight) || 0,
        type: c.type || 'benefit',
        target_value: Number(c.target_value) ?? 3.0,
        is_core_factor: c.is_core_factor === true || c.is_core_factor === 'true' || c.is_core_factor === 1
      }));
      criteria.push(...updatedList);
      writeTable('criteria', criteria);
      return updatedList;
    }
  },

  async deleteCriterion(id) {
    if (DB_TYPE === 'neon' && sql) {
      await sql`DELETE FROM criteria WHERE id = ${id}`;
      return true;
    } else {
      const criteria = readTable('criteria').filter(c => c.id !== id);
      const scores = readTable('scores').filter(s => s.criteria_id !== id);
      writeTable('criteria', criteria);
      writeTable('scores', scores);
      return true;
    }
  },

  // --- Alternatives ---
  async getAlternatives(studyId) {
    if (DB_TYPE === 'neon' && sql) {
      const data = await sql`SELECT * FROM alternatives WHERE study_id = ${studyId}`;
      return data;
    } else {
      return readTable('alternatives').filter(a => a.study_id === studyId);
    }
  },

  async saveAlternative(alternative) {
    if (DB_TYPE === 'neon' && sql) {
      let savedAlt = null;
      if (alternative.id) {
        const data = await sql`UPDATE alternatives SET name = ${alternative.name}, description = ${alternative.description}, category = ${alternative.category} WHERE id = ${alternative.id} RETURNING *`;
        savedAlt = data[0];
      } else {
        const data = await sql`INSERT INTO alternatives (study_id, name, description, category) VALUES (${alternative.study_id}, ${alternative.name}, ${alternative.description}, ${alternative.category}) RETURNING *`;
        savedAlt = data[0];
        
        const criteria = await sql`SELECT id FROM criteria WHERE study_id = ${alternative.study_id}`;
        for (const crit of criteria) {
          await sql`INSERT INTO scores (alternative_id, criteria_id, value) VALUES (${savedAlt.id}, ${crit.id}, 0) ON CONFLICT DO NOTHING`;
        }
      }
      return savedAlt;
    } else {
      const alternatives = readTable('alternatives');
      if (alternative.id) {
        const index = alternatives.findIndex(a => a.id === alternative.id);
        if (index !== -1) {
          alternatives[index] = { ...alternatives[index], ...alternative };
          writeTable('alternatives', alternatives);
          return alternatives[index];
        }
      }
      
      const newAlt = {
        id: generateUUID(),
        study_id: alternative.study_id,
        name: alternative.name,
        description: alternative.description || '',
        category: alternative.category || ''
      };
      alternatives.push(newAlt);
      writeTable('alternatives', alternatives);
      
      const criteria = readTable('criteria').filter(c => c.study_id === alternative.study_id);
      const scores = readTable('scores');
      criteria.forEach(crit => {
        scores.push({
          id: generateUUID(),
          alternative_id: newAlt.id,
          criteria_id: crit.id,
          value: 0
        });
      });
      writeTable('scores', scores);

      return newAlt;
    }
  },

  async deleteAlternative(id) {
    if (DB_TYPE === 'neon' && sql) {
      await sql`DELETE FROM alternatives WHERE id = ${id}`;
      return true;
    } else {
      const alternatives = readTable('alternatives').filter(a => a.id !== id);
      const scores = readTable('scores').filter(s => s.alternative_id !== id);
      writeTable('alternatives', alternatives);
      writeTable('scores', scores);
      return true;
    }
  },

  // --- Scores ---
  async getScores(studyId) {
    if (DB_TYPE === 'neon' && sql) {
      const data = await sql`SELECT s.* FROM scores s JOIN alternatives a ON s.alternative_id = a.id WHERE a.study_id = ${studyId}`;
      return data.map(s => ({
        ...s,
        value: Number(s.value) || 0
      }));
    } else {
      const alts = readTable('alternatives').filter(a => a.study_id === studyId);
      const altIds = alts.map(a => a.id);
      return readTable('scores').filter(s => altIds.includes(s.alternative_id));
    }
  },

  async saveScores(scoresList) {
    if (DB_TYPE === 'neon' && sql) {
      for (const s of scoresList) {
        await sql`INSERT INTO scores (alternative_id, criteria_id, value) VALUES (${s.alternative_id}, ${s.criteria_id}, ${Number(s.value)}) ON CONFLICT (alternative_id, criteria_id) DO UPDATE SET value = EXCLUDED.value`;
      }
      return scoresList;
    } else {
      const scores = readTable('scores');
      scoresList.forEach(newScore => {
        const index = scores.findIndex(s => s.alternative_id === newScore.alternative_id && s.criteria_id === newScore.criteria_id);
        if (index !== -1) {
          scores[index].value = Number(newScore.value);
        } else {
          scores.push({
            id: generateUUID(),
            alternative_id: newScore.alternative_id,
            criteria_id: newScore.criteria_id,
            value: Number(newScore.value)
          });
        }
      });
      writeTable('scores', scores);
      return scoresList;
    }
  },

  // --- Calculations logs ---
  async getCalculations(studyId) {
    if (DB_TYPE === 'neon' && sql) {
      const data = await sql`SELECT * FROM calculations WHERE study_id = ${studyId} ORDER BY created_at DESC`;
      return data;
    } else {
      return readTable('calculations').filter(c => c.study_id === studyId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async saveCalculation(studyId, method, result) {
    if (DB_TYPE === 'neon' && sql) {
      const data = await sql`INSERT INTO calculations (study_id, method, result) VALUES (${studyId}, ${method}, ${JSON.stringify(result)}) RETURNING *`;
      return data[0];
    } else {
      const calculations = readTable('calculations');
      const newCalc = {
        id: generateUUID(),
        study_id: studyId,
        method,
        result,
        created_at: new Date().toISOString()
      };
      calculations.push(newCalc);
      writeTable('calculations', calculations);
      return newCalc;
    }
  }
};
