import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { UserRole } from '../types';
import { LogIn, UserPlus, X, Shield, Wrench, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, users } = useDatabase();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@evcharge.com');
  const [loginPass, setLoginPass] = useState('admin123');

  // Signup form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('USER');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = login(loginEmail, loginPass);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => onClose(), 1200);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = signup({ name, email, password, phone, role });
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => onClose(), 1200);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const quickFill = (demoEmail: string) => {
    const user = users.find(u => u.email === demoEmail);
    if (user) {
      setLoginEmail(user.email);
      setLoginPass(user.password_hash);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#062817] text-white p-4 flex items-center justify-between border-b-2 border-[#a3e635]">
          <h2 className="text-sm font-bold text-[#a3e635] flex items-center gap-2">
            <LogIn className="w-4 h-4" /> System Authentication &amp; Registration
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => { setTab('login'); setMessage(null); }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              tab === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In (Existing Account)
          </button>
          <button
            onClick={() => { setTab('signup'); setMessage(null); }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              tab === 'signup'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up (New Account)
          </button>
        </div>

        {/* Alert Msg */}
        {message && (
          <div
            className={`m-4 mb-0 p-3 rounded text-xs font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {tab === 'login' ? (
          <div className="p-6 space-y-4">
            {/* Quick Fill Demo Creds */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Fill Demo Account:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickFill('admin@evcharge.com')}
                  className="px-2 py-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Shield className="w-3 h-3" /> Admin
                </button>
                <button
                  type="button"
                  onClick={() => quickFill('operator1@evcharge.com')}
                  className="px-2 py-1.5 rounded border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Wrench className="w-3 h-3" /> Operator
                </button>
                <button
                  type="button"
                  onClick={() => quickFill('elena@example.com')}
                  className="px-2 py-1.5 rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <User className="w-3 h-3" /> User
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Email Address:
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Password:
                </label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow"
              >
                <LogIn className="w-4 h-4" /> LOGIN TO SYSTEM
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="p-6 space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Full Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Email Address:
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="driver@example.com"
                className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Phone Number:
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Security Role:
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="USER">USER (EV Driver / Customer)</option>
                <option value="OPERATOR">OPERATOR (Station Manager)</option>
                <option value="ADMIN">ADMIN (Super Administrator)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow"
            >
              <UserPlus className="w-4 h-4" /> REGISTER NEW ACCOUNT
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
