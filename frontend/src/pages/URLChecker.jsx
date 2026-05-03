import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, ShieldX, Loader2, Globe, AlertCircle, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import api from '../services/api';

const URLChecker = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/check-url', { url });
      setResult(data);
    } catch (err) {
      setError('Evaluation engine failed to process the request. Ensure URL format is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 ml-64 min-h-screen text-slate-200">
      <header className="mb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-bold text-white heading-premium tracking-tight mb-2">
            Request Evaluation Engine
          </h1>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium tracking-premium uppercase">
            <Zap size={14} className="animate-pulse" /> Live Policy Interception Module
          </div>
        </motion.div>
      </header>

      <div className="max-w-4xl">
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleCheck} 
          className="glass p-2 rounded-[2rem] flex gap-2 border-white/5 mb-12 shadow-2xl relative group"
        >
          <div className="flex-1 flex items-center gap-4 px-6">
            <Globe className="text-slate-500 group-hover:text-cyan-400 transition-colors" size={24} />
            <input
              type="text"
              placeholder="Enter destination URL (e.g., facebook.com, wikipedia.org)..."
              className="bg-transparent border-none outline-none w-full text-white placeholder-slate-500 font-medium text-lg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 disabled:opacity-50 flex items-center gap-2 group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Analyze Request
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass bg-red-500/5 border-red-500/20 p-8 rounded-[2.5rem] flex items-center gap-4 text-red-400 mb-8"
            >
              <AlertCircle size={32} />
              <div>
                <p className="font-bold text-lg heading-premium uppercase tracking-tight">Interception Error</p>
                <p className="opacity-70 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`glass rounded-[3rem] p-10 border-t-8 ${
                result.status === 'ALLOW' ? 'border-t-green-500' : 'border-t-red-500'
              } relative overflow-hidden shadow-2xl`}
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                {result.status === 'ALLOW' ? <ShieldCheck size={180} /> : <ShieldX size={180} />}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-4 rounded-2xl ${result.status === 'ALLOW' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {result.status === 'ALLOW' ? (
                        <ShieldCheck className="text-green-400" size={40} />
                      ) : (
                        <ShieldX className="text-red-400" size={40} />
                      )}
                    </div>
                    <div>
                      <h2 className={`text-5xl font-black heading-premium tracking-tighter ${
                        result.status === 'ALLOW' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ACCESS {result.status === 'ALLOW' ? 'GRANTED' : 'DENIED'}
                      </h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Decision Finalized by Security Layer</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-light px-8 py-6 rounded-3xl text-center border-white/5">
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Threat Category</p>
                  <p className="text-xl font-bold text-white heading-premium uppercase tracking-premium">
                    {result.category || 'Uncategorized'}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 mb-8">
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                  <ShieldAlert size={14} /> Enforcement Logic Reasoning
                </p>
                <p className="text-2xl text-slate-200 font-medium leading-tight italic tracking-tight">
                  "{result.reason}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Processing Node</span>
                  <span className="text-cyan-400 font-mono text-sm font-bold">{result.layer}</span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Execution Time</span>
                  <span className="text-slate-200 font-mono text-sm font-bold">14ms</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-white/5 rounded-[3rem]"
          >
            <Globe size={80} className="text-slate-500 mb-6" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Decision Engine Idle • Waiting for Traffic Request</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default URLChecker;

