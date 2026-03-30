import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, vibrate, playBeep } from '../lib/utils';
import { saveSession } from '../lib/stats';

interface TimerViewProps {
  presetMinutes?: number;
  presetName?: string;
  onFocusModeChange?: (isFocus: boolean) => void;
}

export default function TimerView({ presetMinutes = 25, presetName, onFocusModeChange }: TimerViewProps) {
  const [timeLeft, setTimeLeft] = useState(presetMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(presetMinutes * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAfk, setIsAfk] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [currentPresetName, setCurrentPresetName] = useState<string | undefined>(presetName);
  const [showCelebration, setShowCelebration] = useState(false);

  // AFK Detection
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetAfk = () => {
      setIsAfk(false);
      onFocusModeChange?.(false);
      clearTimeout(timeout);
      if (isActive) {
        timeout = setTimeout(() => {
          setIsAfk(true);
          onFocusModeChange?.(true);
        }, 10000); // 10 seconds AFK
      }
    };

    window.addEventListener('mousemove', resetAfk);
    window.addEventListener('keydown', resetAfk);
    window.addEventListener('touchstart', resetAfk);
    resetAfk();

    return () => {
      window.removeEventListener('mousemove', resetAfk);
      window.removeEventListener('keydown', resetAfk);
      window.removeEventListener('touchstart', resetAfk);
      clearTimeout(timeout);
    };
  }, [isActive]);

  useEffect(() => {
    setTotalTime(presetMinutes * 60);
    setTimeLeft(presetMinutes * 60);
    setIsActive(false);
    setCurrentPresetName(presetName);
  }, [presetMinutes, presetName]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setShowCelebration(true);
      vibrate([100, 100, 100, 100, 300]); // Completion haptic pattern
      if (soundEnabled) {
        playBeep(880, 200, 0.2);
        setTimeout(() => playBeep(880, 200, 0.2), 300);
        setTimeout(() => playBeep(1108.73, 400, 0.2), 600);
      }
      
      // Save session
      saveSession({
        duration: totalTime,
        type: totalTime >= 15 * 60 ? 'focus' : 'break'
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, soundEnabled]);

  const toggleTimer = () => {
    vibrate(isActive ? 40 : 60);
    setIsActive(!isActive);
  };
  const resetTimer = () => {
    vibrate([30, 50, 30]);
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const setPreset = (minutes: number) => {
    vibrate(40);
    setIsActive(false);
    setTotalTime(minutes * 60);
    setTimeLeft(minutes * 60);
    setCurrentPresetName(undefined);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSessionLabel = (seconds: number) => {
    if (currentPresetName) return currentPresetName;
    const minutes = seconds / 60;
    if (minutes <= 5) return "Short Break";
    if (minutes <= 15) return "Long Break";
    if (minutes <= 25) return "Deep Work Session";
    return "Extended Focus";
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center px-6 relative flex-1">
      <AnimatePresence>
        {isAfk ? (
          <motion.div 
            key="afk-mode"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background overflow-hidden"
          >
            {/* Subtle background pulse */}
            <motion.div 
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
            />
            
            <div className="flex flex-col items-center z-10 w-full px-8 md:px-24">
              <motion.span 
                layoutId="timer-text"
                className="font-digital text-[24vw] md:text-[20vw] font-bold tracking-tighter text-on-surface timer-glow leading-none"
              >
                {formatTime(timeLeft)}
              </motion.span>
              
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="w-full max-w-5xl h-1 md:h-2 bg-surface-container-highest rounded-full mt-12 md:mt-16 overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </motion.div>

              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ delay: 0.6 }}
                className="font-label text-xs md:text-sm uppercase tracking-[0.5em] text-secondary mt-8 md:mt-12 font-medium animate-pulse"
              >
                Deep Focus Mode Active
              </motion.span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="normal-mode"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            {/* Background Decorative Element */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
              <span className="font-digital text-[30rem] font-bold leading-none select-none">
                {Math.floor(totalTime / 60)}
              </span>
            </div>

            <section className="w-full max-w-md md:max-w-4xl flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10 mt-8 md:mt-0 md:h-[calc(100vh-4rem)]">
              {/* Timer Display Container */}
              <div className="relative flex items-center justify-center shrink-0 w-full md:w-auto">
                {/* Desktop Circular Progress (hidden on mobile) */}
                <div className="hidden md:flex relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] items-center justify-center">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-outline-variant opacity-20"></div>
                  
                  {/* Active Progress Ring (SVG) */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 300 300">
                    <circle
                      className="text-primary drop-shadow-[0_0_8px_var(--color-primary)] transition-all duration-1000 ease-linear"
                      cx="150"
                      cy="150"
                      fill="none"
                      r={120}
                      stroke="currentColor"
                      strokeDasharray={2 * Math.PI * 120}
                      strokeDashoffset={(2 * Math.PI * 120) - (progress / 100) * (2 * Math.PI * 120)}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Shared Timer Text Component */}
                <div className={cn(
                  "flex flex-col items-center",
                  "md:absolute md:inset-0 md:justify-center"
                )}>
                  <motion.span 
                    layoutId="timer-text"
                    className="font-digital text-7xl md:text-[6rem] lg:text-[8rem] font-bold tracking-tighter text-on-surface timer-glow leading-none"
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary mt-2 font-medium">
                    {getSessionLabel(totalTime)}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full flex flex-col items-center gap-10 md:items-start md:max-w-sm">
                <div className="flex items-center gap-8 md:gap-6">
                  {/* Reset */}
                  <button 
                    onClick={resetTimer}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-all active:scale-90"
                  >
                    <RotateCcw size={24} />
                  </button>
                  
                  {/* Play/Pause Primary CTA */}
                  <button 
                    onClick={toggleTimer}
                    className="w-24 h-24 rounded-full flex items-center justify-center bg-primary text-on-primary-container glow-primary hover:scale-105 active:scale-95 transition-all"
                  >
                    {isActive ? (
                      <Pause size={40} fill="currentColor" />
                    ) : (
                      <Play size={40} fill="currentColor" className="ml-2" />
                    )}
                  </button>
                  
                  {/* Sound Toggle */}
                  <button 
                    onClick={() => { vibrate(20); setSoundEnabled(!soundEnabled); }}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90",
                      soundEnabled ? "bg-surface-container-highest text-on-surface" : "bg-surface-container-low text-on-surface-variant border border-white/5"
                    )}
                  >
                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                  </button>
                </div>

                {/* Presets Quick Selection */}
                <div className="w-full max-w-md">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 px-2 md:px-0">
                    {Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map((mins) => (
                      <button 
                        key={mins}
                        onClick={() => setPreset(mins)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-[10px] md:text-xs font-label uppercase tracking-widest transition-all whitespace-nowrap",
                          totalTime === mins * 60 && !currentPresetName
                            ? "bg-primary/10 border-primary/30 text-primary" 
                            : "glass-panel border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary/40"
                        )}
                      >
                        {mins}m
                      </button>
                    ))}
                    <button 
                      onClick={() => { vibrate(20); setShowCustomModal(true); }}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[10px] md:text-xs font-label uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5",
                        ![5,10,15,20,25,30,35,40,45,50,55,60].includes(totalTime / 60) && !currentPresetName
                          ? "bg-primary/10 border-primary/30 text-primary" 
                          : "glass-panel border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary/40"
                      )}
                    >
                      <Settings2 size={12} /> Custom
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Time Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-low border border-white/10 p-6 rounded-2xl w-full max-w-sm relative"
            >
              <button 
                onClick={() => setShowCustomModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Custom Time</h3>
              
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="text-5xl font-digital font-bold text-primary">
                  {customMinutes} <span className="text-xl text-on-surface-variant">min</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="120" 
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <button
                onClick={() => {
                  setPreset(customMinutes);
                  setShowCustomModal(false);
                }}
                className="w-full py-3 rounded-xl bg-primary text-on-primary-container font-bold font-label uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Set Timer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md overflow-hidden"
          >
            {/* Particles */}
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerWidth : 1000) * 0.8, 
                  y: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.8,
                  scale: Math.random() * 1.5 + 0.5,
                  opacity: 0,
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1, 
                  ease: "easeOut",
                  delay: Math.random() * 0.2
                }}
                className="absolute w-3 h-3 rounded-full md:w-4 md:h-4 pointer-events-none"
                style={{
                  backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
                  boxShadow: `0 0 10px hsl(${Math.random() * 360}, 80%, 60%)`
                }}
              />
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1.2 }}
              className="text-primary drop-shadow-[0_0_60px_var(--color-primary)] mb-8 z-10"
            >
              <Sparkles size={120} className="fill-transparent stroke-[1.5]" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
              className="font-headline text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-300% animate-gradient mb-4 timer-glow text-center z-10"
              style={{ backgroundSize: '200% auto', animation: 'pulse 3s linear infinite' }}
            >
              Session Complete!
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-on-surface-variant text-xl md:text-2xl mb-12 font-medium tracking-wide z-10"
            >
              Great work staying focused.
            </motion.p>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px var(--color-primary)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.7 }}
              onClick={() => {
                vibrate(40);
                setShowCelebration(false);
                resetTimer();
              }}
              className="px-12 py-4 rounded-full bg-primary text-on-primary-container font-label uppercase tracking-[0.2em] font-bold text-lg glow-primary hover:bg-primary/90 transition-all z-10"
            >
              Continue
            </motion.button>

            {/* Background Animated Rings */}
            <motion.div
              animate={{ scale: [1, 3, 5], opacity: [0.8, 0, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 m-auto w-48 h-48 rounded-full border-4 border-primary/40 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 2, 4], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2.5, delay: 0.4, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 m-auto w-48 h-48 rounded-full border-4 border-primary/30 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 3], opacity: [0.3, 0, 0] }}
              transition={{ duration: 2.5, delay: 0.8, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 m-auto w-48 h-48 rounded-full border-4 border-primary/20 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
