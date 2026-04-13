import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Compass, Eye, EyeOff } from 'lucide-react';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Đã có lỗi xảy ra');
      }

      if (isLogin) {
        onLogin(data);
      } else {
        // Đăng ký thành công -> tự động báo đăng nhập hoặc yêu cầu login state
        setIsLogin(true);
        setError('Đăng ký thành công! Vui lòng đăng nhập.');
        // clear password
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
      {/* Background Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-4">
              <Compass className="text-red-500" size={36} />
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent">
              W2H
            </h1>
            <p className="text-slate-500 font-medium tracking-wide text-sm mt-1">NTT App</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className={`p-3 rounded-xl flex items-start gap-2 text-sm ${error.includes('thành công') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                placeholder="Nhập username"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email (Tùy chọn)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="Nhập email"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : isLogin ? (
                <><LogIn size={20} /> ĐĂNG NHẬP</>
              ) : (
                <><UserPlus size={20} /> TẠO TÀI KHOẢN</>
              )}
            </button>
          </form>

        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{' '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-indigo-600 font-bold hover:underline"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
