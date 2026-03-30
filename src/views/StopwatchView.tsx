import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, vibrate } from '../lib/utils';

export default function StopwatchView() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<{ id: number; time: number; diff: number }[]>([]);
  useEffect(() => {
    let animationFrameId: number;
    let lastTime: number | undefined;

    const tick = (timeNow: number) => {
      if (lastTime !== undefined) {
        const deltaTime = timeNow - lastTime;
        setTime((prevTime) => prevTime + deltaTime);
      }
      lastTime = timeNow;
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isRunning) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning]);

  const toggleStopwatch = () => {
    vibrate(isRunning ? 40 : 60);
    setIsRunning(!isRunning);
  };
  
  const resetStopwatch = () => {
    vibrate([30, 50, 30]);
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    vibrate(30);
    if (time === 0) return;
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const diff = time - lastLapTime;
    setLaps([{ id: Date.now(), time, diff }, ...laps]);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };



  return (
    <div className="flex flex-col items-center pt-12 md:pt-0 md:justify-center px-6 w-full max-w-5xl mx-auto flex-1 md:h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 lg:gap-24">
        {/* Drastic Circular Stopwatch Display */}
        <div className="relative w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[400px] aspect-square flex flex-col items-center justify-center mb-8 md:mb-0 mt-4 md:mt-0 shrink-0">
        
        {/* SVG Rings with Advanced Effects */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_rgba(var(--color-primary),0.2)] overflow-visible">
          <defs>
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-intense" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>
            <linearGradient id="secondary-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-secondary)" />
              <stop offset="100%" stopColor="var(--color-primary)" />
            </linearGradient>
          </defs>

          {/* Precision Tick Marks */}
          {Array.from({ length: 120 }).map((_, i) => {
             const angle = (i * 3) * (Math.PI / 180);
             const isMajor = i % 10 === 0;
             const isMedium = i % 5 === 0;
             const rInner = isMajor ? 130 : isMedium ? 135 : 138;
             const rOuter = 142;
             const x1 = 150 + rInner * Math.sin(angle);
             const y1 = 150 - rInner * Math.cos(angle);
             const x2 = 150 + rOuter * Math.sin(angle);
             const y2 = 150 - rOuter * Math.cos(angle);
             return (
               <line 
                 key={`tick-${i}`} 
                 x1={x1} y1={y1} x2={x2} y2={y2} 
                 stroke="currentColor" 
                 strokeWidth={isMajor ? 2.5 : 1} 
                 className={cn("transition-opacity duration-300", isMajor ? "text-white/40" : isMedium ? "text-white/20" : "text-white/10")} 
               />
             )
          })}
          
          {/* Outer Track Base */}
          <circle cx="150" cy="150" r="142" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/5" />
          
          {/* Lap markers on Outer Track */}
          <AnimatePresence>
            {laps.map(lap => {
              const angle = ((lap.time % 60000) / 60000) * 360;
              return (
                <motion.line 
                  key={lap.id}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  x1="150" y1="2" x2="150" y2="18" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  className="text-secondary drop-shadow-[0_0_8px_var(--color-secondary)]" 
                  transform={`rotate(${angle} 150 150)`} 
                />
              );
            })}
          </AnimatePresence>

          {/* Outer Track Progress (Seconds) with Comet Tail */}
          <circle 
            cx="150" cy="150" r="142" 
            fill="none" 
            stroke="url(#primary-gradient)" 
            strokeWidth="6" 
            filter="url(#glow)"
            strokeDasharray={2 * Math.PI * 142}
            strokeDashoffset={2 * Math.PI * 142 * (1 - (time % 60000) / 60000)}
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />

          {/* Outer Track Intense Head Dot */}
          <g transform={`rotate(${((time % 60000) / 60000) * 360} 150 150)`}>
            <circle cx="150" cy="8" r="8" fill="var(--color-primary)" filter="url(#glow-intense)" />
            <circle cx="150" cy="8" r="3" fill="#ffffff" />
          </g>

          {/* Inner Track (1 second precision) */}
          <circle cx="150" cy="150" r="115" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-white/10" />
          
          {/* Inner Track Progress (Milliseconds) */}
          <circle 
            cx="150" cy="150" r="115" 
            fill="none" 
            stroke="url(#secondary-gradient)" 
            strokeWidth="3" 
            filter="url(#glow)"
            strokeDasharray={2 * Math.PI * 115}
            strokeDashoffset={2 * Math.PI * 115 * (1 - (time % 1000) / 1000)}
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />

          {/* Inner Track Head Dot */}
          <g transform={`rotate(${((time % 1000) / 1000) * 360} 150 150)`}>
            <circle cx="150" cy="35" r="5" fill="var(--color-secondary)" filter="url(#glow-intense)" />
          </g>
        </svg>

        {/* Lap Ripple Effect */}
        <AnimatePresence>
          {laps.slice(0, 3).map((lap) => (
            <motion.div
              key={`ripple-${lap.id}`}
              initial={{ opacity: 0.8, scale: 0.8, borderWidth: '8px' }}
              animate={{ opacity: 0, scale: 1.8, borderWidth: '0px' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-secondary pointer-events-none drop-shadow-[0_0_20px_var(--color-secondary)]"
            />
          ))}
        </AnimatePresence>

        {/* Ambient Pulse when running */}
        <AnimatePresence>
          {isRunning && (
            <motion.div 
              key="nebula"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1, rotate: 180 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-10 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 blur-3xl -z-10 pointer-events-none mix-blend-screen"
            />
          )}
        </AnimatePresence>

        {/* CSS Rotating Gear */}
        <div
          className="absolute inset-4 rounded-full border-[2px] border-dashed border-white/20 pointer-events-none flex items-center justify-center animate-spin"
          style={{ animationDuration: '30s', animationPlayState: isRunning ? 'running' : 'paused' }}
        >
            <div
              className="w-full h-full rounded-full border-[1px] border-dotted border-primary/30 scale-[0.85] animate-spin"
              style={{ animationDuration: '20s', animationDirection: 'reverse', animationPlayState: isRunning ? 'running' : 'paused' }}
            />
        </div>

        {/* Digital Display inside the circle with animated 3D press effect */}
        <motion.div 
          animate={{ 
            scale: isRunning ? 1 : 0.98,
            boxShadow: isRunning ? "inset 0 0 40px rgba(0,0,0,0.6), 0 0 30px rgba(var(--color-primary-rgb), 0.2)" : "inset 0 0 20px rgba(0,0,0,0.4), 0 0 0px transparent"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md rounded-full w-[220px] h-[220px] border border-white/10"
        >
          <div className="text-[clamp(3rem,6vw,4.5rem)] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 flex items-baseline font-digital filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] mt-4">
            <span>{formatTime(time).split('.')[0]}</span>
          </div>
          <div className="text-secondary text-[clamp(1.5rem,3vw,2rem)] font-bold font-digital mt-[-4px] tracking-widest filter drop-shadow-[0_0_8px_var(--color-secondary)]">
            .{formatTime(time).split('.')[1] || '00'}
          </div>
          <div className="text-on-surface-variant font-label tracking-[0.4em] uppercase text-[10px] mt-4 font-bold flex items-center gap-2">
            {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse shadow-[0_0_5px_var(--color-error)]" />}
            {isRunning ? "Running" : "Standby"}
          </div>
        </motion.div>
      </div>

      {/* Controls: Obsidian Modular Buttons */}
      <div className="flex flex-col w-full max-w-sm gap-8">
          <div className="grid grid-cols-3 gap-4 w-full">
            {/* Lap Button */}
            <button 
          onClick={addLap}
          disabled={!isRunning}
          className="h-24 bg-surface-container-low rounded-xl text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95 flex flex-col items-center justify-center gap-2 border border-white/5 disabled:opacity-50 disabled:active:scale-100"
        >
          <Flag size={28} />
          <span className="text-[10px] uppercase font-bold tracking-widest font-label">Lap</span>
        </button>
        
        {/* Start/Stop Button (Neon Green) */}
        <button 
          onClick={toggleStopwatch}
          className="h-24 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary hover:bg-secondary/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 glow-secondary"
        >
          {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          <span className="text-[10px] uppercase font-black tracking-widest font-label">{isRunning ? 'Stop' : 'Start'}</span>
        </button>
        
        {/* Reset Button */}
        <button 
          onClick={resetStopwatch}
          className="h-24 bg-surface-container-low rounded-xl text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95 flex flex-col items-center justify-center gap-2 border border-white/5"
        >
          <RotateCcw size={28} />
          <span className="text-[10px] uppercase font-bold tracking-widest font-label">Reset</span>
            </button>
          </div>

          {/* Recent Laps: Editorial Data Grid */}
          {laps.length > 0 && (
            <section className="w-full">
              <div className="flex justify-between items-end mb-6 px-2">
                <h2 className="text-xl font-bold tracking-tighter uppercase text-on-surface font-headline">Recent Laps</h2>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label">Session_091</span>
              </div>
              <div className="space-y-3 max-h-[40vh] md:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {laps.map((lap, i) => ({ ...lap, lapNumber: laps.length - i }))
                    .sort((a, b) => a.diff - b.diff)
                    .map((lap, index) => {
                      const isBest = index === 0 && laps.length > 1; 
                      return (
                        <motion.div 
                          key={lap.id}
                          initial={{ opacity: 0, y: -20, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, scale: 0.9, height: 0 }}
                          transition={{ duration: 0.3 }}
                          layout
                          className="flex items-center justify-between p-5 bg-surface-container-low rounded-xl relative overflow-hidden border border-white/5"
                        >
                          {isBest && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>}
                          <div className="flex items-center gap-6">
                            <span className="text-xs font-bold text-on-surface-variant font-label w-6 text-right">
                              {lap.lapNumber.toString().padStart(2, '0')}
                            </span>
                          <div>
                            <div className={cn("text-lg font-bold tracking-tight font-digital", isBest ? "text-secondary" : "text-on-surface")}>
                              {formatTime(lap.diff)}
                            </div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label mt-1">
                              {isBest ? 'Personal Best' : 'Lap Time'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className={cn("text-sm font-medium font-headline", "text-on-surface-variant")}>
                            {formatTime(lap.time)}
                          </div>
                          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label mt-1">
                            Total
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
