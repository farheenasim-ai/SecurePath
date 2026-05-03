import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, ShieldCheck, ShieldX, User, Globe, Calendar, Clock, Terminal, ChevronRight, Activity } from 'lucide-react';
import api from '../services/api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/logs/');
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-8 ml-64 min-h-screen text-slate-200">
      <header className="mb-12">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white heading-premium tracking-tight mb-2">Audit Registry</h1>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium tracking-premium uppercase">
            <Activity size={14} className="animate-pulse" /> Real-time Security Event Stream
          </div>
        </motion.div>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <th className="px-10 py-6 border-b border-white/5">Initiator</th>
                <th className="px-6 py-6 border-b border-white/5">Target Resource</th>
                <th className="px-6 py-6 border-b border-white/5">Security Decision</th>
                <th className="px-6 py-6 border-b border-white/5">Classification</th>
                <th className="px-10 py-6 border-b border-white/5 text-right">Event Timestamp</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={container}
              initial="hidden"
              animate="show"
              className="divide-y divide-white/5"
            >
              {logs.map((log) => {
                const ts = formatDate(log.timestamp);
                return (
                  <motion.tr 
                    key={log._id} 
                    variants={item}
                    className="hover:bg-white/5 transition-all group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all">
                          <User size={18} className="text-slate-400 group-hover:text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-white font-black heading-premium text-base tracking-tight">{log.username}</p>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-slate-600 flex-shrink-0" />
                          <span className="text-slate-200 font-medium truncate text-sm" title={log.url}>{log.url}</span>
                        </div>
                        {log.decision === 'BLOCK' && (
                          <div className="flex items-center gap-1.5 text-red-500/60 text-[10px] font-bold uppercase tracking-tighter ml-5">
                            <Terminal size={10} /> {log.reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`flex items-center gap-2 w-fit px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border transition-all ${
                        log.decision === 'ALLOW' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20 group-hover:bg-red-500/20'
                      }`}>
                        {log.decision === 'ALLOW' ? <ShieldCheck size={12} /> : <ShieldX size={12} />}
                        {log.decision}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.category ? 'bg-cyan-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        {log.category || 'Standard'}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-white font-black heading-premium text-sm">
                          <Clock size={12} className="text-slate-500" />
                          {ts.time}
                        </div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                          {ts.date}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          {logs.length === 0 && !loading && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-30">
                <History size={48} className="text-slate-400" />
              </div>
              <div>
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm">Registry Synchronized</p>
                <p className="text-slate-700 text-[10px] font-bold mt-2 uppercase tracking-widest">No external traffic events captured in current session</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <footer className="mt-12 text-center">
        <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.5em]">
          End of Audit Stream
        </p>
      </footer>
    </div>
  );
};

export default Logs;

