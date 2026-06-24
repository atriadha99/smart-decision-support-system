import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderGit2, 
  ClipboardList, 
  Users, 
  Calculator, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import { useDatabase } from '../context/DatabaseContext';
import { calculateSAW } from '../utils/saw';
import { calculateWP } from '../utils/wp';
import { calculateTOPSIS } from '../utils/topsis';
import { calculateSMART } from '../utils/smart';
import { calculateProfileMatching } from '../utils/pm';

// Palette for charts
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e'];

export default function Dashboard() {
  const { studies, criteria, alternatives, scores, calculations, activeStudy, currentStudyId } = useDatabase();

  // 1. Calculate stats
  const totalStudies = studies.length;
  const totalCriteria = criteria.length;
  const totalAlternatives = alternatives.length;
  const totalCalculations = calculations.length;

  // 2. Perform dynamic calculations for charts
  let sawResults = [];
  let wpResults = [];
  let topsisResults = [];
  let smartResults = [];
  let pmResults = [];
  let chartData = [];
  let weightData = [];
  let radarData = [];

  const hasData = alternatives.length > 0 && criteria.length > 0 && scores.length > 0;

  if (hasData) {
    // Run all methods
    const saw = calculateSAW(alternatives, criteria, scores);
    const wp = calculateWP(alternatives, criteria, scores);
    const topsis = calculateTOPSIS(alternatives, criteria, scores);
    const smart = calculateSMART(alternatives, criteria, scores);
    const pm = calculateProfileMatching(alternatives, criteria, scores);

    sawResults = saw.results;
    wpResults = wp.results;
    topsisResults = topsis.results;
    smartResults = smart.results;
    pmResults = pm.results;

    // Weight distribution data for Pie Chart
    weightData = criteria.map(c => ({
      name: c.name,
      value: Number(c.weight)
    }));

    // Comparative ranking chart data
    chartData = alternatives.map(alt => {
      const sRes = sawResults.find(r => r.alternativeId === alt.id);
      const wRes = wpResults.find(r => r.alternativeId === alt.id);
      const tRes = topsisResults.find(r => r.alternativeId === alt.id);
      const smRes = smartResults.find(r => r.alternativeId === alt.id);
      const pRes = pmResults.find(r => r.alternativeId === alt.id);

      return {
        name: alt.name,
        // Scores
        SAW: sRes ? sRes.score : 0,
        WP: wRes ? wRes.score : 0,
        TOPSIS: tRes ? tRes.score : 0,
        SMART: smRes ? smRes.score / 100 : 0, // scale to 0-1
        PM: pRes ? pRes.score / 5 : 0 // scale 1-5 to 0-1
      };
    });

    // Radar chart data: scores of alternatives on each criterion
    // To make it clear, we key by criterion name and plot alternative scores
    const scoreMap = {};
    scores.forEach(s => {
      scoreMap[`${s.alternative_id}-${s.criteria_id}`] = Number(s.value) || 0;
    });

    radarData = criteria.map(crit => {
      const row = { subject: crit.name };
      alternatives.forEach(alt => {
        row[alt.name] = scoreMap[`${alt.id}-${crit.id}`] || 0;
      });
      return row;
    });
  }

  // Get top alternative from SAW
  const bestAlternative = sawResults.length > 0 ? sawResults[0] : null;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 p-8 lg:p-10 text-white shadow-xl shadow-brand-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Decision Support System (SDSS)</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            Pengambilan Keputusan Universal Menjadi Lebih Cerdas
          </h1>
          <p className="text-brand-100 text-sm md:text-base leading-relaxed">
            SDSS mendukung metode analisis terpopuler: SAW, WP, TOPSIS, SMART, Profile Matching, dan AHP.
            Kelola studi kasus Anda dan temukan alternatif terbaik secara matematis.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { name: 'Studi Kasus', value: totalStudies, icon: FolderGit2, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/20', link: '/studies' },
          { name: 'Total Kriteria', value: totalCriteria, icon: ClipboardList, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20', link: '/criteria' },
          { name: 'Total Alternatif', value: totalAlternatives, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20', link: '/alternatives' },
          { name: 'Perhitungan Disimpan', value: totalCalculations, icon: Calculator, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20', link: '/calculate' }
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.name} 
              to={stat.link} 
              className="glass-card p-6 flex items-center justify-between hover:-translate-y-1 hover:border-brand-500/20 transition-all duration-300 group"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                  {stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Active Study Banner & Warning */}
      {activeStudy ? (
        <div className="glass-card p-6 border-l-4 border-brand-500 bg-white dark:bg-darkCard">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Studi Kasus Aktif</p>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{activeStudy.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 max-w-4xl">{activeStudy.description}</p>
            </div>
            {!hasData && (
              <Link 
                to="/criteria" 
                className="inline-flex items-center gap-2 self-start md:self-center py-2.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/10 hover:shadow-lg transition-all"
              >
                <span>Lengkapi Kriteria & Alternatif</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Belum Ada Studi Kasus Aktif</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            Untuk memulai perhitungan SPK, silakan buat studi kasus baru terlebih dahulu.
          </p>
          <Link 
            to="/studies" 
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-all"
          >
            <span>Mulai Buat Studi Kasus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Analytics Dashboard Grid */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Main Chart comparison */}
          <div className="glass-card p-6 lg:col-span-2 space-y-6 bg-white dark:bg-darkCard">
            <div className="flex items-center justify-between border-b border-lightBorder dark:border-darkBorder pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Perbandingan Nilai Alternatif</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metode Normalisasi</span>
            </div>
            
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis domain={[0, 1]} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                    className="dark:border-slate-800"
                  />
                  <Legend />
                  <Bar dataKey="SAW" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="WP" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="TOPSIS" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Criteria weight Pie chart */}
          <div className="glass-card p-6 space-y-6 bg-white dark:bg-darkCard">
            <div className="flex items-center justify-between border-b border-lightBorder dark:border-darkBorder pb-4">
              <div className="flex items-center gap-2.5">
                <PieIcon className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Bobot Kriteria</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total = 1.0</span>
            </div>

            <div className="h-60 w-full flex items-center justify-center text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {weightData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {weightData.map((w, idx) => (
                <div key={w.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-500 dark:text-slate-400 truncate">{w.name} ({(w.value * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart mapping alternatives performance */}
          <div className="glass-card p-6 space-y-6 bg-white dark:bg-darkCard">
            <div className="flex items-center justify-between border-b border-lightBorder dark:border-darkBorder pb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Radar Performa</h3>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nilai Kriteria</span>
            </div>

            <div className="h-60 w-full flex items-center justify-center text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#94a3b8" />
                  {alternatives.map((alt, idx) => (
                    <Radar
                      key={alt.id}
                      name={alt.name}
                      dataKey={alt.name}
                      stroke={COLORS[idx % COLORS.length]}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Summary Panel */}
          <div className="glass-card p-6 lg:col-span-2 space-y-6 bg-white dark:bg-darkCard">
            <div className="flex items-center justify-between border-b border-lightBorder dark:border-darkBorder pb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Rangkuman Rekomendasi Teratas</h3>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">5 Metode Standard</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-lightBorder dark:border-darkBorder text-xs text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-4">Nama Alternatif</th>
                    <th className="py-3 px-4 text-center">SAW Rank</th>
                    <th className="py-3 px-4 text-center">WP Rank</th>
                    <th className="py-3 px-4 text-center">TOPSIS Rank</th>
                    <th className="py-3 px-4 text-center">SMART Rank</th>
                    <th className="py-3 px-4 text-center">PM Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
                  {alternatives.map(alt => {
                    const sawR = sawResults.find(r => r.alternativeId === alt.id)?.rank || '-';
                    const wpR = wpResults.find(r => r.alternativeId === alt.id)?.rank || '-';
                    const topR = topsisResults.find(r => r.alternativeId === alt.id)?.rank || '-';
                    const smR = smartResults.find(r => r.alternativeId === alt.id)?.rank || '-';
                    const pmR = pmResults.find(r => r.alternativeId === alt.id)?.rank || '-';

                    return (
                      <tr key={alt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">{alt.name}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block w-6 py-0.5 rounded-md text-xs font-bold ${sawR === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'text-slate-500'}`}>{sawR}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block w-6 py-0.5 rounded-md text-xs font-bold ${wpR === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'text-slate-500'}`}>{wpR}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block w-6 py-0.5 rounded-md text-xs font-bold ${topR === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'text-slate-500'}`}>{topR}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block w-6 py-0.5 rounded-md text-xs font-bold ${smR === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'text-slate-500'}`}>{smR}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block w-6 py-0.5 rounded-md text-xs font-bold ${pmR === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'text-slate-500'}`}>{pmR}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {bestAlternative && (
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Berdasarkan metode SAW, rekomendasi terbaik adalah <strong className="font-bold">{bestAlternative.name}</strong> dengan nilai preferensi <strong className="font-bold">{bestAlternative.score}</strong>.
                  </span>
                </div>
                <Link to="/calculate" className="text-xs font-bold hover:underline flex items-center gap-1">
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
