import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  ArrowRight,
  ClipboardCheck,
  Award
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function ScoringMatrix() {
  const { 
    activeStudy, 
    criteria, 
    alternatives, 
    scores, 
    saveScores 
  } = useDatabase();
  const navigate = useNavigate();

  // Local state for the form matrix
  // Format: { [altId]: { [critId]: number } }
  const [matrix, setMatrix] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize matrix from database scores
  useEffect(() => {
    if (alternatives.length > 0 && criteria.length > 0) {
      const initialMatrix = {};
      
      alternatives.forEach(alt => {
        initialMatrix[alt.id] = {};
        criteria.forEach(crit => {
          // Find existing score
          const existing = scores.find(s => s.alternative_id === alt.id && s.criteria_id === crit.id);
          initialMatrix[alt.id][crit.id] = existing ? Number(existing.value) : 0;
        });
      });
      
      setMatrix(initialMatrix);
    }
  }, [alternatives, criteria, scores]);

  if (!activeStudy) {
    return (
      <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <FileSpreadsheet className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Belum Ada Studi Kasus Dipilih</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pilih atau buat studi kasus terlebih dahulu pada menu Studi Kasus untuk mengisi penilaian.
        </p>
      </div>
    );
  }

  if (criteria.length === 0 || alternatives.length === 0) {
    return (
      <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <AlertCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Kriteria atau Alternatif Belum Lengkap</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Anda harus memiliki minimal 1 kriteria dan 1 alternatif sebelum mengisi nilai matriks keputusan.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/criteria')}
            className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            Kelola Kriteria
          </button>
          <button
            onClick={() => navigate('/alternatives')}
            className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm"
          >
            Kelola Alternatif
          </button>
        </div>
      </div>
    );
  }

  const handleCellChange = (altId, critId, val) => {
    setSaveSuccess(false);
    const numVal = val === '' ? '' : Number(val);
    setMatrix(prev => ({
      ...prev,
      [altId]: {
        ...prev[altId],
        [critId]: numVal
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = [];
      alternatives.forEach(alt => {
        criteria.forEach(crit => {
          const val = matrix[alt.id]?.[crit.id];
          payload.push({
            alternative_id: alt.id,
            criteria_id: crit.id,
            value: val === '' || isNaN(val) ? 0 : val
          });
        });
      });
      
      await saveScores(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan nilai penilaian.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset semua input penilaian menjadi 0? Tindakan ini belum disimpan ke database sampai Anda menekan tombol Simpan.')) {
      const resetMatrix = {};
      alternatives.forEach(alt => {
        resetMatrix[alt.id] = {};
        criteria.forEach(crit => {
          resetMatrix[alt.id][crit.id] = 0;
        });
      });
      setMatrix(resetMatrix);
      setSaveSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Studi Kasus: {activeStudy.name}</span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">Input Penilaian (Scoring Matrix)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Isikan nilai untuk setiap alternatif pada masing-masing kriteria.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-lightBorder dark:border-darkBorder bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`
              inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-white font-semibold text-sm shadow-md transition-all
              ${isSaving 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/10 hover:shadow-lg'
              }
            `}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5.5 h-5.5 text-emerald-500" />
            <div className="text-sm">
              <span className="font-bold">Berhasil Disimpan!</span> Seluruh nilai penilaian alternatif berhasil disimpan ke database. Anda siap melihat hasil perhitungan.
            </div>
          </div>
          <button
            onClick={() => navigate('/calculate')}
            className="inline-flex items-center gap-1 py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <span>Lihat Hasil</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scoring Grid */}
      <div className="glass-card bg-white dark:bg-darkCard">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-400 uppercase font-semibold">
                <th className="py-4 px-6 min-w-[200px] rounded-tl-2xl">Alternatif / Kriteria</th>
                {criteria.map((crit, idx) => (
                  <th key={crit.id} className="py-4 px-4 text-center min-w-[120px]">
                    <div className="font-bold text-slate-700 dark:text-slate-300">C{idx+1} ({crit.name})</div>
                    <div className="text-[10px] text-slate-400 mt-1 capitalize">
                      {crit.type} (w={crit.weight})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
              {alternatives.map(alt => (
                <tr key={alt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                  {/* Alternative Details */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{alt.name}</div>
                    {alt.category && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                        {alt.category}
                      </span>
                    )}
                  </td>
                  
                  {/* Scores Inputs */}
                  {criteria.map(crit => {
                    const val = matrix[alt.id]?.[crit.id] ?? '';
                    return (
                      <td key={crit.id} className="py-4 px-4 text-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={val}
                          onChange={(e) => handleCellChange(alt.id, crit.id, e.target.value)}
                          className="w-24 text-center py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-semibold text-slate-800 dark:text-slate-100 transition-all"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Hint */}
      <div className="p-4 rounded-2xl border border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-400 flex items-start gap-2.5">
        <Award className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-500 dark:text-slate-300">Petunjuk Pengisian:</strong> Gunakan nilai numerik (contoh: 1 s.d. 5 atau 1 s.d. 100).
          Pastikan rentang nilai seragam antar alternatif di setiap kriteria (misal: jika Harga diisi dengan skala 1-5, maka seluruh alternatif untuk kriteria Harga harus diisi dengan skala 1-5).
        </div>
      </div>
    </div>
  );
}
