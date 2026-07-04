import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/* ── South Indian food scatter matching the reference image ── */
const decorations = [
  // top-left: sambar/curry bowl
  { emoji: '🍲', top: '0%',    left: '-1%',   size: '9rem',  rotate: '-8deg',  opacity: 0.92 },
  // top-right: green chutney bowl
  { emoji: '🥣', top: '1%',    right: '-1%',  size: '8rem',  rotate: '10deg',  opacity: 0.88 },
  // right: curry leaves branch
  { emoji: '🌿', top: '14%',   right: '0%',   size: '6rem',  rotate: '-18deg', opacity: 0.80 },
  // left-mid: idli on banana leaf
  { emoji: '🫓', top: '36%',   left: '-2%',   size: '9rem',  rotate: '4deg',   opacity: 0.90 },
  // top-center: tiny spice dots
  { emoji: '🍃', top: '6%',    left: '40%',   size: '3.5rem',rotate: '-20deg', opacity: 0.55 },
  // bottom-left: dosa
  { emoji: '🫔', bottom:'3%',  left: '-2%',   size: '10rem', rotate: '-5deg',  opacity: 0.92 },
  // bottom-right: sambar
  { emoji: '🍛', bottom:'5%',  right: '-1%',  size: '9rem',  rotate: '8deg',   opacity: 0.90 },
  // bottom-right: small chutney cup
  { emoji: '🥘', bottom:'22%', right: '0%',   size: '5rem',  rotate: '12deg',  opacity: 0.70 },
  // scattered leaves
  { emoji: '🌿', bottom:'18%', right: '2%',   size: '4rem',  rotate: '6deg',   opacity: 0.55 },
  { emoji: '🌶️', bottom:'30%', left: '1%',    size: '3rem',  rotate: '-12deg', opacity: 0.50 },
];

export default function LoginScreen() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const login   = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setError('');
    try {
      await login(username.trim(), password.trim());
      navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/vjhomefoods/Loginbg.jpg'), url('/Loginbg.jpg')",
        backgroundColor: '#F0E6D3'
      }}
    >

      {/* ── Login Card ── */}
      <div
        className="w-full max-w-[370px] bg-white rounded-3xl relative z-10 overflow-hidden"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}
      >
        {/* ── Orange wave header ── */}
        <div
          className="relative"
          style={{ background: 'linear-gradient(145deg, #FF6B00 0%, #FF9A3C 100%)' }}
        >
          {/* Subtle etched food pattern */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Ccircle cx='35' cy='35' r='16' fill='none' stroke='white' stroke-width='1.5'/%3E%3Cpath d='M35 10 Q45 25 35 35 Q25 25 35 10Z' fill='white' opacity='0.3'/%3E%3C/svg%3E")`,
          }} />

          {/* VJ Logo — larger */}
          <div className="relative z-10 pt-7 pb-2 flex justify-center">
            <img
              src="/vjhomefoods/vj-logo-transparent.png"
              alt="VJ Home Foods"
              className="h-24 w-auto object-contain select-none"
              style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.30))' }}
            />
          </div>

          {/* Wave bottom */}
          <div className="relative h-16">
            <svg
              viewBox="0 0 370 64"
              preserveAspectRatio="none"
              className="absolute bottom-0 left-0 w-full h-full"
            >
              <path
                d="M0,22 C90,66 180,0 270,38 C315,56 345,20 370,34 L370,64 L0,64 Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {/* ── Steaming bowl / cloche badge on wave edge ── */}
        <div className="flex justify-center -mt-9 relative z-20 mb-2">
          <div
            className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center shadow-[0_4px_20px_rgba(255,107,0,0.25)] border-[2.5px] border-[#FFD9B3]"
          >
            {/* Cloche dish cover with heart SVG matching the image */}
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-brand" fill="none">
              {/* Heart above cloche */}
              <path d="M50,22 C48.5,19.5 45.5,19.5 44,21 C42.5,22.5 42.5,25.5 44,27 L50,32.5 L56,27 C57.5,25.5 57.5,22.5 56,21 C54.5,19.5 51.5,19.5 50,22 Z" fill="#FF6B00"/>
              {/* Cloche dome */}
              <path d="M28,54 C28,40 38,34 50,34 C62,34 72,40 72,54 Z" fill="none" stroke="#FF6B00" strokeWidth="4.5" strokeLinecap="round"/>
              {/* Handle on top of dome */}
              <circle cx="50" cy="34" r="3.5" fill="#FF6B00"/>
              {/* Base plate */}
              <path d="M22,59 L78,59" stroke="#FF6B00" strokeWidth="4.5" strokeLinecap="round"/>
              <path d="M30,64 L70,64" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round"/>
              {/* Rays on left */}
              <line x1="16" y1="44" x2="21" y2="46" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="14" y1="52" x2="19" y2="52" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="16" y1="60" x2="21" y2="58" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Rays on right */}
              <line x1="84" y1="44" x2="79" y2="46" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="86" y1="52" x2="81" y2="52" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="84" y1="60" x2="79" y2="58" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="px-7 pb-8 pt-2">

          {/* Headline matching image font style */}
          <div className="text-center mb-5">
            <h1 className="text-[2.2rem] leading-none mb-2 select-none tracking-tight">
              {/* "Let's" — Playfair Display bold serif, dark */}
              <span
                style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C2520', fontWeight: 900 }}
              >
                Let's{" "}
              </span>
              {/* "dig in!" — Pacifico script, orange */}
              <span
                style={{ fontFamily: 'Pacifico, "Dancing Script", cursive', color: '#FF6B00' }}
              >
                dig in!
              </span>
            </h1>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 mt-3 mb-3">
              <div className="h-[1.5px] w-8 rounded" style={{ background: '#FFE4CC' }} />
              <span style={{ color: '#FF6B00', fontSize: '11px' }}>♥</span>
              <div className="h-[1.5px] w-8 rounded" style={{ background: '#FFE4CC' }} />
            </div>

            <p className="text-[13px] text-slate-500 leading-snug">
              Sign in to manage your orders,<br />view bills and more.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start bg-red-50 border border-red-200 rounded-xl p-3 gap-2 mb-4">
              <span className="text-xs mt-0.5">⚠️</span>
              <span className="text-[11px] text-red-800 font-semibold leading-normal">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">
                Username
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Enter username (e.g. B006)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full h-12 rounded-xl pl-10 pr-4 text-sm text-slate-800 bg-white placeholder:text-slate-400 transition"
                  style={{ border: '1.5px solid #E5E7EB', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#FF6B00')}
                  onBlur={e  => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full h-12 rounded-xl pl-10 pr-16 text-sm text-slate-800 bg-white placeholder:text-slate-400 transition"
                  style={{ border: '1.5px solid #E5E7EB', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#FF6B00')}
                  onBlur={e  => (e.target.style.borderColor = '#E5E7EB')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black cursor-pointer select-none"
                  style={{ color: '#FF6B00' }}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Sign In */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full text-white font-black uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
              style={{
                height: '52px',
                background: loading ? '#FFB37A' : 'linear-gradient(90deg, #FF6B00 0%, #FF9A3C 100%)',
                boxShadow: '0 6px 20px rgba(255,107,0,0.40)',
                fontSize: '13px',
                letterSpacing: '0.1em',
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>SIGN IN</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
