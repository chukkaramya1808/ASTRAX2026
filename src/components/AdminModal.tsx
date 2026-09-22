import React, { useState } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
}

export function AdminModal({ isOpen, onClose, onLoginSuccess }: AdminModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid admin credentials.');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('astra_admin_token', data.token);
      localStorage.setItem('astra_admin_user', data.username);

      onLoginSuccess({
        username: data.username,
        token: data.token
      });

      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection failure. Could not contact the authentication service.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#6b001a] to-[#4a0013] border-2 border-[#D4AF37]/55 p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.25)] relative"
        role="dialog"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#D8C4B4] hover:text-[#FFDF73] hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#800020] border border-[#D4AF37]/45 flex items-center justify-center mx-auto mb-3 text-[#FFDF73] shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#FAF5EE] font-serif">
            ASTRA X'26 Admin Portal
          </h3>
          <p className="text-xs text-[#F0DFD5] mt-1">
            Restricted access for authorized event coordinators
          </p>
        </div>

        {/* Notice of authorized accounts */}
        <div className="mb-5 p-3 rounded-lg bg-[#5a0016] border border-[#D4AF37]/30 text-[11px] text-[#FAF5EE] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#E5C05B] shrink-0" />
          <span>Authorized IDs: <strong>ramya</strong> or <strong>varshu</strong></span>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-start gap-2 animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider mb-1.5 font-mono">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (ramya / varshu)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl cream-input text-sm font-medium shadow-sm"
                required
                autoFocus
              />
              <User className="w-4 h-4 text-[#7A6054] absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl cream-input text-sm font-medium shadow-sm"
                required
              />
              <KeyRound className="w-4 h-4 text-[#7A6054] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-[#7A6054] hover:text-[#260811]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gold-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#190309] border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authenticate & Open Dashboard</span>
              </>
            )}
          </button>

        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#D8B4A6] hover:text-white transition-colors"
          >
            Cancel and return to event page
          </button>
        </div>

      </div>
    </div>
  );
}
