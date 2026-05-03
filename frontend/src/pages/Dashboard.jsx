import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { ShieldCheck, ShieldX, Activity, Globe, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/alerts/')
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen ml-64 text-cyan-500">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Activity size={40} />
      </motion.div>
    </div>
  );

  if (!stats) return (
    <div className="p-8 ml-64 text-red-400 glass rounded-3xl m-8">
      Error loading dashboard data. Please check your connection.
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="p-8 ml-64 min-h-screen text-slate-200">
      <header className="mb-10 flex justify-between items-end">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2 heading-premium tracking-tight">Analytics Dashboard</h1>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            System Operational • Real-time Monitoring
          </div>
        </motion.div>
        
        <div className="flex gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {['overview', 'reports', 'alerts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-premium transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-4 grid-rows-2 gap-6 h-[700px]"
          >
            {/* Main Stats Card */}
            <motion.div variants={item} className="col-span-2 row-span-1 glass p-8 rounded-[2.5rem] relative group border-white/5 hover:border-cyan-500/30 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-cyan-500/10 rounded-2xl">
                  <Activity className="text-cyan-400" size={32} />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1 rounded-full">
                  <TrendingUp size={14} /> +12%
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-semibold mb-2 tracking-premium uppercase">Total Traffic Intercepted</h3>
              <p className="text-6xl font-black text-white heading-premium tracking-tighter">{stats.total}</p>
              <div className="absolute bottom-8 right-8 opacity-20 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={40} className="text-cyan-400" />
              </div>
            </motion.div>

            {/* Small Stat 1 */}
            <motion.div variants={item} className="col-span-1 row-span-1 glass p-6 rounded-[2.5rem] border-white/5 hover:border-green-500/30 transition-all duration-500">
              <div className="p-3 bg-green-500/10 w-fit rounded-xl mb-4">
                <ShieldCheck className="text-green-400" size={24} />
              </div>
              <h3 className="text-slate-500 text-xs font-bold tracking-premium uppercase mb-1">Safe</h3>
              <p className="text-4xl font-bold text-white heading-premium tracking-tight">{stats.allowed}</p>
            </motion.div>

            {/* Small Stat 2 */}
            <motion.div variants={item} className="col-span-1 row-span-1 glass p-6 rounded-[2.5rem] border-white/5 hover:border-red-500/30 transition-all duration-500">
              <div className="p-3 bg-red-500/10 w-fit rounded-xl mb-4">
                <ShieldX className="text-red-400" size={24} />
              </div>
              <h3 className="text-slate-500 text-xs font-bold tracking-premium uppercase mb-1">Blocked</h3>
              <p className="text-4xl font-bold text-white heading-premium tracking-tight">{stats.blocked}</p>
            </motion.div>

            {/* Chart Area Card */}
            <motion.div variants={item} className="col-span-2 row-span-1 glass p-8 rounded-[2.5rem] border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                Traffic Trends
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.activity}>
                    <defs>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#06b6d4" fillOpacity={1} fill="url(#colorReq)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bar Chart Card */}
            <motion.div variants={item} className="col-span-2 row-span-1 glass p-8 rounded-[2.5rem] border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                Security Hotspots
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.top_blocked.map(b => ({ name: b._id, count: b.count }))} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                    <Bar dataKey="count" fill="#ef4444" radius={[0, 8, 8, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white heading-premium tracking-tight">Security Incident Logs</h3>
                <button className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-xl hover:bg-cyan-400/20 transition-all">Export JSON</button>
              </div>
              <div className="overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                      <th className="pb-4">Target Resource</th>
                      <th className="pb-4">Source Identity</th>
                      <th className="pb-4">Threat Level</th>
                      <th className="pb-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.reports.blocked_urls.map(log => (
                      <tr key={log._id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                              <Globe size={14} className="text-slate-400 group-hover:text-cyan-400" />
                            </div>
                            <span className="text-slate-200 font-medium text-sm truncate max-w-xs">{log.url}</span>
                          </div>
                        </td>
                        <td className="py-5 text-slate-400 text-sm font-bold">{log.username}</td>
                        <td className="py-5">
                          <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-[10px] font-black uppercase tracking-tighter border border-red-500/20">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-5 text-right text-slate-500 text-xs font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div 
            key="alerts"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {alerts.map(alert => (
              <motion.div 
                key={alert.id} 
                whileHover={{ y: -5 }}
                className="glass p-8 rounded-[2.5rem] border-l-8 border-l-cyan-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldAlert size={80} className="text-cyan-400" />
                </div>
                <h4 className="text-2xl font-black text-white heading-premium mb-2">{alert.username}</h4>
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-black uppercase border border-cyan-500/30">
                    High Risk Alert
                  </span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    {alert.violations_count} Repeated Violations
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Critical policy breach detected. User attempted to access <span className="text-slate-200 font-mono italic underline decoration-cyan-500/50">{alert.last_violation_url}</span> multiple times within the last hour.
                </p>
                <div className="flex justify-between items-center">
                  <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/10">Dismiss</button>
                  <p className="text-slate-600 text-xs font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                </div>
              </motion.div>
            ))}
            {alerts.length === 0 && (
              <div className="col-span-2 glass p-20 text-center rounded-[3rem] border-white/5 border-dashed border-2">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                  <ShieldCheck size={40} className="text-slate-500" />
                </div>
                <p className="text-slate-600 font-bold text-xl heading-premium uppercase tracking-widest">Clear Perimeter</p>
                <p className="text-slate-500 text-sm mt-2">No critical security alerts detected in the current window.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;

