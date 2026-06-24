import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Validation Schema
const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(4, 'Password minimal 4 karakter')
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.error || 'Email atau password salah.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Background blobs for premium glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/20">
            <BrainCircuit className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Login Admin SDSS
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Masuk untuk mengelola basis data pengambilan keputusan.
          </p>
        </div>

        {/* Card Panel */}
        <div className="bg-white dark:bg-darkCard border border-lightBorder dark:border-darkBorder shadow-2xl rounded-3xl p-8 space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@sdss.com"
                  {...register('email')}
                  className={`w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-lightBorder dark:border-darkBorder focus:ring-brand-500/10 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password admin"
                  {...register('password')}
                  className={`w-full pl-11 pr-11 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-500 focus:ring-red-500/10' : 'border-lightBorder dark:border-darkBorder focus:ring-brand-500/10 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all pt-3 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/10 hover:shadow-lg'}`}
            >
              {isSubmitting ? 'Memeriksa Kredensial...' : 'Masuk Ke Dashboard'}
            </button>
          </form>

          {/* Help hint */}
          <div className="pt-4 border-t border-lightBorder dark:border-darkBorder text-center">
            <p className="text-xs text-slate-400">
              Kredensial Default: <strong className="font-semibold text-slate-500 dark:text-slate-300">admin@sdss.com</strong> / password: <strong className="font-semibold text-slate-500 dark:text-slate-300">admin</strong>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="text-xs font-bold text-brand-500 hover:underline">
            Kembali ke Dashboard Mode Baca
          </Link>
        </div>
      </div>
    </div>
  );
}
