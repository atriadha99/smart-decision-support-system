import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Printer, 
  Download, 
  History, 
  BrainCircuit, 
  Database,
  CheckCircle,
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

// Import algorithms
import { calculateSAW } from '../utils/saw';
import { calculateWP } from '../utils/wp';
import { calculateTOPSIS } from '../utils/topsis';
import { calculateSMART } from '../utils/smart';
import { calculateProfileMatching } from '../utils/pm';
import { calculateAHP } from '../utils/ahp';
import { calculateMOORA } from '../utils/moora';

export default function CalculationPage() {
  const { 
    activeStudy, 
    criteria, 
    alternatives, 
    scores, 
    calculations, 
    saveCalculationLog 
  } = useDatabase();

  const [activeMethod, setActiveMethod] = useState('saw'); // 'saw' | 'wp' | 'topsis' | 'smart' | 'pm' | 'ahp'
  const [results, setResults] = useState(null);
  const [isSavingLog, setIsSavingLog] = useState(false);

  // Check if study has valid data
  const hasData = alternatives.length > 0 && criteria.length > 0 && scores.length > 0;

  // Run Calculations
  useEffect(() => {
    if (!hasData) {
      setResults(null);
      return;
    }

    let res = null;
    switch (activeMethod) {
      case 'saw':
        res = calculateSAW(alternatives, criteria, scores);
        break;
      case 'wp':
        res = calculateWP(alternatives, criteria, scores);
        break;
      case 'topsis':
        res = calculateTOPSIS(alternatives, criteria, scores);
        break;
      case 'smart':
        res = calculateSMART(alternatives, criteria, scores);
        break;
      case 'pm':
        res = calculateProfileMatching(alternatives, criteria, scores);
        break;
      case 'ahp':
        res = calculateAHP(alternatives, criteria, scores);
        break;
      case 'moora':
        res = calculateMOORA(alternatives, criteria, scores);
        break;
      default:
        res = null;
    }
    setResults(res);
  }, [activeMethod, alternatives, criteria, scores, hasData]);

  if (!activeStudy) {
    return (
      <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Calculator className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Belum Ada Studi Kasus Dipilih</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pilih atau buat studi kasus terlebih dahulu pada menu Studi Kasus untuk menghitung ranking.
        </p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Data Evaluasi Belum Lengkap</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pastikan Anda telah mengisi kriteria, alternatif, dan seluruh matriks penilaian sebelum menjalankan kalkulasi ranking.
        </p>
      </div>
    );
  }

  // --- Actions ---

  // Native window.print() (PDF Export using tailwind @media print CSS classes)
  const handlePrint = () => {
    window.print();
  };

  // CSV Excel Export
  const handleExportCSV = () => {
    if (!results || !results.results) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Title
    csvContent += `Smart Decision Support System (SDSS)\r\n`;
    csvContent += `Studi Kasus: ${activeStudy.name}\r\n`;
    csvContent += `Metode SPK: ${activeMethod.toUpperCase()}\r\n`;
    csvContent += `Tanggal Perhitungan: ${new Date().toLocaleDateString()}\r\n\r\n`;

    // Headers
    csvContent += `Rank,Nama Alternatif,Skor Akhir\r\n`;

    // Data
    results.results.forEach(row => {
      csvContent += `${row.rank},"${row.name.replace(/"/g, '""')}",${row.score}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_SDSS_${activeMethod}_${activeStudy.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save calculation results into Supabase/LocalStorage logs
  const handleSaveLog = async () => {
    setIsSavingLog(true);
    try {
      await saveCalculationLog(activeMethod.toUpperCase(), results);
      alert("Riwayat kalkulasi berhasil disimpan ke database logs!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan log perhitungan.");
    } finally {
      setIsSavingLog(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 no-print">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Studi Kasus: {activeStudy.name}</span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">Perhitungan & Analisis SPK</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis detail dan visualisasi langkah-langkah matriks keputusan dari setiap metode.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveLog}
            disabled={isSavingLog}
            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-lightBorder dark:border-darkBorder bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold shadow-sm transition-colors"
          >
            <Database className="w-4 h-4 text-brand-500" />
            <span>{isSavingLog ? 'Menyimpan...' : 'Simpan Log'}</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-lightBorder dark:border-darkBorder bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Ekspor Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/10 hover:shadow-lg transition-all"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>Cetak PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header (Hidden on screen) */}
      <div className="hidden print-only space-y-4 border-b pb-6 border-slate-300">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Smart Decision Support System (SDSS)</h1>
            <p className="text-xs text-slate-400 mt-1">Universal Decision Support Framework</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Tanggal: {new Date().toLocaleDateString()}</p>
            <p>Metode: {activeMethod.toUpperCase()}</p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-700">Laporan Studi Kasus: {activeStudy.name}</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activeStudy.description}</p>
        </div>
      </div>

      {/* Tabs Method Picker (Hidden on print) */}
      <div className="flex overflow-x-auto bg-white dark:bg-darkCard p-1.5 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm no-print scrollbar-none">
        {[
          { id: 'saw', name: 'SAW', desc: 'Simple Additive Weighting' },
          { id: 'wp', name: 'WP', desc: 'Weighted Product' },
          { id: 'topsis', name: 'TOPSIS', desc: 'Ideal Closeness' },
          { id: 'smart', name: 'SMART', desc: 'Simple Multi-Attribute' },
          { id: 'pm', name: 'PM', desc: 'Profile Matching' },
          { id: 'ahp', name: 'AHP', desc: 'Analytic Hierarchy' },
          { id: 'moora', name: 'MOORA', desc: 'Ratio Optimization' }
        ].map(method => (
          <button
            key={method.id}
            onClick={() => setActiveMethod(method.id)}
            className={`
              flex-1 py-3 px-4 rounded-xl text-center font-bold text-sm transition-all whitespace-nowrap min-w-[80px]
              ${activeMethod === method.id 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }
            `}
          >
            <span>{method.name}</span>
            <span className="block text-[10px] opacity-75 font-normal tracking-wide hidden sm:block">{method.desc}</span>
          </button>
        ))}
      </div>

      {/* Rank Award Card */}
      {results && results.results && results.results.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-emerald-500 bg-white dark:bg-darkCard print-card">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rekomendasi Utama ({activeMethod.toUpperCase()})</span>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{results.results[0].name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Menempati peringkat pertama dengan skor preferensi akhir <strong className="font-bold text-emerald-600 dark:text-emerald-400">{results.results[0].score}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Ranking Table */}
      {results && (
        <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand-500" />
            <span>Hasil Akhir Perangkingan</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm print-table border-collapse">
              <thead>
                <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-6 text-center w-20">Rank</th>
                  <th className="py-3 px-6">Alternatif</th>
                  <th className="py-3 px-6 text-center">Skor Preferensi</th>
                  {activeMethod === 'wp' && <th className="py-3 px-6 text-center">Skor Vektor S</th>}
                  {activeMethod === 'topsis' && (
                    <>
                      <th className="py-3 px-6 text-center">Jarak D+</th>
                      <th className="py-3 px-6 text-center">Jarak D-</th>
                    </>
                  )}
                  {activeMethod === 'pm' && (
                    <>
                      <th className="py-3 px-6 text-center">Core Factor</th>
                      <th className="py-3 px-6 text-center">Secondary</th>
                    </>
                  )}
                  {activeMethod === 'moora' && (
                    <>
                      <th className="py-3 px-6 text-center">Benefit Sum</th>
                      <th className="py-3 px-6 text-center">Cost Sum</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
                {results.results.map(row => (
                  <tr key={row.alternativeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-6 text-center">
                      <span className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold
                        ${row.rank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' : ''}
                        ${row.rank === 2 ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' : ''}
                        ${row.rank === 3 ? 'bg-orange-50 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400' : ''}
                        ${row.rank > 3 ? 'text-slate-500' : ''}
                      `}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td className="py-3.5 px-6 text-center font-extrabold text-brand-600 dark:text-brand-400">{row.score}</td>
                    {activeMethod === 'wp' && <td className="py-3.5 px-6 text-center text-slate-500">{row.sScore}</td>}
                    {activeMethod === 'topsis' && (
                      <>
                        <td className="py-3.5 px-6 text-center text-slate-500">{row.dPlus}</td>
                        <td className="py-3.5 px-6 text-center text-slate-500">{row.dMinus}</td>
                      </>
                    )}
                    {activeMethod === 'pm' && (
                      <>
                        <td className="py-3.5 px-6 text-center text-slate-500">{row.cf}</td>
                        <td className="py-3.5 px-6 text-center text-slate-500">{row.sf}</td>
                      </>
                    )}
                    {activeMethod === 'moora' && (
                      <>
                        <td className="py-3.5 px-6 text-center text-slate-500">{row.benefitSum}</td>
                        <td className="py-3.5 px-6 text-center text-slate-500">{row.costSum}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* METHOD DETAILS SECTION */}
      {results && (
        <div className="space-y-8">
          
          {/* SAW DETAIL MODULE */}
          {activeMethod === 'saw' && (
            <div className="space-y-6">
              
              {/* Decision Matrix */}
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">1. Matriks Keputusan (X)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1} ({c.name})</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.matrix.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Normalization Matrix */}
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Matriks Normalisasi (R)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1} ({c.name})</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.normalized.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-600 dark:text-slate-400">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Weighted Matrix */}
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">3. Matriks Terbobot (V)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1} ({c.name})</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.weighted.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-brand-600 dark:text-brand-400 font-medium">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

          {/* WP DETAIL MODULE */}
          {activeMethod === 'wp' && (
            <div className="space-y-6">
              
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">1. Normalisasi Bobot Kriteria</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Kriteria</th>
                        <th className="py-2.5 px-4 text-center">Bobot Awal</th>
                        <th className="py-2.5 px-4 text-center">Tipe</th>
                        <th className="py-2.5 px-4 text-center">Bobot Normalisasi (Wj)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map(c => (
                        <tr key={c.id} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{c.name}</td>
                          <td className="py-2.5 px-4 text-center">{c.weight}</td>
                          <td className="py-2.5 px-4 text-center capitalize">{c.type}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-brand-600 dark:text-brand-400">{results.weights[c.id]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Hasil Pangkat Alternatif per Kriteria (x_ij^wj)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1}</th>)}
                        <th className="py-2.5 px-4 text-center bg-slate-100 dark:bg-slate-900 font-bold">Hasil Kali (S Vektor)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.sVector.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-500">{row.details[c.id]}</td>)}
                          <td className="py-2.5 px-4 text-center font-bold bg-slate-50 dark:bg-slate-900/40">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

          {/* TOPSIS DETAIL MODULE */}
          {activeMethod === 'topsis' && (
            <div className="space-y-6">
              
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">1. Matriks Normalisasi (R)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.normalized.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-500">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Matriks Terbobot (V) & Solusi Ideal</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse border-b">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.weighted.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-600 dark:text-slate-400">{row[c.id]}</td>)}
                        </tr>
                      ))}
                      {/* Positive Ideal */}
                      <tr className="bg-emerald-50/20 dark:bg-emerald-950/10 font-bold border-t border-slate-300">
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Solusi Ideal Positif (A+)</td>
                        {criteria.map(c => <td key={c.id} className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400">{results.idealPositive[c.id]}</td>)}
                      </tr>
                      {/* Negative Ideal */}
                      <tr className="bg-red-50/20 dark:bg-red-950/10 font-bold">
                        <td className="py-3 px-4 text-red-600 dark:text-red-400">Solusi Ideal Negatif (A-)</td>
                        {criteria.map(c => <td key={c.id} className="py-3 px-4 text-center text-red-600 dark:text-red-400">{results.idealNegative[c.id]}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

          {/* SMART DETAIL MODULE */}
          {activeMethod === 'smart' && (
            <div className="space-y-6">
              
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">1. Nilai Utility Alternatif (U)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nilai utility mengonversi nilai awal kriteria ke dalam skala 0 s.d. 100 berdasarkan nilai minimum dan maksimum kriteria tersebut.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1} ({c.name})</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.utility.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-600 dark:text-slate-400">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Bobot Kriteria Ternormalisasi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Kriteria</th>
                        <th className="py-2.5 px-4 text-center">Bobot Awal</th>
                        <th className="py-2.5 px-4 text-center">Bobot Ternormalisasi (Wj)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map(c => (
                        <tr key={c.id} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{c.name}</td>
                          <td className="py-2.5 px-4 text-center text-slate-400">{c.weight}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-brand-600 dark:text-brand-400">{results.weights[c.id]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

          {/* PROFILE MATCHING DETAIL MODULE */}
          {activeMethod === 'pm' && (
            <div className="space-y-6">
              
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">1. Matriks GAP (Profil Alternatif - Profil Ideal)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1} ({c.name})</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.gaps.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => {
                            const gap = row[c.id];
                            return (
                              <td key={c.id} className={`py-2.5 px-4 text-center font-semibold ${gap === 0 ? 'text-emerald-500' : gap > 0 ? 'text-blue-500' : 'text-amber-500'}`}>
                                {gap > 0 ? `+${gap}` : gap}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {/* Target Profile Row */}
                      <tr className="bg-slate-100 dark:bg-slate-900/50 font-bold">
                        <td className="py-2.5 px-4">Profil Ideal (Target)</td>
                        {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-800 dark:text-slate-200">{c.target_value}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Bobot Nilai GAP</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.gapWeights.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-600 dark:text-slate-400">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

          {/* AHP DETAIL MODULE */}
          {activeMethod === 'ahp' && (
            <div className="space-y-6">
              
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">1. Matriks Sintesis Alternatif Ternormalisasi (R)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pada sintesis alternatif AHP, alternatif dinormalisasi dengan membagi nilainya dengan total nilai seluruh alternatif pada kriteria tersebut.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.normalized.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-500">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Bobot Kriteria yang Digunakan</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jika Anda mengisi perbandingan AHP di menu Kriteria, bobot tersebut digunakan. Jika tidak, bobot input kriteria standar yang digunakan.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Kriteria</th>
                        <th className="py-2.5 px-4 text-center">Bobot Digunakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map(c => (
                        <tr key={c.id} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{c.name}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-brand-600 dark:text-brand-400">
                            {(results.weightsUsed[c.id] * 100).toFixed(2)}% ({results.weightsUsed[c.id]})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

          {/* MOORA DETAIL MODULE */}
          {activeMethod === 'moora' && (
            <div className="space-y-6">
              
              {/* Decision Matrix */}
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">1. Matriks Keputusan (X)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1} ({c.name})</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.matrix.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Normalized Matrix */}
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Matriks Normalisasi (R)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Matriks normalisasi MOORA dihitung dengan membagi setiap sel dengan akar dari jumlah kuadrat seluruh nilai alternatif pada kriteria tersebut.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.normalized.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-slate-500">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Weighted Matrix */}
              <div className="glass-card bg-white dark:bg-darkCard p-6 space-y-4 print-card">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">3. Matriks Normalisasi Terbobot (V)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm print-table border-collapse">
                    <thead>
                      <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30 text-xs">
                        <th className="py-2.5 px-4 font-bold">Alternatif</th>
                        {criteria.map((c, i) => <th key={c.id} className="py-2.5 px-4 text-center">C{i+1}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.weighted.map(row => (
                        <tr key={row.alternativeId} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-2.5 px-4 font-semibold">{row.name}</td>
                          {criteria.map(c => <td key={c.id} className="py-2.5 px-4 text-center text-brand-600 dark:text-brand-400 font-medium">{row[c.id]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

        </div>
      )}

      {/* FOOTER HINT */}
      <div className="p-4 rounded-2xl border border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-400 flex items-start gap-2.5 no-print">
        <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-500 dark:text-slate-300">Penjelasan Singkat:</strong> 
          SAW menjumlahkan bobot ternormalisasi secara linear. 
          WP menggunakan perkalian pangkat bobot kriteria. 
          TOPSIS mencari alternatif terdekat dengan solusi ideal positif dan terlampau jauh dari ideal negatif. 
          SMART menghitung utility relatif. 
          PM mencocokkan profil berdasarkan selisih gap kriteria inti/pendukung.
          AHP menggunakan sintesis prioritas.
          MOORA menghitung selisih jumlahan bobot kriteria benefit dan cost.
        </div>
      </div>
    </div>
  );
}
