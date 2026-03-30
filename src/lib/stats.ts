export interface Session {
  id: string;
  duration: number; // in seconds
  type: 'focus' | 'break';
  timestamp: number;
}

const STORAGE_KEY = 'obsidian_pulse_sessions';

export function saveSession(session: Omit<Session, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  const sessions = getSessions();
  const newSession: Session = {
    ...session,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function getStats() {
  const sessions = getSessions();
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  const weeklySessions = sessions.filter(s => s.timestamp >= oneWeekAgo);
  
  const totalFocusSeconds = weeklySessions
    .filter(s => s.type === 'focus')
    .reduce((acc, s) => acc + s.duration, 0);
    
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);
  
  const focusSessions = weeklySessions.filter(s => s.type === 'focus');
  const avgSessionLength = focusSessions.length > 0 
    ? Math.round((totalFocusSeconds / focusSessions.length) / 60) 
    : 0;
    
  const completedSessions = focusSessions.length;

  // Calculate daily distribution for the last 7 days
  const distribution = Array(7).fill(0);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  focusSessions.forEach(s => {
    const sessionDate = new Date(s.timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    const diffTime = todayDate.getTime() - sessionDate.getTime();
    const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysAgo >= 0 && daysAgo < 7) {
      distribution[6 - daysAgo] += s.duration;
    }
  });

  const maxDaily = Math.max(...distribution, 1); // avoid div by 0
  const chartData = distribution.map(val => `${Math.round((val / maxDaily) * 100)}%`);

  const deepFocusScore = Math.min(100, Math.round(
    (totalFocusSeconds / (20 * 3600)) * 50 + (avgSessionLength / 60) * 50
  )) || 0;

  return {
    totalFocusHours,
    avgSessionLength,
    completedSessions,
    chartData,
    deepFocusScore,
    recentSessions: sessions.slice(-5).reverse(),
    allSessions: [...sessions].reverse()
  };
}
