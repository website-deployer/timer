import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, vibrate } from '../lib/utils';

export default function StopwatchView() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<{ id: number; time: number; diff: number }[]>([]);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = (timeNow: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = timeNow - previousTimeRef.current;
      setTime((prevTime) => prevTime + deltaTime);
    }
    previousTimeRef.current = timeNow;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
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
    previousTimeRef.current = undefined;
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

  const formatDiff = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `+${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center pt-12 md:pt-0 md:justify-center px-6 w-full max-w-5xl mx-auto flex-1 md:h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 lg:gap-24">
        {/* Drastic Circular Stopwatch Display */}
        <div className="relative w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[400px] aspect-square flex flex-col items-center justify-center mb-8 md:mb-0 mt-4 md:mt-0 shrink-0">
        
        {/* SVG Rings */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full drop-shadow-2xl overflow-visible">
          {/* Outer Track (60 seconds) */}
          <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
          
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
                  className="text-secondary" 
                  transform={`rotate(${angle} 150 150)`} 
                />
              );
            })}
          </AnimatePresence>

          {/* Outer Track Progress (Seconds) */}
          <circle 
            cx="150" cy="150" r="140" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            className="text-primary/40"
            strokeDasharray={2 * Math.PI * 140}
            strokeDashoffset={2 * Math.PI * 140 * (1 - (time % 60000) / 60000)}
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />

          {/* Outer Track Dot */}
          <g transform={`rotate(${((time % 60000) / 60000) * 360} 150 150)`}>
            <circle cx="150" cy="10" r="8" fill="currentColor" className="text-primary" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
            <circle cx="150" cy="10" r="3" fill="white" />
          </g>

          {/* Inner Track (1 second) - The "Drastic" fast part */}
          <circle cx="150" cy="150" r="115" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/5" />
          
          {/* Inner Track Progress (Milliseconds) */}
          <circle 
            cx="150" cy="150" r="115" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-secondary/30"
            strokeDasharray={2 * Math.PI * 115}
            strokeDashoffset={2 * Math.PI * 115 * (1 - (time % 1000) / 1000)}
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />

          {/* Inner Track Dot */}
          <g transform={`rotate(${((time % 1000) / 1000) * 360} 150 150)`}>
            <circle cx="150" cy="35" r="5" fill="currentColor" className="text-secondary" style={{ filter: 'drop-shadow(0 0 6px currentColor)' }} />
          </g>
        </svg>

        {/* Lap Ripple Effect */}
        <AnimatePresence>
          {laps.length > 0 && (
            <motion.div
              key={`ripple-${laps.length}`}
              initial={{ opacity: 0.8, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-4 border-secondary pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Ambient Pulse when running */}
        <AnimatePresence>
          {isRunning && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.05, 1] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-primary/20 blur-3xl -z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Digital Display inside the circle */}
        <motion.div 
          animate={{ 
            scale: isRunning ? 1.05 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm rounded-full w-[200px] h-[200px] border border-white/5 shadow-inner"
        >
          <div className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tighter leading-none text-on-surface flex items-baseline font-digital">
            <span>{formatTime(time).split('.')[0]}</span>
          </div>
          <div className="text-secondary text-[clamp(1.5rem,3vw,2rem)] font-bold font-digital mt-1">
            .{formatTime(time).split('.')[1] || '00'}
          </div>
          <div className="text-on-surface-variant font-label tracking-[0.3em] uppercase text-[9px] mt-4">
            {isRunning ? "Active" : "Ready"}
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
                  {laps.map((lap, index) => {
                    const isBest = index === laps.length - 1 && laps.length > 1; // Simplistic best lap logic for demo
                    return (
                      <motion.div 
                        key={lap.id}
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, scale: 0.9, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-5 bg-surface-container-low rounded-xl relative overflow-hidden border border-white/5"
                      >
                        {isBest && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>}
                        <div className="flex items-center gap-6">
                          <span className="text-xs font-bold text-on-surface-variant font-label w-6 text-right">
                            {(laps.length - index).toString().padStart(2, '0')}
                          </span>
                          <div>
                            <div className={cn("text-lg font-bold tracking-tight font-digital", isBest ? "text-secondary" : "text-on-surface")}>
                              {formatTime(lap.time)}
                            </div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label mt-1">
                              {isBest ? 'Personal Best' : 'Split Time'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-sm font-medium font-headline", isBest ? "text-on-surface-variant" : "text-error")}>
                            {formatDiff(lap.diff)}
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
