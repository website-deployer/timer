import { useState, useEffect } from 'react';
import { Timer, Activity, CheckCircle2, Code, Terminal, Edit3, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { vibrate } from '../lib/utils';
import { getStats, Session } from '../lib/stats';

export default function StatsView() {
  const [stats, setStats] = useState(() => getStats());
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    setStats(getStats());
  }, []);

  const formatSessionTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Adjust so Monday is 0
  const chartLabels = Array.from({ length: 7 }, (_, i) => daysOfWeek[(todayIndex - 6 + i + 7) % 7]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 md:pb-8">
      {/* Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 mt-8 md:mt-0"
      >
        <h1 className="text-5xl font-extrabold tracking-tighter uppercase text-primary mb-2 font-headline">Performance Metrics</h1>
        <p className="text-on-surface-variant font-label tracking-widest text-xs uppercase">Weekly Productivity Audit / Last 7 Days</p>
      </motion.div>

      {/* Bento Grid Stats */}
      {stats.allSessions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-12 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center mb-12 min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-6">
            <Activity className="text-on-surface-variant" size={32} />
          </div>
          <h3 className="text-xl font-bold font-headline text-on-surface mb-2">No Data Yet</h3>
          <p className="text-on-surface-variant font-label text-sm max-w-md">
            Complete your first focus session to unlock your performance metrics, weekly distribution, and deep focus score.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12"
        >
          
          {/* Primary Metric: Total Focused Hours */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="md:col-span-2 lg:col-span-2 bg-surface-container-low p-8 rounded-xl border border-white/5 flex flex-col justify-between group hover:bg-surface-container-highest transition-colors duration-300"
        >
          <div>
            <Timer className="text-primary-container mb-4" size={24} />
            <h3 className="text-on-surface-variant font-label text-xs tracking-widest uppercase mb-1">Total Focused Hours</h3>
          </div>
          <div className="mt-8">
            <span className="text-6xl font-bold tracking-tighter text-on-surface leading-none font-digital">{stats.totalFocusHours}</span>
            <span className="text-primary-container font-bold text-xl ml-2 tracking-tighter font-headline">HRS</span>
          </div>
        </motion.div>

        {/* Kinetic Data Point: Average Session */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="md:col-span-2 lg:col-span-2 bg-surface-container-low p-8 rounded-xl border border-white/5 flex flex-col justify-between hover:bg-surface-container-highest transition-colors duration-300"
        >
          <div>
            <Activity className="text-secondary mb-4" size={24} />
            <h3 className="text-on-surface-variant font-label text-xs tracking-widest uppercase mb-1">Average Session Length</h3>
          </div>
          <div className="mt-8">
            <span className="text-6xl font-bold tracking-tighter text-on-surface leading-none font-digital">{stats.avgSessionLength}</span>
            <span className="text-on-surface-variant font-bold text-xl ml-2 tracking-tighter font-headline">MIN</span>
          </div>
          <div className="mt-4 text-on-surface-variant text-xs uppercase tracking-widest font-label">Target: 60 MIN</div>
        </motion.div>

        {/* Compact Data Point: Completed Sessions */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="md:col-span-2 lg:col-span-2 bg-surface-container-low p-8 rounded-xl border border-white/5 flex flex-col justify-between hover:bg-surface-container-highest transition-colors duration-300"
        >
          <div>
            <CheckCircle2 className="text-primary mb-4" size={24} />
            <h3 className="text-on-surface-variant font-label text-xs tracking-widest uppercase mb-1">Completed Sessions</h3>
          </div>
          <div className="mt-8">
            <span className="text-6xl font-bold tracking-tighter text-on-surface leading-none font-digital">{stats.completedSessions}</span>
          </div>
        </motion.div>

        {/* Main Chart: Weekly Focus Distribution */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="md:col-span-4 lg:col-span-4 bg-surface-container-low p-8 rounded-xl border border-white/5 min-h-[400px] flex flex-col justify-between border-l-4 border-l-primary-container"
        >
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-on-surface font-bold text-xl tracking-tight uppercase font-headline">Weekly Focus Distribution</h3>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest font-label mt-1">Time allocated across last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-container"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant font-label">Focus Hours</span>
            </div>
          </div>
          
          {/* Visual Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-4 px-2">
            {stats.chartData.map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-4 h-full">
                <div className="w-full bg-surface-container-highest h-full relative rounded-t-sm overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                    className="absolute bottom-0 w-full bg-primary-container" 
                  />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase font-label">{chartLabels[index]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Deep Focus Score */}
        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          className="md:col-span-2 lg:col-span-2 glass-panel p-8 rounded-xl border border-primary-container/20 flex flex-col justify-center items-center text-center"
        >
          <h3 className="text-primary font-bold text-xl tracking-tighter uppercase mb-6 font-headline">Deep Focus Score</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="60" stroke="currentColor" strokeWidth="8"></circle>
              <motion.circle 
                initial={{ strokeDashoffset: 376.8 }}
                animate={{ strokeDashoffset: 376.8 - (stats.deepFocusScore / 100) * 376.8 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="text-primary-container" 
                cx="64" cy="64" 
                fill="transparent" 
                r="60" 
                stroke="currentColor" 
                strokeDasharray="376.8" 
                strokeWidth="8" 
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-4xl font-bold text-on-surface font-digital">{stats.deepFocusScore}</span>
          </div>
          <p className="mt-6 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold font-label">
            {stats.deepFocusScore >= 80 ? 'Elite Performance Tier' : stats.deepFocusScore >= 50 ? 'Solid Focus Tier' : 'Building Focus'}
          </p>
        </motion.div>
      </motion.div>
      )}

      {/* Recent Activity Logs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-8 flex justify-between items-end">
          <h2 className="text-2xl font-bold tracking-tighter uppercase text-on-surface font-headline">
            {showAllLogs ? 'All Sessions' : 'Recent Sessions'}
          </h2>
          <button 
            onClick={() => { vibrate(20); setShowAllLogs(!showAllLogs); }} 
            className="text-primary text-xs font-bold uppercase tracking-widest hover:underline font-label"
          >
            {showAllLogs ? 'Show Less' : 'View Full Log'}
          </button>
        </div>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {stats.recentSessions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-on-surface-variant font-label text-sm"
              >
                No recent sessions. Start focusing to see your logs here!
              </motion.div>
            ) : (
              (showAllLogs ? stats.allSessions : stats.recentSessions).map((session, i) => (
                <motion.div 
                  key={session.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="bg-surface-container-low p-6 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-surface-container-highest transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-surface-container-highest p-3 rounded-lg">
                      {session.type === 'focus' ? <Terminal className="text-primary" size={24} /> : <Clock className="text-secondary" size={24} />}
                    </div>
                    <div>
                      <h4 className="text-on-surface font-bold uppercase text-sm tracking-tight font-headline">
                        {session.type === 'focus' ? 'Focus Session' : 'Break'}
                      </h4>
                      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-label mt-1">
                        {formatDate(session.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-on-surface tracking-tighter font-digital">{formatSessionTime(session.duration)}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest font-label mt-1 ${session.type === 'focus' ? 'text-primary' : 'text-secondary'}`}>
                      {session.type === 'focus' ? 'Completed' : 'Rested'}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
}
