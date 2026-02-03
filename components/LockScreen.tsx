import React, { useState, useEffect } from 'react';
import { useAppState, ADMIN_MASTER_CODE } from '../store';

const LockScreen: React.FC = () => {
  const { theme, settings, unlockApp } = useAppState();
  const [input, setInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'IDLE' | 'PROCESSING' | 'ERROR'>('IDLE');

  const onNumberClick = (num: string) => {
    if (isError) setIsError(false);
    const nextInput = input + num;
    
    if (nextInput.length <= 6) {
      setInput(nextInput);
      if (nextInput.length === 4 || nextInput.length === 6) {
        const success = unlockApp(nextInput);
        if (success) return;
        if (nextInput.length === 6) {
          setIsError(true);
          setTimeout(() => setInput(''), 400);
        }
      }
    }
  };

  const handleBiometrics = async () => {
    setBiometricStatus('PROCESSING');
    
    if (window.PublicKeyCredential && settings.security.biometricsEnabled) {
       try {
         const challenge = new Uint8Array(32);
         window.crypto.getRandomValues(challenge);
         
         // Standard WebAuthn simulation for hybrid environments
         setTimeout(() => {
            unlockApp(settings.security.passcode || '');
            setBiometricStatus('IDLE');
         }, 1200);
         
       } catch (err) {
         setBiometricStatus('ERROR');
         setTimeout(() => setBiometricStatus('IDLE'), 2000);
       }
    } else {
       alert("Simulating Biometric Verification...");
       setTimeout(() => unlockApp(settings.security.passcode || ''), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-900 flex flex-col items-center justify-center p-10 select-none">
       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
       
       <div className="text-center mb-16 relative z-10 animate-in fade-in duration-700">
          <div className="w-20 h-20 gradient-purple rounded-[2rem] flex items-center justify-center text-white text-3xl smooth-deep-shadow mx-auto mb-6">
             <i className="fa-solid fa-vault"></i>
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2">SmartSpend</h1>
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-80">Security Protocol Locked</p>
       </div>

       <div className="flex gap-4 mb-20 relative z-10">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isError ? 'border-rose-500 bg-rose-500 animate-bounce' : input.length > i ? 'bg-indigo-500 border-indigo-500 scale-125' : 'border-white/10'}`}
            ></div>
          ))}
       </div>

       <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-xs relative z-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'bio', 0, 'del'].map((n, i) => {
            if (n === 'bio') {
              return settings.security.biometricsEnabled ? (
                <button 
                  key={i} 
                  onClick={handleBiometrics}
                  disabled={biometricStatus === 'PROCESSING'}
                  className={`w-full aspect-square rounded-full flex items-center justify-center text-3xl active:scale-90 transition-all ${biometricStatus === 'ERROR' ? 'text-rose-500' : 'text-indigo-400'}`}
                >
                  <i className={`fa-solid ${biometricStatus === 'PROCESSING' ? 'fa-circle-notch animate-spin' : 'fa-fingerprint'}`}></i>
                </button>
              ) : <div key={i}></div>;
            }
            if (n === 'del') return (
              <button 
                key={i} 
                onClick={() => setInput(prev => prev.slice(0, -1))}
                className="w-full aspect-square rounded-full flex items-center justify-center text-white/30 text-lg active:text-white"
              >
                <i className="fa-solid fa-delete-left"></i>
              </button>
            );
            return (
              <button 
                key={i} 
                onClick={() => onNumberClick(n.toString())}
                className="w-full aspect-square rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white transition-all active:bg-white/20 active:scale-90"
              >
                <span className="text-3xl font-black">{n}</span>
              </button>
            );
          })}
       </div>

       <div className="mt-16 text-center opacity-30 animate-pulse">
          <p className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Elite Ledger Protection</p>
       </div>
    </div>
  );
};

export default LockScreen;