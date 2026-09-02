'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, HardDrive, MemoryStick, Timer, Globe, Users, BookOpen, Sparkles,
  Terminal, ChevronRight, Activity, Download, Upload, Shield, Bell, Zap,
  Server, RefreshCw, Play, Square, Radio, Database, Monitor, GlobeIcon,
  Lock, Wifi, BarChart3, TrendingUp, GraduationCap, Star, Clock,
  ArrowUpRight, Settings, Command, Eye, EyeOff, ChevronDown, Layers,
  Network, AlertTriangle, CheckCircle, XCircle, Copy, FileText,
  MessageSquare, ExternalLink, Trash2, StopCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface SystemMetrics {
  cpu: number; memory: number; memoryUsed: number; memoryTotal: number;
  disk: number; diskUsed: number; diskTotal: number; uptime: string;
  loadAvg: number[]; processes: number; networkRx: number; networkTx: number;
}

interface PlatformStats {
  courses: number; users: number; classrooms: number; enrollments: number;
  revenue: number; activeUsers: number; lessonsCompleted: number; avgRating: number;
  recentActivity: { id: number; type: string; message: string; time: string; status: string }[];
  recentCourses: any[];
}

interface CommandLog {
  id: number; command: string; output: string; timestamp: Date; type: 'info' | 'success' | 'error' | 'system';
}

// ─── Utility ─────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatNumber(n: number): string { return n.toLocaleString(); }

// ─── Holographic Particles ───────────────────────────────────────
function JarvisParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, duration: Math.random() * 10 + 8,
    delay: Math.random() * 5, opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            background: `rgba(0, 180, 255, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(0, 180, 255, ${p.opacity * 0.5})` }}
          animate={{ y: [0, -30, 0, -20, 0], x: [0, 15, -10, 5, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity * 1.2, p.opacity] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Radar Scanner ───────────────────────────────────────────────
function RadarScanner() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-36 h-36 rounded-full border border-cyan-500/10" />
      <div className="absolute w-28 h-28 rounded-full border border-cyan-500/15" />
      <div className="absolute w-20 h-20 rounded-full border border-cyan-500/20" />
      <div className="absolute w-12 h-12 rounded-full border border-cyan-500/25" />
      <div className="absolute w-5 h-5 rounded-full bg-cyan-400/10" />
      <div className="absolute w-36 h-36 jarvis-scan" style={{ transformOrigin: 'center' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-1/2"
          style={{ background: 'linear-gradient(to bottom, rgba(0,200,255,0.8), transparent)', boxShadow: '0 0 8px rgba(0,200,255,0.3)' }} />
      </div>
      <div className="relative w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(0,200,255,0.5)]" />
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sublabel, trend, color = 'cyan', delay = 0 }: {
  icon: any; label: string; value: string | number; sublabel?: string;
  trend?: 'up' | 'down' | 'neutral'; color?: string; delay?: number;
}) {
  const c = color as keyof typeof colorMap;
  const colorMap = { cyan: 'border-cyan-500/20 bg-cyan-500/5', amber: 'border-amber-500/20 bg-amber-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5', violet: 'border-violet-500/20 bg-violet-500/5',
    rose: 'border-rose-500/20 bg-rose-500/5', blue: 'border-blue-500/20 bg-blue-500/5' };
  const iconColors = { cyan: 'text-cyan-400', amber: 'text-amber-400', emerald: 'text-emerald-400',
    violet: 'text-violet-400', rose: 'text-rose-400', blue: 'text-blue-400' };
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingUp : null;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.5, ease: 'easeOut' }}
      className={`relative rounded-lg border ${colorMap[c] || colorMap.cyan} p-4 backdrop-blur-sm overflow-hidden group`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 jarvis-shimmer" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-cyan-400/70 uppercase tracking-widest">{label}</span>
          <Icon className={`h-4 w-4 ${iconColors[c] || iconColors.cyan} opacity-70`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono">{value}</span>
          {trend && trendIcon && React.createElement(trendIcon, { className: `h-4 w-4 ${trendColor}` })}
        </div>
        {sublabel && <p className="text-xs text-cyan-400/50 mt-1 font-mono">{sublabel}</p>}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </motion.div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────
function ProgressBar({ value, label, color = 'cyan' }: { value: number; label: string; color?: string }) {
  const colors: Record<string, string> = { cyan: 'bg-cyan-400 shadow-[0_0_10px_rgba(0,200,255,0.3)]',
    amber: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]', emerald: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
    rose: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.3)]', violet: 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.3)]' };
  const c = colors[color] || colors.cyan;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-cyan-400/60">{label}</span>
        <span className="text-cyan-400/80 font-mono">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-cyan-500/10 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${c}`} />
      </div>
    </div>
  );
}

// ─── Service Status ──────────────────────────────────────────────
function ServiceIndicator({ name, status, health }: { name: string; status: string; health?: string }) {
  const isOk = status === 'operational' || health === 'OK';
  return (
    <div className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-cyan-500/5 transition-colors group">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        {isOk && <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-30" />}
      </div>
      <span className="text-xs text-cyan-400/70 flex-1">{name}</span>
      <span className={`text-[10px] font-mono ${isOk ? 'text-emerald-400/60' : 'text-rose-400/60'}`}>
        {isOk ? 'ONLINE' : 'DOWN'}
      </span>
    </div>
  );
}

// ─── Activity Feed Item ──────────────────────────────────────────
function ActivityItem({ event, index }: { event: any; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="flex items-start gap-3 py-1.5 border-b border-cyan-500/5 last:border-0">
      <div className="mt-0.5"><Activity className="h-3 w-3 text-cyan-400/50" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-cyan-400/80 truncate">{event.message}</p>
        <p className="text-[10px] text-cyan-400/40 mt-0.5">{event.time}</p>
      </div>
    </motion.div>
  );
}

// ─── Course Row ──────────────────────────────────────────────────
function CourseRow({ course }: { course: any }) {
  const rating = (course.rating / 100).toFixed(1);
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-cyan-500/5 transition-colors group">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 shrink-0">
        <BookOpen className="h-4 w-4 text-cyan-400/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-cyan-300 truncate">{course.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-cyan-400/40">{course.status}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${course.isPro ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {course.isPro ? 'PRO' : 'Free'}
          </span>
          {course.enrollmentCount > 0 && (
            <span className="text-[10px] text-cyan-400/40">{course.enrollmentCount} enrolled</span>
          )}
        </div>
      </div>
      <a href={`/admin/courses/${course.id}`} target="_blank" rel="noopener noreferrer"
        className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Settings className="h-3 w-3 text-cyan-400/50" />
      </a>
    </div>
  );
}

// ─── Log Viewer ──────────────────────────────────────────────────
function LogViewer() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/command-center/logs');
      const data = await res.json();
      setLogs(data.logs || ['No logs available']);
    } catch { setLogs(['Failed to fetch logs']); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">PLATFORM LOGS</h2>
        </div>
        <button onClick={fetchLogs} disabled={loading}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-cyan-400/60 hover:bg-cyan-500/10 transition-colors">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> REFRESH
        </button>
      </div>
      <div ref={scrollRef} className="h-32 overflow-y-auto font-mono text-[10px] space-y-0.5 jarvis-scrollbar bg-black/30 rounded p-2">
        {logs.length === 0 ? (
          <span className="text-cyan-400/30">Loading logs...</span>
        ) : (
          logs.map((line, i) => (
            <div key={i} className={`${line.includes('error') ? 'text-rose-400/80' : line.includes('warn') ? 'text-amber-400/80' : 'text-cyan-400/50'}`}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Command Input ───────────────────────────────────────────────
function CommandInput({ onExecute, systemMetrics, platformStats: pStats }: {
  onExecute: (cmd: string) => void; systemMetrics: SystemMetrics | null; platformStats: PlatformStats | null;
}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandLog[]>([
    { id: 0, command: 'SYSTEM INIT', output: 'J.A.R.V.I.S. Command Center v2.0 — Live data active', timestamp: new Date(), type: 'system' },
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTerminal, setShowTerminal] = useState(true);

  const executeCommand = useCallback(async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === 'clear') { setHistory([]); setInput(''); return; }

    let output = '';
    let type: 'info' | 'success' | 'error' | 'system' = 'info';

    if (cmd === 'help') {
      output = ['Available commands:', '  help       — Show this help', '  status     — Show live system status',
        '  stats      — Show platform statistics', '  clear      — Clear terminal', '  deploy     — Rebuild & restart platform',
        '  backup     — Run PostgreSQL backup', '  cache      — Clear Redis cache', '  restart    — Restart PM2 + Nginx',
        '  health     — Run full health check', '  whoami     — Display current user', '  uptime     — Show system uptime',
        '', '  Actions can also use the Quick Action buttons above.'].join('\n');
      type = 'system';
    } else if (cmd === 'status' && systemMetrics) {
      output = `CPU: ${systemMetrics.cpu}% | MEM: ${systemMetrics.memory}% (${systemMetrics.memoryUsed}GB/${systemMetrics.memoryTotal}GB) | DISK: ${systemMetrics.disk}% | Uptime: ${systemMetrics.uptime} | Processes: ${systemMetrics.processes}`;
      type = 'success';
    } else if (cmd === 'stats' && pStats) {
      output = `Courses: ${pStats.courses} | Users: ${pStats.users} | Classrooms: ${pStats.classrooms} | Enrollments: ${pStats.enrollments} | Active: ${pStats.activeUsers}`;
      type = 'success';
    } else if (cmd === 'whoami') {
      output = 'Operator: abjales | Role: admin | Session: command-center | IP: secured';
      type = 'info';
    } else if (['deploy', 'backup', 'cache', 'restart', 'health'].includes(cmd)) {
      setLoading(cmd);
      try {
        const res = await fetch('/api/command-center/action', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: cmd }),
        });
        const data = await res.json();
        output = data.success
          ? `✓ ${data.message}`
          : `✗ ${data.message}`;
        type = data.success ? 'success' : 'error';
      } catch (err: any) {
        output = `✗ Action failed: ${err.message}`;
        type = 'error';
      }
      setLoading(null);
    } else {
      output = `Command not recognized: "${raw}". Type 'help' for available commands.`;
      type = 'error';
    }

    const newLog: CommandLog = { id: Date.now(), command: cmd, output, timestamp: new Date(), type };
    setHistory(prev => [...prev, newLog]);
    setHistoryIndex(-1);
    setInput('');
    if (onExecute) onExecute(cmd);
  }, [onExecute, systemMetrics, pStats]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { executeCommand(input); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmds = history.filter(h => h.command !== 'SYSTEM INIT').map(h => h.command);
      if (cmds.length > 0) {
        const ni = historyIndex + 1 < cmds.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(ni);
        setInput(cmds[cmds.length - 1 - ni] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) { const ni = historyIndex - 1; setHistoryIndex(ni);
        const cmds = history.filter(h => h.command !== 'SYSTEM INIT').map(h => h.command);
        setInput(cmds[cmds.length - 1 - ni] || ''); }
      else { setHistoryIndex(-1); setInput(''); }
    }
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="rounded-lg border border-cyan-500/20 bg-black/40 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400/70">JARVIS_TERMINAL // v2.0</span>
          {loading && <span className="text-[10px] font-mono text-amber-400/70 animate-pulse">RUNNING...</span>}
        </div>
        <button onClick={() => setShowTerminal(!showTerminal)}
          className="p-1 rounded hover:bg-cyan-500/10 transition-colors">
          {showTerminal ? <EyeOff className="h-3.5 w-3.5 text-cyan-400/50" /> : <Eye className="h-3.5 w-3.5 text-cyan-400/50" />}
        </button>
      </div>
      {showTerminal && (
        <>
          <div ref={scrollRef} className="h-40 overflow-y-auto p-3 space-y-1 font-mono text-xs jarvis-scrollbar">
            {history.map(log => (
              <div key={log.id}>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400/40">❯</span>
                  <span className="text-cyan-300">{log.command}</span>
                </div>
                <p className={`ml-4 leading-relaxed whitespace-pre-line ${
                  log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'system' ? 'text-cyan-400' : 'text-cyan-400/70'}`}>{log.output}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border-t border-cyan-500/10 bg-black/20">
            <span className="text-cyan-400 font-mono text-xs">❯</span>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Type a command... (help)"
              className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-cyan-300 placeholder-cyan-500/30"
              spellCheck={false} autoComplete="off" />
            <span className="w-2 h-4 bg-cyan-400 jarvis-blink" />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Quick Action ────────────────────────────────────────────────
function QuickAction({ label, icon: Icon, color, loading, onClick }: {
  label: string; icon: any; color: string; loading?: boolean; onClick: () => void;
}) {
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      onClick={onClick} disabled={loading}
      className="relative group overflow-hidden rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3 text-left transition-all hover:border-cyan-500/30 disabled:opacity-50">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="relative z-10 flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${color} opacity-80`}>
          {loading ? <RefreshCw className="h-4 w-4 text-white animate-spin" /> : <Icon className="h-4 w-4 text-white" />}
        </div>
        <span className="text-xs font-medium text-cyan-400/80">{label}</span>
      </div>
    </motion.button>
  );
}

// ─── Clock ───────────────────────────────────────────────────────
function JarvisClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="text-right">
      <p className="text-2xl font-bold text-white font-mono tracking-wider">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </p>
      <p className="text-xs text-cyan-400/50 font-mono">
        {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function CommandCenterPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'terminal'>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Fetch system metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/command-center/system');
        const data = await res.json();
        setMetrics(data);
      } catch { /* keep last known */ }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/command-center/stats');
        const data = await res.json();
        if (data && !data.error) setStats(data);
      } catch { /* keep last known */ }
      setConnecting(false);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const res = await fetch('/api/command-center/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
      });
      const data = await res.json();
      showNotification(data.message, data.success ? 'success' : 'error');
    } catch (err: any) {
      showNotification(`Action failed: ${err.message}`, 'error');
    }
    setActionLoading(null);
  };

  const quickActions = [
    { label: 'Deploy Platform', icon: Server, action: 'deploy', color: 'from-cyan-500 to-blue-600' },
    { label: 'Restart Services', icon: RefreshCw, action: 'restart', color: 'from-amber-500 to-orange-600' },
    { label: 'Clear Cache', icon: Database, action: 'cache', color: 'from-violet-500 to-purple-600' },
    { label: 'Run Backup', icon: Download, action: 'backup', color: 'from-emerald-500 to-teal-600' },
    { label: 'Generate Course', icon: Sparkles, action: 'generate', color: 'from-pink-500 to-rose-600' },
    { label: 'Health Check', icon: Activity, action: 'health', color: 'from-sky-500 to-indigo-600' },
  ];

  const serviceHealth = metrics ? [
    { name: 'Elimu Platform', status: 'operational' },
    { name: 'OpenMAIC Engine', status: 'operational' },
    { name: 'PostgreSQL', status: 'operational' },
    { name: 'Redis Cache', status: 'operational' },
    { name: 'PM2 Cluster', status: 'operational' },
    { name: 'Nginx Proxy', status: 'operational' },
    { name: 'System Load', status: (metrics.loadAvg[0] || 0) < 2 ? 'operational' : 'warning' },
  ] : [];

  const m = metrics || { cpu: 0, memory: 0, memoryUsed: 0, memoryTotal: 0, disk: 0, diskUsed: 0, diskTotal: 0,
    uptime: '--', loadAvg: [0, 0, 0], processes: 0, networkRx: 0, networkTx: 0 };

  return (
    <div className="h-full jarvis-grid flex flex-col">
      {/* ═══ Top Bar ═══ */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-cyan-500/10 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400">
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider">J.A.R.V.I.S.</h1>
              <p className="text-[10px] text-cyan-400/50 font-mono tracking-widest">COMMAND CENTER</p>
            </div>
          </div>
          <div className="hidden md:flex items-center ml-8 gap-1">
            {(['overview', 'courses', 'terminal'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-cyan-400/50 hover:text-cyan-400/80 hover:bg-cyan-500/5'}`}>
                {tab === 'overview' ? 'Overview' : tab === 'courses' ? 'Courses' : 'Terminal'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400/70 tracking-wider">LIVE</span>
          </div>
          <JarvisClock />
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg bg-black/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(0,180,255,0.1)]">
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-400" /> :
               notification.type === 'error' ? <XCircle className="h-4 w-4 text-rose-400" /> :
               <Activity className="h-4 w-4 text-cyan-400" />}
              <span className="text-sm text-cyan-300">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {connecting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 jarvis-scan" />
              <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-4 rounded-full bg-cyan-500/10" />
            </div>
            <p className="text-sm font-mono text-cyan-400/70 animate-pulse">CONNECTING TO SYSTEMS...</p>
          </div>
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar">
        <div className="p-6 space-y-6">

          {/* ── Top Stats Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <MetricCard icon={Users} label="ACTIVE USERS" value={stats?.activeUsers || '--'} trend="up" color="cyan" delay={0} />
            <MetricCard icon={BookOpen} label="COURSES" value={stats?.courses || '--'} trend="up" color="blue" delay={1} />
            <MetricCard icon={Sparkles} label="CLASSROOMS" value={stats?.classrooms || '--'} trend="up" color="violet" delay={2} />
            <MetricCard icon={GraduationCap} label="ENROLLMENTS" value={stats ? formatNumber(stats.enrollments) : '--'} trend="up" color="emerald" delay={3} />
            <MetricCard icon={Star} label="RATING" value={stats?.avgRating ? stats.avgRating.toFixed(1) : '--'} sublabel="average" color="amber" delay={4} />
            <MetricCard icon={BarChart3} label="LESSONS" value={stats ? formatNumber(stats.lessonsCompleted) : '--'} trend="up" color="rose" delay={5} />
            <MetricCard icon={TrendingUp} label="REVENUE" value={stats?.revenue ? `$${formatNumber(stats.revenue)}` : '--'} color="emerald" delay={6} />
            <MetricCard icon={Activity} label="CPU" value={`${m.cpu}%`} sublabel={`${m.processes} procs`} color={m.cpu > 70 ? 'rose' : 'cyan'} delay={7} />
          </div>

          {/* ── Main Grid ── */}
          <div className="grid xl:grid-cols-3 gap-6">
            {/* Left + Center */}
            <div className="xl:col-span-2 space-y-6">
              {/* System Resources */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">SYSTEM RESOURCES</h2>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-cyan-400/40 font-mono">
                    <RefreshCw className="h-3 w-3" />
                    REFRESH 5S
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-cyan-400/70" />
                        <span className="text-xs font-mono text-cyan-400/70">CPU</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono">{m.cpu}%</span>
                    </div>
                    <ProgressBar value={m.cpu} label="Load" color={m.cpu > 70 ? 'rose' : 'cyan'} />
                    <div className="flex justify-between text-[10px] font-mono text-cyan-400/40">
                      <span>Load: {m.loadAvg.map(l => l.toFixed(2)).join(', ')}</span>
                      <span>{m.processes} processes</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-amber-400/70" />
                        <span className="text-xs font-mono text-amber-400/70">MEMORY</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono">{m.memory}%</span>
                    </div>
                    <ProgressBar value={m.memory} label="Usage" color={m.memory > 80 ? 'rose' : 'amber'} />
                    <div className="flex justify-between text-[10px] font-mono text-cyan-400/40">
                      <span>{m.memoryUsed} GB / {m.memoryTotal} GB</span>
                      <span>RAM</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-rose-400/70" />
                        <span className="text-xs font-mono text-rose-400/70">DISK</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono">{m.disk}%</span>
                    </div>
                    <ProgressBar value={m.disk} label="Usage" color={m.disk > 80 ? 'rose' : 'rose'} />
                    <div className="flex justify-between text-[10px] font-mono text-cyan-400/40">
                      <span>{m.diskUsed} GB / {m.diskTotal} GB</span>
                      <span>SSD</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-emerald-400/70" />
                        <span className="text-xs font-mono text-emerald-400/70">NETWORK</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono">UP</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1"><Download className="h-3 w-3 text-emerald-400/60" /> <span className="text-cyan-400/60">RX</span></span>
                        <span className="text-cyan-400/80">{formatBytes(m.networkRx || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1"><Upload className="h-3 w-3 text-cyan-400/60" /> <span className="text-cyan-400/60">TX</span></span>
                        <span className="text-cyan-400/80">{formatBytes(m.networkTx || 0)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-cyan-400/40">
                      <span>eth0</span>
                      <span>1 Gbps</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">QUICK ACTIONS</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickActions.map(a => (
                    <QuickAction key={a.action} label={a.label} icon={a.icon} color={a.color}
                      loading={actionLoading === a.action} onClick={() => handleAction(a.action)} />
                  ))}
                </div>
              </motion.div>

              {/* Log Viewer + Terminal */}
              <LogViewer />

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <CommandInput onExecute={(cmd) => {
                  if (['deploy', 'restart', 'backup', 'cache', 'health'].includes(cmd)) handleAction(cmd);
                }} systemMetrics={metrics} platformStats={stats} />
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Radar */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-5 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4 self-start">
                  <Radio className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">SCANNING</h2>
                </div>
                <div className="py-4"><RadarScanner /></div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-cyan-400/40 mt-2">
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ACTIVE</span>
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400/30" /> IDLE</span>
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400/30" /> PENDING</span>
                </div>
              </motion.div>

              {/* Services */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">SERVICES</h2>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/60">{serviceHealth.filter(s => s.status === 'operational').length}/{serviceHealth.length} ONLINE</span>
                </div>
                <div className="space-y-0.5">
                  {serviceHealth.map(s => <ServiceIndicator key={s.name} {...s} />)}
                </div>
              </motion.div>

              {/* Uptime */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">UPTIME</h2>
                </div>
                <p className="text-lg font-bold text-white font-mono">{m.uptime}</p>
                <p className="text-[10px] font-mono text-cyan-400/40 mt-1">Since last reboot</p>
              </motion.div>

              {/* Activity Feed */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">ACTIVITY</h2>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400/40">LIVE</span>
                </div>
                <div className="max-h-56 overflow-y-auto jarvis-scrollbar">
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((event, i) => <ActivityItem key={event.id || i} event={event} index={i} />)
                  ) : (
                    <p className="text-xs text-cyan-400/40 text-center py-4">No recent activity</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* ── Course Overview (tab content) ── */}
          {activeTab === 'courses' && stats?.recentCourses && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-cyan-500/15 bg-black/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-cyan-300 tracking-wider">COURSE MANAGEMENT</h2>
                  <span className="text-[10px] font-mono text-cyan-400/40 ml-2">{stats.courses} total</span>
                </div>
                <a href="/admin/courses/new" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                  <Sparkles className="h-3 w-3" /> NEW COURSE
                </a>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto jarvis-scrollbar">
                {stats.recentCourses.length === 0 ? (
                  <p className="text-xs text-cyan-400/40 text-center py-8">No courses yet. Create one in the admin panel.</p>
                ) : (
                  stats.recentCourses.map((course: any) => <CourseRow key={course.id} course={course} />)
                )}
              </div>
            </motion.div>
          )}

          {/* ── Terminal Tab ── */}
          {activeTab === 'terminal' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <CommandInput onExecute={(cmd) => {
                if (['deploy', 'restart', 'backup', 'cache', 'health'].includes(cmd)) handleAction(cmd);
              }} systemMetrics={metrics} platformStats={stats} />
            </motion.div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* ═══ Bottom Bar ═══ */}
      <div className="relative z-20 flex items-center justify-between px-6 py-2 border-t border-cyan-500/10 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-[10px] font-mono text-cyan-400/40">
          <span>J.A.R.V.I.S. v2.0</span>
          <span className="w-px h-3 bg-cyan-500/20" />
          <span>ELIMU AFRICA</span>
          <span className="w-px h-3 bg-cyan-500/20" />
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SECURE</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-cyan-400/40">
          <span>CPU: {m.cpu}%</span>
          <span>MEM: {m.memory}%</span>
          <span>DISK: {m.disk}%</span>
          <span className="w-px h-3 bg-cyan-500/20" />
          <span className="text-emerald-400/60">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </div>
  );
}