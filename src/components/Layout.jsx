import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderGit2, 
  ClipboardList, 
  Users, 
  Calculator, 
  FileSpreadsheet, 
  Menu, 
  X, 
  LogOut, 
  Lock,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { studies, currentStudyId, setCurrentStudyId, activeStudy } = useDatabase();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Studi Kasus', path: '/studies', icon: FolderGit2 },
    { name: 'Kriteria', path: '/criteria', icon: ClipboardList, requiresStudy: true },
    { name: 'Alternatif', path: '/alternatives', icon: Users, requiresStudy: true },
    { name: 'Input Penilaian', path: '/scores', icon: FileSpreadsheet, requiresStudy: true },
    { name: 'Perhitungan & Hasil', path: '/calculate', icon: Calculator, requiresStudy: true }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex bg-lightBg dark:bg-darkBg transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 lg:static flex flex-col
        bg-white dark:bg-darkCard border-r border-lightBorder dark:border-darkBorder
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/50">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsSidebarOpen(false)}>
            <div className="p-2 rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">SDSS</span>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Decision Support</p>
            </div>
          </Link>
          <button 
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 lg:hidden text-slate-400"
            onClick={toggleSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isDisabled = item.requiresStudy && !currentStudyId;

            return (
              <Link
                key={item.name}
                to={isDisabled ? '#' : item.path}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                  } else {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : isDisabled
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-brand-500 dark:hover:text-brand-400'
                  }
                `}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {!isDisabled && isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Admin Profile) */}
        <div className="p-4 border-t border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30">
          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged In As</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:border-brand-500 dark:hover:border-brand-400 transition-colors text-sm font-semibold"
            >
              <Lock className="w-4 h-4" />
              <span>Login Admin</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-lightBorder dark:border-darkBorder bg-white/70 dark:bg-darkCard/70 backdrop-blur-md sticky top-0 z-30 no-print">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl border border-lightBorder dark:border-darkBorder lg:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Study Selector Dropdown */}
            {studies.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Studi Kasus:</span>
                <select
                  value={currentStudyId}
                  onChange={(e) => setCurrentStudyId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 py-1.5 px-3.5 pr-8 rounded-xl border border-lightBorder dark:border-darkBorder focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer transition-all duration-200"
                >
                  {studies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-lightBorder dark:bg-darkBorder hidden sm:block"></div>
            {activeStudy && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-semibold px-3 py-1.5 rounded-full border border-brand-100 dark:border-brand-900/30">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Active Model Loaded</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
