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
      {/* Top Logo / Header */}
      <AnimatePresence>
        {!isGlobalFocusMode && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="w-full top-0 sticky z-[100] flex justify-center md:justify-start items-center px-6 py-6 pointer-events-none"
          >
            <div className="flex items-center gap-3 text-primary font-bold tracking-widest uppercase bg-background/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 pointer-events-auto">
              <Timer size={20} strokeWidth={2.5} />
              <span className="text-sm">Nova Timer</span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Main Content Area */}
        <main className={cn(
          "flex-1 flex flex-col relative w-full h-full transition-all duration-300",
          !isGlobalFocusMode && "pb-32"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
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

      {/* Universal Bottom Dock */}
      <AnimatePresence>
        {!isGlobalFocusMode && (
          <motion.nav 
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            exit={{ y: 150 }}
            className="fixed bottom-6 md:bottom-10 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-fit z-[100] bg-background/80 md:bg-surface-container/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-3xl"
          >
            <div className="flex items-center justify-between md:justify-center gap-1 md:gap-3 px-3 py-3">
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
              <div className="w-[1px] h-8 bg-white/10 mx-1 hidden md:block" />
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
