import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  FolderPlus, 
  Edit2, 
  Trash2, 
  Plus, 
  Search, 
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import Modal from '../components/Modal';

// Validation Schema
const studySchema = z.object({
  name: z.string().min(3, 'Nama studi kasus minimal 3 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter untuk kejelasan konteks')
});

export default function CaseManagement() {
  const { studies, addStudy, updateStudy, deleteStudy, currentStudyId, setCurrentStudyId } = useDatabase();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(studySchema)
  });

  const openAddModal = () => {
    setEditingStudy(null);
    reset();
    setIsOpenModal(true);
  };

  const openEditModal = (study) => {
    setEditingStudy(study);
    setValue('name', study.name);
    setValue('description', study.description);
    setIsOpenModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingStudy) {
        await updateStudy({ ...editingStudy, ...data });
      } else {
        await addStudy(data);
      }
      setIsOpenModal(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus studi kasus ini? Semua kriteria, alternatif, dan nilai yang terkait akan dihapus secara permanen.')) {
      await deleteStudy(id);
    }
  };

  // Filter & Search
  const filteredStudies = studies.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudies = filteredStudies.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Manajemen Studi Kasus</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola studi kasus / permasalahan SPK yang ingin Anda selesaikan.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 self-start sm:self-auto py-2.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/10 hover:shadow-lg transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Tambah Studi Kasus</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-darkCard p-4 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari studi kasus..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-lightBorder dark:border-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredStudies.length)} dari {filteredStudies.length} data
        </div>
      </div>

      {/* Cases Table */}
      <div className="glass-card bg-white dark:bg-darkCard">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-400 uppercase font-semibold">
                <th className="py-4 px-6 w-1/3">Studi Kasus</th>
                <th className="py-4 px-6">Deskripsi</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
              {paginatedStudies.length > 0 ? (
                paginatedStudies.map(study => {
                  const isActive = study.id === currentStudyId;
                  return (
                    <tr 
                      key={study.id} 
                      className={`
                        hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors
                        ${isActive ? 'bg-brand-50/20 dark:bg-brand-950/10' : ''}
                      `}
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{study.name}</div>
                        <div className="text-xs text-slate-400 mt-1">ID: {study.id}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 max-w-sm">
                        <p className="line-clamp-2">{study.description}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setCurrentStudyId(study.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-950/20 border border-lightBorder dark:border-darkBorder transition-colors"
                          >
                            <span>Aktifkan</span>
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(study)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(study.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FolderPlus className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold">Tidak Ada Studi Kasus</p>
                      <p className="text-xs text-slate-500">Buat studi kasus baru untuk memulai analisis.</p>
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
        title={editingStudy ? 'Edit Studi Kasus' : 'Tambah Studi Kasus Baru'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Studi Kasus</label>
            <input
              type="text"
              placeholder="Contoh: Pemilihan Karyawan Terbaik"
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi</label>
            <textarea
              rows={4}
              placeholder="Contoh: Menyeleksi kandidat karyawan berprestasi berdasarkan evaluasi 4 kriteria utama..."
              {...register('description')}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border ${errors.description ? 'border-red-500 focus:ring-red-500/10' : 'border-lightBorder dark:border-darkBorder focus:ring-brand-500/10 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all resize-none`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.description.message}</span>
              </p>
            )}
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
