import { useState, useEffect } from 'react';
import { Palette, CheckCircle2, RefreshCcw, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { vibrate } from '../lib/utils';

const THEMES = [
  { name: 'Cyan Pulse', primary: '#6dddff', container: '#00d2fd', onContainer: '#004352' },
  { name: 'Neon Green', primary: '#2ff801', container: '#2be800', onContainer: '#003300' },
  { name: 'Cyber Purple', primary: '#d946ef', container: '#c026d3', onContainer: '#4a044e' },
  { name: 'Sunset Orange', primary: '#fb923c', container: '#f97316', onContainer: '#431407' },
  { name: 'Crimson Red', primary: '#fb7185', container: '#e11d48', onContainer: '#4c0519' },
  { name: 'Golden Yellow', primary: '#fde047', container: '#eab308', onContainer: '#422006' },
];

export default function SettingsView() {
  const [activeTheme, setActiveTheme] = useState(THEMES[0].name);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('obsidian_pulse_theme');
    if (savedTheme) {
      setActiveTheme(savedTheme);
      applyTheme(THEMES.find(t => t.name === savedTheme) || THEMES[0]);
    }
  }, []);

  const applyTheme = (theme: typeof THEMES[0]) => {
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-primary-container', theme.container);
    document.documentElement.style.setProperty('--color-on-primary-container', theme.onContainer);
    // Also update secondary to match primary for a unified look, or keep it distinct
    document.documentElement.style.setProperty('--color-secondary', theme.primary);
    document.documentElement.style.setProperty('--color-secondary-dim', theme.container);
  };

  const handleSelectTheme = (theme: typeof THEMES[0]) => {
    vibrate(30);
    setActiveTheme(theme.name);
    localStorage.setItem('obsidian_pulse_theme', theme.name);
    applyTheme(theme);
  };

  const confirmResetData = () => {
    localStorage.removeItem('obsidian_pulse_sessions');
    vibrate([50, 50, 50]);
    setShowConfirmModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const resetData = () => {
    vibrate(20);
    setShowConfirmModal(true);
  };

  return (
    <div className="flex-1 px-6 pt-4 w-full max-w-3xl mx-auto relative md:pb-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 mt-8 md:mt-0"
      >
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-2 text-on-surface">Settings</h1>
        <p className="text-on-surface-variant text-sm font-label tracking-wider uppercase">Customize your experience</p>
      </motion.div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-primary" size={24} />
          <h2 className="text-xl font-bold font-headline text-on-surface">Theme Colors</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {THEMES.map((theme, i) => (
            <motion.button
              key={theme.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => handleSelectTheme(theme)}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                activeTheme === theme.name 
                  ? 'bg-surface-container-highest border-primary' 
                  : 'bg-surface-container-low border-white/5 hover:border-white/20'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                {activeTheme === theme.name && <CheckCircle2 size={20} style={{ color: theme.onContainer }} />}
              </div>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                {theme.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <RefreshCcw className="text-error" size={24} />
          <h2 className="text-xl font-bold font-headline text-on-surface">Data Management</h2>
        </div>
        
        <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-headline font-bold text-on-surface">Clear Session History</h3>
            <p className="text-sm text-on-surface-variant mt-1">This will permanently delete all your focus stats and history.</p>
          </div>
          <button 
            onClick={resetData}
            className="px-6 py-3 bg-error/10 text-error hover:bg-error/20 rounded-lg font-label text-xs uppercase tracking-widest font-bold transition-colors"
          >
            Clear Data
          </button>
        </div>
      </motion.section>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-highest border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4 text-error">
                <AlertTriangle size={32} />
                <h3 className="text-xl font-bold font-headline">Clear Data?</h3>
              </div>
              <p className="text-on-surface-variant text-sm mb-8">
                This action cannot be undone. All your session history, focus stats, and records will be permanently deleted.
              </p>
              <div className="flex gap-4 justify-end">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-lg font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmResetData}
                  className="px-4 py-2 rounded-lg font-label text-xs uppercase tracking-widest font-bold bg-error text-white hover:bg-error/80 transition-colors"
                >
                  Delete Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-surface-container-highest border border-primary/20 text-on-surface px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
          >
            <CheckCircle2 size={18} className="text-primary" />
            <span className="font-label text-xs uppercase tracking-widest font-bold">Data Cleared Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
