import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  AlertCircle,
  Tag,
  HelpCircle
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import Modal from '../components/Modal';

// Validation Schema
const alternativeSchema = z.object({
  name: z.string().min(2, 'Nama alternatif minimal 2 karakter'),
  description: z.string().optional(),
  category: z.string().optional()
});

export default function AlternativeManagement() {
  const { 
    activeStudy, 
    alternatives, 
    saveAlternative, 
    deleteAlternative 
  } = useDatabase();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingAlternative, setEditingAlternative] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(alternativeSchema)
  });

  if (!activeStudy) {
    return (
      <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Users className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Belum Ada Studi Kasus Dipilih</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pilih atau buat studi kasus terlebih dahulu pada menu Studi Kasus untuk mengelola alternatif.
        </p>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingAlternative(null);
    reset({ name: '', description: '', category: '' });
    setIsOpenModal(true);
  };

  const openEditModal = (alt) => {
    setEditingAlternative(alt);
    setValue('name', alt.name);
    setValue('description', alt.description || '');
    setValue('category', alt.category || '');
    setIsOpenModal(true);
  };

  const onSubmit = async (data) => {
    try {
      await saveAlternative({
        ...editingAlternative,
        ...data
      });
      setIsOpenModal(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus alternatif ini? Nilai penilaian alternatif ini akan dihapus secara permanen.')) {
      await deleteAlternative(id);
    }
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(alternatives.map(a => a.category).filter(Boolean))];

  // Filter & Search
  const filteredAlternatives = alternatives.filter(alt => {
    const matchesSearch = alt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (alt.description && alt.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || alt.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAlternatives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlternatives = filteredAlternatives.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Studi Kasus: {activeStudy.name}</span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">Manajemen Alternatif</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daftarkan alternatif pilihan (misalnya merek laptop, kandidat karyawan, nama siswa, dll).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 self-start sm:self-auto py-2.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/10 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Alternatif</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-darkCard p-4 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari alternatif..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Filters and Count */}
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto justify-end">
          {categories.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 py-1.5 px-3 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'Semua Kategori' : cat}</option>
                ))}
              </select>
            </div>
          )}
          <div className="text-xs text-slate-400 font-medium whitespace-nowrap self-end sm:self-center">
            Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredAlternatives.length)} dari {filteredAlternatives.length} data
          </div>
        </div>
      </div>

      {/* Alternatives Table */}
      <div className="glass-card bg-white dark:bg-darkCard">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-400 uppercase font-semibold">
                <th className="py-4 px-6 w-1/4">Nama Alternatif</th>
                <th className="py-4 px-6 w-1/6">Kategori</th>
                <th className="py-4 px-6">Deskripsi / Spesifikasi</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
              {paginatedAlternatives.length > 0 ? (
                paginatedAlternatives.map(alt => (
                  <tr key={alt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{alt.name}</div>
                      <div className="text-xs text-slate-400 mt-1">ID: {alt.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      {alt.category ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 border border-brand-100/30">
                          <Tag className="w-3 h-3" />
                          <span>{alt.category}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Tanpa Kategori</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      <p className="line-clamp-2 text-xs md:text-sm">{alt.description || 'Tidak ada deskripsi.'}</p>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(alt)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(alt.id)}
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
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold">Tidak Ada Alternatif</p>
                      <p className="text-xs text-slate-500">Tambahkan alternatif pilihan untuk memulai proses scoring.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`
                w-9 h-9 text-sm font-bold rounded-xl transition-all
                ${currentPage === i + 1 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                  : 'bg-white dark:bg-darkCard border border-lightBorder dark:border-darkBorder text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={editingAlternative ? 'Edit Alternatif' : 'Tambah Alternatif Baru'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Alternatif</label>
            <input
              type="text"
              placeholder="Contoh: MacBook Pro M3"
              {...register('name')}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border ${errors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-lightBorder dark:border-darkBorder focus:ring-brand-500/10 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Apple, Lenovo, Brand A, Divisi IT, dsb."
              {...register('category')}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi / Spesifikasi Ringkas</label>
            <textarea
              rows={4}
              placeholder="Spesifikasi hardware atau data deskriptif kandidat..."
              {...register('description')}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none"
            />
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
