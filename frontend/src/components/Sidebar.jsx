import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  FileLock, 
  History, 
  LogOut,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Request Check', path: '/checker', icon: ShieldCheck, roles: ['admin', 'student'] },
    { name: 'Policy Engine', path: '/policies', icon: FileLock, roles: ['admin'] },
    { name: 'Audit Logs', path: '/logs', icon: History, roles: ['admin'] },
  ];

  return (
    <motion.div 
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-64 h-[calc(100vh-2rem)] glass rounded-3xl m-4 flex flex-col p-4 fixed left-0 top-0 z-50 border border-white/5"
    >
      <div className="flex items-center gap-3 px-4 mb-10 mt-4">
        <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
          <ShieldAlert className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight heading-premium">SecurePath</h1>
          <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase opacity-70">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-2">
        {navItems.map((item, index) => {
          if (!item.roles.includes(role)) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="transition-transform group-hover:scale-110" />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;

