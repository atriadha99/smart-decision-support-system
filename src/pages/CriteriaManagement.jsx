import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ClipboardList, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Scale, 
  TrendingUp, 
  ArrowRight,
  Brain,
  CheckCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { calculateAHPWeights } from '../utils/ahp';
import Modal from '../components/Modal';

// Validation Schema
const criterionSchema = z.object({
  name: z.string().min(2, 'Nama kriteria minimal 2 karakter'),
  weight: z.coerce.number().min(0, 'Bobot minimal 0').max(1, 'Bobot maksimal 1'),
  type: z.enum(['benefit', 'cost']),
  target_value: z.coerce.number().min(1, 'Target minimal 1').max(5, 'Target maksimal 5'),
  is_core_factor: z.coerce.boolean()
});

export default function CriteriaManagement() {
  const { 
    activeStudy, 
    criteria, 
    saveCriteria, 
    deleteCriterion,
    refreshDetails
  } = useDatabase();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'ahp'
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState(null);

  // AHP Comparison Matrix State
  const [ahpMatrix, setAhpMatrix] = useState([]);
  const [ahpResults, setAhpResults] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(criterionSchema)
  });

  // Calculate weight sum
  const sumWeights = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
  const isWeightValid = Math.abs(sumWeights - 1.0) < 0.0001;

  // Initialize/Reset AHP Matrix when criteria changes
  useEffect(() => {
    const n = criteria.length;
    if (n > 0) {
      // Build identity matrix size n x n
      const matrix = Array(n).fill(0).map((_, i) => 
        Array(n).fill(0).map((_, j) => (i === j ? 1 : 1))
      );
      setAhpMatrix(matrix);
      setAhpResults(null);
    }
  }, [criteria]);

  // Recalculate AHP when matrix changes
  useEffect(() => {
    if (criteria.length > 0 && ahpMatrix.length === criteria.length) {
      const criteriaIds = criteria.map(c => c.id);
      const res = calculateAHPWeights(ahpMatrix, criteriaIds);
      setAhpResults(res);
    }
  }, [ahpMatrix, criteria]);

  if (!activeStudy) {
    return (
      <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <ClipboardList className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Belum Ada Studi Kasus Dipilih</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pilih atau buat studi kasus terlebih dahulu pada menu Studi Kasus untuk mengelola kriteria.
        </p>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingCriterion(null);
    reset({
      name: '',
      weight: criteria.length === 0 ? 1 : Number(( (1 - sumWeights) > 0 ? (1 - sumWeights) : 0 ).toFixed(4)),
      type: 'benefit',
      target_value: 3,
      is_core_factor: true
    });
    setIsOpenModal(true);
  };

  const openEditModal = (crit) => {
    setEditingCriterion(crit);
    setValue('name', crit.name);
    setValue('weight', crit.weight);
    setValue('type', crit.type);
    setValue('target_value', crit.target_value || 3);
    setValue('is_core_factor', crit.is_core_factor);
    setIsOpenModal(true);
  };

  const onSubmit = async (data) => {
    try {
      let updatedList = [...criteria];
      if (editingCriterion) {
        updatedList = updatedList.map(c => c.id === editingCriterion.id ? { ...c, ...data } : c);
      } else {
        updatedList.push({
          id: undefined, // dbClient will assign a UUID
          ...data
        });
      }
      await saveCriteria(updatedList);
      setIsOpenModal(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus kriteria ini? Ini juga akan menghapus nilai penilaian pada kriteria ini di seluruh alternatif.')) {
      await deleteCriterion(id);
    }
  };

  // Normalisasi Bobot Proposional (Normalize weights so sum = 1)
  const handleNormalizeWeights = async () => {
    if (criteria.length === 0) return;
    const total = criteria.reduce((sum, c) => sum + Number(c.weight), 0) || 1;
    const normalized = criteria.map(c => ({
      ...c,
      weight: Number((Number(c.weight) / total).toFixed(4))
    }));
    // Adjust floating point error in last element to sum exactly to 1.0
    const finalSum = normalized.reduce((sum, c) => sum + c.weight, 0);
    if (finalSum !== 1.0) {
      const diff = 1.0 - finalSum;
      normalized[normalized.length - 1].weight = Number((normalized[normalized.length - 1].weight + diff).toFixed(4));
    }
    await saveCriteria(normalized);
  };

  // AHP Pairwise input change handler
  const handleAhpCellChange = (i, j, value) => {
    const val = Number(value);
    const newMatrix = ahpMatrix.map(row => [...row]);
    newMatrix[i][j] = val;
    // Auto update symmetric cell
    newMatrix[j][i] = val === 0 ? 0 : 1 / val;
    setAhpMatrix(newMatrix);
  };

  // Apply weights calculated from AHP pairwise matrix
  const handleApplyAhpWeights = async () => {
    if (!ahpResults || !ahpResults.isConsistent) {
      alert("Matriks perbandingan AHP belum konsisten (CR >= 0.1). Sesuaikan nilai perbandingan terlebih dahulu.");
      return;
    }
    const updated = criteria.map(c => ({
      ...c,
      weight: ahpResults.weights[c.id]
    }));
    await saveCriteria(updated);
    setActiveTab('list');
    alert("Bobot AHP berhasil diterapkan!");
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Studi Kasus: {activeStudy.name}</span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">Manajemen Kriteria</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Definisikan parameter kriteria evaluasi beserta bobot dan jenisnya.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-lightBorder dark:border-darkBorder self-start md:self-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'list' ? 'bg-white dark:bg-darkCard text-brand-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Daftar Kriteria
          </button>
          {criteria.length >= 2 && (
            <button
              onClick={() => setActiveTab('ahp')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'ahp' ? 'bg-white dark:bg-darkCard text-brand-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Brain className="w-4 h-4" />
              <span>Matriks Bobot AHP</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Validation Alert */}
          {!isWeightValid && criteria.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5.5 h-5.5 text-amber-500 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold">Bobot Tidak Valid!</span> Jumlah bobot kriteria saat ini adalah <strong className="underline">{sumWeights.toFixed(4)}</strong>. Jumlah bobot harus bernilai tepat <strong className="underline">1.0</strong> agar perhitungan akurat.
                </div>
              </div>
              <button
                onClick={handleNormalizeWeights}
                className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Normalkan Bobot</span>
              </button>
            </div>
          )}

          {isWeightValid && criteria.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle className="w-5.5 h-5.5 text-emerald-500 shrink-0" />
              <div className="text-sm">
                <span className="font-bold">Bobot Valid!</span> Jumlah seluruh bobot kriteria bernilai tepat <strong className="underline">1.0</strong>. Perhitungan siap dijalankan.
              </div>
            </div>
          )}

          {/* Criteria List Controls */}
          <div className="flex justify-between items-center bg-white dark:bg-darkCard p-4 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Total: {criteria.length} kriteria
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/10 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kriteria</span>
            </button>
          </div>

          {/* Criteria Table */}
          <div className="glass-card bg-white dark:bg-darkCard">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-400 uppercase font-semibold">
                    <th className="py-4 px-6">Nama Kriteria</th>
                    <th className="py-4 px-6 text-center">Bobot</th>
                    <th className="py-4 px-6 text-center">Tipe</th>
                    <th className="py-4 px-6 text-center">Nilai Target (PM)</th>
                    <th className="py-4 px-6 text-center">Kategori GAP (PM)</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
                  {criteria.length > 0 ? (
                    criteria.map((crit, idx) => (
                      <tr key={crit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="w-6.5 h-6.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">C{idx+1}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">{crit.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {crit.weight}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${crit.type === 'benefit' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'}`}>
                            {crit.type === 'benefit' ? 'Benefit' : 'Cost'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">
                          {crit.target_value ?? '3.00'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${crit.is_core_factor ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {crit.is_core_factor ? 'Core Factor' : 'Secondary'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(crit)}
                              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(crit.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <ClipboardList className="w-8 h-8 text-slate-300" />
                          <p className="text-sm font-semibold">Tidak Ada Kriteria</p>
                          <p className="text-xs text-slate-500">Tambahkan kriteria baru untuk memulai penilaian.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* AHP PAIRWISE MATRIX TAB */
        <div className="glass-card p-6 space-y-8 bg-white dark:bg-darkCard">
          
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-500" />
              <span>Matriks Perbandingan Berpasangan Kriteria (AHP)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-4xl leading-relaxed">
              Bandingkan tingkat kepentingan relatif antar kriteria. Nilai 1 berarti kepentingan setara, 
              sementara nilai 3, 5, 7, 9 masing-masing menunjukkan kriteria di sebelah kiri sedikit lebih penting, lebih penting, sangat penting, dan mutlak lebih penting dari kriteria di bagian atas.
              Nilai pecahan (1/3, 1/5, dll) adalah kebalikan perbandingan.
            </p>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto border border-lightBorder dark:border-darkBorder rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 p-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-lightBorder dark:border-darkBorder">
                  <th className="py-2.5 px-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 rounded-tl-xl text-left">Kriteria</th>
                  {criteria.map((c, idx) => (
                    <th key={c.id} className="py-2.5 px-4 font-bold text-slate-600 dark:text-slate-300 text-center bg-slate-100/50 dark:bg-slate-900/50">C{idx+1} ({c.name})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((rowC, i) => (
                  <tr key={rowC.id} className="border-b border-lightBorder dark:border-darkBorder">
                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-100/30 dark:bg-slate-900/10">C{i+1} ({rowC.name})</td>
                    {criteria.map((colC, j) => {
                      const isDiagonal = i === j;
                      const isUpperTriangle = i < j;
                      
                      if (isDiagonal) {
                        return (
                          <td key={colC.id} className="py-3 px-4 text-center bg-slate-200/40 dark:bg-slate-800/40 text-slate-500 font-bold">
                            1
                          </td>
                        );
                      }

                      if (isUpperTriangle) {
                        // User Input
                        return (
                          <td key={colC.id} className="py-3 px-4 text-center">
                            <select
                              value={ahpMatrix[i]?.[j] || 1}
                              onChange={(e) => handleAhpCellChange(i, j, e.target.value)}
                              className="bg-white dark:bg-slate-900 text-xs font-semibold py-1 px-2 border border-lightBorder dark:border-darkBorder rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                            >
                              <option value="1">1 (Sama Penting)</option>
                              <option value="3">3 (Sedikit Lebih Penting)</option>
                              <option value="5">5 (Lebih Penting)</option>
                              <option value="7">7 (Sangat Penting)</option>
                              <option value="9">9 (Mutlak Lebih Penting)</option>
                              <option value="2">2 (Antara 1 & 3)</option>
                              <option value="4">4 (Antara 3 & 5)</option>
                              <option value="6">6 (Antara 5 & 7)</option>
                              <option value="8">8 (Antara 7 & 9)</option>
                              <option value="0.3333">1/3 (Sedikit Kurang Penting)</option>
                              <option value="0.2">1/5 (Kurang Penting)</option>
                              <option value="0.1429">1/7 (Sangat Kurang Penting)</option>
                              <option value="0.1111">1/9 (Mutlak Kurang Penting)</option>
                              <option value="0.5">1/2</option>
                              <option value="0.25">1/4</option>
                              <option value="0.1667">1/6</option>
                              <option value="0.125">1/8</option>
                            </select>
                          </td>
                        );
                      }

                      // Lower Triangle (Read-only symmetric reciprocal cell)
                      const rawVal = ahpMatrix[i]?.[j] || 1;
                      const displayVal = rawVal >= 1 ? rawVal : `1/${Math.round(1 / rawVal)}`;
                      return (
                        <td key={colC.id} className="py-3 px-4 text-center text-slate-400 bg-slate-50/40 dark:bg-slate-900/10 font-medium text-xs">
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results Analysis */}
          {ahpResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Derived Weights List */}
              <div className="md:col-span-1 border border-lightBorder dark:border-darkBorder rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bobot Hasil Perhitungan AHP</h3>
                <div className="space-y-2.5 text-xs">
                  {criteria.map((c, idx) => {
                    const weightVal = ahpResults.weights[c.id] || 0;
                    return (
                      <div key={c.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">C{idx+1} ({c.name})</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">{(weightVal * 100).toFixed(2)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consistency Panel */}
              <div className="md:col-span-2 border border-lightBorder dark:border-darkBorder rounded-2xl p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Indikator Konsistensi</h3>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase">Lambda Max</p>
                      <p className="text-base text-slate-700 dark:text-slate-300 mt-1">{ahpResults.lambdaMax}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase">Consistency Index (CI)</p>
                      <p className="text-base text-slate-700 dark:text-slate-300 mt-1">{ahpResults.ci}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase">Consistency Ratio (CR)</p>
                      <p className={`text-base font-extrabold mt-1 ${ahpResults.isConsistent ? 'text-emerald-500' : 'text-red-500'}`}>
                        {ahpResults.cr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validation Status and Apply Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-lightBorder dark:border-darkBorder">
                  <div className="flex items-center gap-2">
                    {ahpResults.isConsistent ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Konsisten (CR &lt; 0.1)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tidak Konsisten (CR &ge; 0.1)</span>
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleApplyAhpWeights}
                    disabled={!ahpResults.isConsistent}
                    className={`
                      inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-white font-semibold text-sm shadow-md transition-all
                      ${ahpResults.isConsistent 
                        ? 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/10 hover:shadow-lg cursor-pointer' 
                        : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500 shadow-none'
                      }
                    `}
                  >
                    <span>Terapkan Bobot AHP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
            </div>
          )}

        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={editingCriterion ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kriteria</label>
            <input
              type="text"
              placeholder="Contoh: Harga"
              {...register('name')}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border ${errors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-lightBorder dark:border-darkBorder focus:ring-brand-500/10 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bobot Awal</label>
              <input
                type="number"
                step="0.0001"
                placeholder="Contoh: 0.25"
                {...register('weight')}
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border ${errors.weight ? 'border-red-500 focus:ring-red-500/10' : 'border-lightBorder dark:border-darkBorder focus:ring-brand-500/10 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.weight && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.weight.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Kriteria</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 cursor-pointer transition-all"
              >
                <option value="benefit">Benefit (Makin Besar Makin Baik)</option>
                <option value="cost">Cost (Makin Kecil Makin Baik)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Nilai Target (PM)</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Digunakan untuk metode Profile Matching (ideal target)" />
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="5"
                placeholder="Skala 1 - 5"
                {...register('target_value')}
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border ${errors.target_value ? 'border-red-500 focus:ring-red-500/10' : 'border-lightBorder dark:border-darkBorder focus:ring-brand-500/10 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.target_value && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.target_value.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Kategori GAP (PM)</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Pemilihan Core Factor vs Secondary Factor dalam Profile Matching" />
              </label>
              <select
                {...register('is_core_factor')}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 cursor-pointer transition-all"
              >
                <option value="true">Core Factor (Faktor Utama)</option>
                <option value="false">Secondary Factor (Faktor Pendukung)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-lightBorder dark:border-darkBorder">
            <button
              type="button"
              onClick={() => setIsOpenModal(false)}
              className="py-2.5 px-4 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/10 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
