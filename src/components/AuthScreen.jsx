import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, AlertCircle, Compass, Eye, EyeOff, X, Sparkles } from 'lucide-react';

export default function AuthScreen({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(false);

  // Trigger animation khi mount
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }
    setLoading(true);
    setError('');

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = { username, password, email };
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) throw new Error(data.error || 'Đã có lỗi xảy ra');

      if (isLogin) {
        onLogin(data);
      } else {
        setIsLogin(true);
        setError('Đăng ký thành công! Vui lòng đăng nhập.');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop: blur + dim - click outside để đóng
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(15, 23, 42, ${visible ? 0.6 : 0})`,
        backdropFilter: `blur(${visible ? 12 : 0}px)`,
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      {/* Modal card */}
      <div
        style={{
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease',
        }}
        className="relative w-full max-w-md"
      >
        {/* Decorative glow rings */}
        <div className="absolute -inset-1 bg-gradient-to-br from-red-500/30 via-indigo-500/20 to-purple-500/30 rounded-[2rem] blur-xl opacity-80 pointer-events-none" />

        {/* Card */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[1.75rem] shadow-2xl overflow-hidden border border-white/60">
          
          {/* Nút đóng */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <X size={16} />
          </button>

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 pt-10 pb-8 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ef4444 0%, transparent 50%)'
            }} />
            
            <div className="relative flex flex-col items-center">
              {/* Logo */}
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Compass className="text-red-400" size={34} />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight bg-gradient-to-r from-red-400 via-orange-300 to-indigo-400 bg-clip-text text-transparent">
                HKPT PRO
              </h1>
              <p className="text-slate-400 text-xs font-semibold tracking-[0.25em] uppercase mt-1.5">
                {isLogin ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="px-8 py-7">

            {/* Tab switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <LogIn size={14} className="inline mr-1.5 -mt-0.5" />Đăng Nhập
              </button>
              <button type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  !isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <UserPlus size={14} className="inline mr-1.5 -mt-0.5" />Đăng Ký
              </button>
            </div>

            {error && (
              <div className={`mb-4 p-3 rounded-xl flex items-start gap-2 text-sm font-medium ${
                error.includes('thành công') 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên đăng nhập</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium transition-colors placeholder:text-slate-300"
                  placeholder="username"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email <span className="text-slate-300 normal-case font-normal">(tuỳ chọn)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium transition-colors placeholder:text-slate-300"
                    placeholder="email@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium transition-colors pr-12 placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-slate-800 to-indigo-900 hover:from-slate-700 hover:to-indigo-800 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn size={18} /> ĐĂNG NHẬP</>
                ) : (
                  <><Sparkles size={18} /> TẠO TÀI KHOẢN</>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-slate-400 text-xs">
              Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng của HKPT PRO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
