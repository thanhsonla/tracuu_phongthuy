import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, AlertCircle, Compass, Eye, EyeOff, X, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AuthScreen({ onLogin, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [visible, setVisible] = useState(false);

  // Trigger animation khi mount
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setGlobalError('');
    setGlobalSuccess('');
  };

  const isValidEmail = (val) => {
    if (!val) return "Vui lòng nhập trường này.";
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(val)) return "Địa chỉ email không hợp lệ.";
    return "";
  };

  const isValidPassword = (val) => {
    if (!val) return "Vui lòng nhập trường này.";
    if (val.length < 8 || val.length > 32) return "Mật khẩu dài từ 8 đến 32 ký tự.";
    const complexRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
    if (!complexRegex.test(val)) return "Password must contain alphabetic, numeric and special characters.";
    return "";
  };

  const validateForm = () => {
    let newErrors = {};

    if (mode === 'login') {
      if (!username) newErrors.username = "Vui lòng nhập tên đăng nhập.";
      if (!password) newErrors.password = "Vui lòng nhập mật khẩu.";
    } 
    else if (mode === 'register') {
      if (!username) newErrors.username = "Vui lòng nhập tên đăng nhập (Tên đầy đủ).";
      else if (username.length < 3 || username.length > 20) newErrors.username = "Tên đăng nhập từ 3 đến 20 ký tự.";

      const emailErr = isValidEmail(email);
      if (emailErr) newErrors.email = emailErr;

      const passErr = isValidPassword(password);
      if (passErr) newErrors.password = passErr;

      if (!confirmPassword) newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
      else if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu không khớp.";
    } 
    else if (mode === 'forgot') {
      const emailErr = isValidEmail(email);
      if (emailErr) newErrors.email = emailErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setGlobalSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    if (mode === 'forgot') {
      // Mock forgot password since there's no API
      setTimeout(() => {
        setGlobalSuccess('Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu vào Email của bạn.');
        setLoading(false);
      }, 800);
      return;
    }

    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = { username, password, email };
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) throw new Error(data.error || 'Đã có lỗi xảy ra từ máy chủ');

      if (mode === 'login') {
        if (rememberMe) {
           localStorage.setItem('rememberUser', username);
        }
        onLogin(data);
      } else if (mode === 'register') {
        setGlobalSuccess('Đăng ký thành công! Vui lòng Đăng Nhập.');
        switchMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (field) => {
    return `w-full bg-slate-50 border ${errors[field] ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 ${errors[field] ? 'focus:ring-red-300' : 'focus:ring-indigo-500'} focus:border-transparent font-medium transition-colors placeholder:text-slate-300`;
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
          display: 'flex',
          flexDirection: 'column'
        }}
        className="relative w-full max-w-md my-auto"
      >
        {/* Decorative glow rings */}
        <div className="absolute -inset-1 bg-gradient-to-br from-red-500/30 via-indigo-500/20 to-purple-500/30 rounded-[2rem] blur-xl opacity-80 pointer-events-none" />

        {/* Card */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[1.75rem] shadow-2xl flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden max-h-[90vh] border border-white/60 scrollbar-hide">
          
          {/* Nút đóng */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
          >
            <X size={16} />
          </button>

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 pt-10 pb-8 overflow-hidden shrink-0">
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
              <p className="text-slate-400 text-xs font-semibold tracking-[0.25em] uppercase mt-1.5 text-center">
                {mode === 'login' ? 'Đăng nhập tài khoản' : mode === 'register' ? 'Tạo tài khoản mới' : 'Khôi phục mật khẩu'}
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="px-8 py-7 shrink-0">

            {/* Tab switcher */}
            {mode !== 'forgot' && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  <LogIn size={14} className="inline mr-1.5 -mt-0.5" />Đăng Nhập
                </button>
                <button type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    mode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  <UserPlus size={14} className="inline mr-1.5 -mt-0.5" />Đăng Ký
                </button>
              </div>
            )}

            {globalError && (
              <div className="mb-4 p-3 rounded-xl flex items-start gap-2 text-sm font-medium bg-red-50 text-red-600 border border-red-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{globalError}</span>
              </div>
            )}
            
            {globalSuccess && (
              <div className="mb-4 p-3 rounded-xl flex items-start gap-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{globalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Tên đăng nhập */}
              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {mode === 'register' ? 'Họ tên / Tên đăng nhập' : 'Tên đăng nhập'}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {setUsername(e.target.value); setErrors({...errors, username:''})}}
                    autoFocus
                    className={getInputClass('username')}
                    placeholder="Nhập tên tài khoản"
                  />
                  {errors.username && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.username}</p>}
                </div>
              )}

              {/* Email */}
              {(mode === 'register' || mode === 'forgot') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value); setErrors({...errors, email:''})}}
                    className={getInputClass('email')}
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.email}</p>}
                </div>
              )}

              {/* Mật khẩu */}
              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {setPassword(e.target.value); setErrors({...errors, password:''})}}
                      className={`${getInputClass('password')} pr-12`}
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
                  {errors.password && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.password}</p>}
                  
                  {mode === 'login' && (
                    <div className="flex items-center justify-between mt-3 mb-1 px-1">
                      <div className="flex items-center">
                        <input 
                          id="rememberMe" 
                          type="checkbox" 
                          className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded cursor-pointer"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                          Ghi nhớ
                        </label>
                      </div>
                      <a href="#" onClick={(e) => { e.preventDefault(); switchMode('forgot'); }} className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                        Quên mật khẩu?
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Nhập lại Mật khẩu */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword:''})}}
                      className={`${getInputClass('confirmPassword')} pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-slate-800 to-indigo-900 hover:from-slate-700 hover:to-indigo-800 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  <><LogIn size={18} /> ĐĂNG NHẬP</>
                ) : mode === 'register' ? (
                  <><Sparkles size={18} /> TẠO TÀI KHOẢN</>
                ) : (
                  <><KeyRound size={18} /> KHÔI PHỤC MẬT KHẨU</>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center space-y-3 shrink-0">
            {mode === 'login' && (
              <p className="text-sm text-slate-600 font-medium">
                Chưa có tài khoản?{' '}
                <span 
                  onClick={() => switchMode('register')} 
                  className="text-blue-600 font-bold cursor-pointer hover:underline hover:text-blue-700"
                >
                  Đăng ký tại đây
                </span>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-sm text-slate-600 font-medium">
                Đã có tài khoản?{' '}
                <span 
                  onClick={() => switchMode('login')} 
                  className="text-blue-600 font-bold cursor-pointer hover:underline hover:text-blue-700"
                >
                  Đăng nhập tại đây
                </span>
              </p>
            )}
            {mode === 'forgot' && (
              <p className="text-sm text-slate-600 font-medium">
                Sử dụng các biểu mẫu khác:{' '}
                <span 
                  onClick={() => switchMode('login')} 
                  className="text-blue-600 font-bold cursor-pointer hover:underline hover:text-blue-700"
                >
                  Đăng nhập
                </span>
                {' '} | {' '}
                <span 
                  onClick={() => switchMode('register')} 
                  className="text-blue-600 font-bold cursor-pointer hover:underline hover:text-blue-700"
                >
                  Đăng ký
                </span>
              </p>
            )}
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Bằng việc đăng nhập, bạn đồng ý với Điều khoản sử dụng của HKPT PRO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
