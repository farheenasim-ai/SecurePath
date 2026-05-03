import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ShieldAlert, Key, Filter, Zap, Globe, Lock, Info, ChevronRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('blacklist');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('General');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchPolicies();
    fetchCategories();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data } = await api.get('/policies/');
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/policies/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCategory = async (name, enabled) => {
    try {
      await api.put(`/policies/categories/${name}`, { enabled: !enabled });
      fetchCategories();
      fetchPolicies();
    } catch (err) {
      alert('Security Layer Breach: Could not toggle category.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/policies/', { type, value, category, reason });
      setValue('');
      setReason('');
      fetchPolicies();
    } catch (err) {
      alert('Security Layer Breach: Could not deploy rule.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/policies/${id}`);
      fetchPolicies();
    } catch (err) {
      alert('Security Layer Breach: Could not decommission rule.');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { x: -10, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <div className="p-8 ml-64 min-h-screen text-slate-200">
      <header className="mb-12">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white heading-premium tracking-tight mb-2">Policy Infrastructure</h1>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium tracking-premium uppercase">
            <ShieldAlert size={14} className="animate-pulse" /> Core Decision Logic Configuration
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Categories Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-[2.5rem] border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Filter className="text-cyan-400" size={20} />
              </div>
              Category Filters
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between p-4 glass-light rounded-2xl border-white/5 transition-all hover:bg-white/5">
                  <div>
                    <p className="text-sm font-bold text-white heading-premium">{cat.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cat.description}</p>
                  </div>
                  <button
                    onClick={() => toggleCategory(cat.name, cat.enabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${
                      cat.enabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-800'
                    }`}
                  >
                    <motion.div 
                      animate={{ x: cat.enabled ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg" 
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Add Rule Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Plus className="text-blue-400" size={20} />
              </div>
              Deploy New Policy
            </h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                {['blacklist', 'keyword'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      type === t ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t === 'blacklist' ? 'Domain' : 'Keyword'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    {type === 'blacklist' ? <Globe size={18} /> : <Key size={18} />}
                  </div>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm font-medium"
                    placeholder={type === 'blacklist' ? 'Target Domain (e.g. meta.com)' : 'Restricted Token...'}
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Filter size={18} />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm font-bold uppercase tracking-widest appearance-none cursor-pointer"
                  >
                    {['General', 'Social Media', 'Adult Content', 'Gambling', 'Entertainment', 'Piracy'].map(c => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Info size={18} />
                  </div>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm font-medium h-24 resize-none"
                    placeholder="Rationale for interception..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-2xl shadow-xl shadow-cyan-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Inject Into Layer <Zap size={14} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Policies List Table */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-10 py-6">Enforcement Rule</th>
                  <th className="px-6 py-6">Class</th>
                  <th className="px-6 py-6">Targeting</th>
                  <th className="px-10 py-6 text-right">Status</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-white/5"
              >
                {policies.map((p) => (
                  <motion.tr 
                    key={p.id} 
                    variants={item}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all">
                          {p.type === 'blacklist' ? <Globe size={18} className="text-cyan-400" /> : <Key size={18} className="text-purple-400" />}
                        </div>
                        <div>
                          <p className="text-white font-black heading-premium text-lg tracking-tight">{p.value}</p>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{p.reason || 'Standard security protocol'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        p.type === 'blacklist' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                        {p.category}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            {policies.length === 0 && !loading && (
              <div className="p-24 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                  <ShieldCheck size={40} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-xs">No Active Overrides</p>
                <p className="text-slate-700 text-[10px] font-bold mt-2">The system is currently using base-layer defaults.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PolicyManagement;

