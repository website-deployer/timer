/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Settings, Timer, Clock, SlidersHorizontal, BarChart2 } from 'lucide-react';
import { cn, vibrate } from '@/src/lib/utils';
import TimerView from './views/TimerView';
import StopwatchView from './views/StopwatchView';
import PresetsView from './views/PresetsView';
import StatsView from './views/StatsView';
import SettingsView from './views/SettingsView';

type View = 'timer' | 'stopwatch' | 'presets' | 'stats' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('timer');
  const [timerPreset, setTimerPreset] = useState<number>(25);
  const [presetName, setPresetName] = useState<string | undefined>(undefined);
  const [isGlobalFocusMode, setIsGlobalFocusMode] = useState(false);

  const handleSelectPreset = (minutes: number, name?: string) => {
    setTimerPreset(minutes);
    setPresetName(name);
    setCurrentView('timer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body overflow-x-hidden selection:bg-primary selection:text-on-primary-container">
      {/* TopAppBar */}
      <AnimatePresence>
        {!isGlobalFocusMode && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="w-full top-0 sticky bg-gradient-to-b from-background to-transparent z-[100] flex justify-between items-center px-6 py-4 md:hidden"
          >
            <div className="flex items-center gap-2 text-primary">
              <Timer size={28} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { vibrate(20); setCurrentView('stats'); }} 
                className="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95"
              >
                <History size={24} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => { vibrate(20); setCurrentView('settings'); }} 
                className="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95"
              >
                <Settings size={24} strokeWidth={1.5} />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row w-full h-full relative">
        {/* SideNavBar for Desktop/Tablet */}
        <AnimatePresence>
          {!isGlobalFocusMode && (
            <motion.nav 
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              className="hidden md:flex fixed left-0 top-0 h-full w-20 lg:w-24 flex-col items-center py-8 bg-background/40 backdrop-blur-2xl border-r border-white/5 shadow-[8px_0_32px_rgba(0,0,0,0.4)] z-[100]"
            >
              <div className="text-primary mb-12 drop-shadow-[0_0_12px_var(--color-primary)]">
                <Timer size={32} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col gap-6 lg:gap-8 flex-1 w-full px-2">
                <NavItem
                  icon={<Timer size={24} strokeWidth={currentView === 'timer' ? 2 : 1.5} />}
                  label="Timer"
                  isActive={currentView === 'timer'}
                  onClick={() => setCurrentView('timer')}
                />
                <NavItem
                  icon={<Clock size={24} strokeWidth={currentView === 'stopwatch' ? 2 : 1.5} />}
                  label="Stopwatch"
                  isActive={currentView === 'stopwatch'}
                  onClick={() => setCurrentView('stopwatch')}
                />
                <NavItem
                  icon={<SlidersHorizontal size={24} strokeWidth={currentView === 'presets' ? 2 : 1.5} />}
                  label="Presets"
                  isActive={currentView === 'presets'}
                  onClick={() => setCurrentView('presets')}
                />
                <NavItem
                  icon={<BarChart2 size={24} strokeWidth={currentView === 'stats' ? 2 : 1.5} />}
                  label="Stats"
                  isActive={currentView === 'stats'}
                  onClick={() => setCurrentView('stats')}
                />
              </div>
              <div className="mt-auto flex flex-col gap-4 w-full px-2">
                <NavItem
                  icon={<Settings size={24} strokeWidth={currentView === 'settings' ? 2 : 1.5} />}
                  label="Settings"
                  isActive={currentView === 'settings'}
                  onClick={() => setCurrentView('settings')}
                />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 flex flex-col relative w-full h-full transition-all duration-300",
          !isGlobalFocusMode && "pb-32 md:pb-0 md:pl-20 lg:pl-24"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full h-full"
            >
              {currentView === 'timer' && (
                <TimerView 
                  presetMinutes={timerPreset} 
                  presetName={presetName} 
                  onFocusModeChange={setIsGlobalFocusMode}
                />
              )}
              {currentView === 'stopwatch' && <StopwatchView />}
              {currentView === 'presets' && <PresetsView onSelectPreset={handleSelectPreset} />}
              {currentView === 'stats' && <StatsView />}
              {currentView === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* BottomNavBar */}
      <AnimatePresence>
        {!isGlobalFocusMode && (
          <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 w-full z-[100] pb-safe bg-background/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_32px_rgba(109,221,255,0.06)] md:hidden"
          >
            <div className="flex justify-around items-center h-20 px-4">
              <NavItem
                icon={<Timer size={24} strokeWidth={currentView === 'timer' ? 2 : 1.5} />}
                label="Timer"
                isActive={currentView === 'timer'}
                onClick={() => setCurrentView('timer')}
              />
              <NavItem
                icon={<Clock size={24} strokeWidth={currentView === 'stopwatch' ? 2 : 1.5} />}
                label="Stopwatch"
                isActive={currentView === 'stopwatch'}
                onClick={() => setCurrentView('stopwatch')}
              />
              <NavItem
                icon={<SlidersHorizontal size={24} strokeWidth={currentView === 'presets' ? 2 : 1.5} />}
                label="Presets"
                isActive={currentView === 'presets'}
                onClick={() => setCurrentView('presets')}
              />
              <NavItem
                icon={<BarChart2 size={24} strokeWidth={currentView === 'stats' ? 2 : 1.5} />}
                label="Stats"
                isActive={currentView === 'stats'}
                onClick={() => setCurrentView('stats')}
              />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      
      {/* Active Status Glow (Global) */}
      <AnimatePresence>
        {!isGlobalFocusMode && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_var(--color-primary)] z-[110] md:hidden"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden md:block fixed top-0 left-20 lg:left-24 w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_20px_var(--color-primary)] z-[110]"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  const handleClick = () => {
    vibrate(30);
    onClick();
  };
  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-200 rounded-xl",
        isActive ? "text-primary bg-primary/10" : "text-on-surface-variant hover:bg-white/5"
      )}
    >
      {icon}
      <span className="font-label text-[10px] uppercase tracking-[0.05em] mt-1 font-medium">
        {label}
      </span>
    </button>
  );
}
