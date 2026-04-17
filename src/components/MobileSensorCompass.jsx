import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Check, AlertCircle } from 'lucide-react';
import DynamicCompass from './DynamicCompass';

const MobileSensorCompass = ({ onDegreeCapture }) => {
  const [degree, setDegree] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState(false);

  const handleOrientation = useCallback((event) => {
    let alpha = event.alpha;
    let webkitAlpha = event.webkitCompassHeading;
    if (webkitAlpha !== undefined && webkitAlpha !== null) {
      // iOS
      setDegree(Math.round(webkitAlpha));
    } else if (alpha !== null) {
      // Android
      // Alpha is strictly heading in absolute mode? Not necessarily, but let's map it roughly.
      // Usually, true heading on Android requires absolute: true in listener.
      // Let's assume standard absolute alpha.
      let h = 360 - alpha;
      setDegree(Math.round(h % 360));
    }
  }, []);

  const startCompass = async () => {
    setError('');
    // Need permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setIsActive(true);
        } else {
          setError('Quyền truy cập cảm biến bị từ chối.');
        }
      } catch (err) {
        setError('Lỗi lấy quyền cảm biến. Vui lòng thử trên HTTPS.');
      }
    } else {
      // Non-iOS or older iOS
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
        setIsActive(true);
      } else {
        setError('Thiết bị của bạn không hỗ trợ La bàn.');
      }
    }
  };

  const stopCompass = () => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      stopCompass();
    };
  }, [handleOrientation]);

  const captureDegree = () => {
    stopCompass();
    setCaptured(true);
    if (onDegreeCapture) {
      onDegreeCapture(degree);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
      <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
        <Compass className="text-indigo-600" /> Đo La Bàn Trực Tiếp
      </h3>
      <p className="text-sm text-slate-500 mb-6 px-4">
        Hãy đứng quay mặt ra cửa chính, cầm điện thoại theo phương ngang và song song với mặt đất.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* COMPASS UI */}
      <div className="relative mb-8 flex justify-center w-full">
         <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100 opacity-80'}`}>
            <DynamicCompass degree={degree} readOnly={true} hideStars={true} />
         </div>
      </div>

      {!isActive && !captured && (
        <button
          onClick={startCompass}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md w-full max-w-xs transition-colors"
        >
          Kích Hoạt La Bàn Vệ Tinh
        </button>
      )}

      {isActive && !captured && (
        <div className="w-full max-w-xs space-y-4">
           <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-3 rounded-xl font-black text-2xl">
              {degree}°
           </div>
           <button
             onClick={captureDegree}
             className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 rounded-xl shadow-md w-full transition-colors animate-pulse"
           >
             CHỐT TỌA ĐỘ
           </button>
        </div>
      )}

      {captured && (
        <div className="w-full max-w-xs space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl font-black text-2xl flex items-center justify-center gap-2">
                <Check /> Đã Lưu: {degree}°
            </div>
            <button
             onClick={() => { setCaptured(false); startCompass(); }}
             className="text-slate-500 hover:text-slate-700 font-bold underline text-sm"
           >
             Đo lại
           </button>
        </div>
      )}
    </div>
  );
};

export default MobileSensorCompass;
