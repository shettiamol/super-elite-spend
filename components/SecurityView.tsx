
import React, { useState, useEffect } from 'react';
import { useAppState } from '../store';

const SecurityView: React.FC = () => {
  const { theme, settings, setSecuritySettings } = useAppState();
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeType, setPasscodeType] = useState<'NEW' | 'CONFIRM'>('NEW');
  const [tempPasscode, setTempPasscode] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [isHardwareCapable, setIsHardwareCapable] = useState(false);

  useEffect(() => {
    const checkBio = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsHardwareCapable(available);
        } catch (e) {
          setIsHardwareCapable(false);
        }
      }
    };
    checkBio();
  }, []);

  const handlePasscodeStart = () => {
    setPasscodeType('NEW');
    setCurrentInput('');
    setTempPasscode('');
    setIsPasscodeModalOpen(true);
  };

  const onNumberClick = (num: string) => {
    const nextInput = currentInput + num;
    if (nextInput.length <= 4) {
      setCurrentInput(nextInput);
      if (nextInput.length === 4) {
        if (passcodeType === 'NEW') {
          setTempPasscode(nextInput);
          setPasscodeType('CONFIRM');
          setCurrentInput('');
        } else {
          if (nextInput === tempPasscode) {
            setSecuritySettings({ passcode: nextInput });
            setIsPasscodeModalOpen(false);
          } else {
            alert("Keys do not match.");
            setPasscodeType('NEW');
            setCurrentInput('');
            setTempPasscode('');
          }
        }
      }
    }
  };

  const toggleBiometrics = () => {
    if (!settings.security.biometricsEnabled && !isHardwareCapable) {
       alert("Sensor Error: No biometric hardware detected.");
       return;
    }
    setSecuritySettings({ biometricsEnabled: !settings.security.biometricsEnabled });
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in">
      <div className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Security Hub</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Protection</p>
      </div>

      <div className="space-y-6">
        <section className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div>
              <h3 className="text-xs font-black dark:text-white uppercase tracking-tight">Access Key</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {settings.security.passcode ? 'Identity Armored' : 'Unprotected'}
              </p>
            </div>
          </div>
          <button onClick={handlePasscodeStart} className="w-full py-5 gradient-purple text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-3xl shadow-xl">
            {settings.security.passcode ? 'Recalibrate Key' : 'Setup App Lock'}
          </button>
          {settings.security.passcode && (
             <button onClick={() => setSecuritySettings({ passcode: undefined, biometricsEnabled: false })} className="w-full mt-4 py-2 text-rose-500 font-black uppercase text-[8px] tracking-widest">
               Purge Lock Protection
             </button>
          )}
        </section>

        <section className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isHardwareCapable ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                <i className="fa-solid fa-fingerprint"></i>
              </div>
              <div>
                <h3 className="text-xs font-black dark:text-white uppercase tracking-tight">Biometric Link</h3>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  {isHardwareCapable ? 'Sensor Synced' : 'Unsupported'}
                </p>
              </div>
            </div>
            <button onClick={toggleBiometrics} className={`w-12 h-6 rounded-full relative transition-all ${settings.security.biometricsEnabled ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.security.biometricsEnabled ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </section>
      </div>

      {isPasscodeModalOpen && (
        <div className="fixed inset-0 z-[600] bg-slate-900/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
           <div className="text-center mb-12">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                 {passcodeType === 'NEW' ? 'New Access Key' : 'Confirm Access Key'}
              </h2>
           </div>
           <div className="flex gap-4 mb-16">
              {[0, 1, 2, 3].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 ${currentInput.length > i ? 'bg-white border-white scale-125' : 'border-white/20'}`}></div>)}
           </div>
           <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((n, i) => {
                if (n === '') return <div key={i}></div>;
                if (n === 'del') return <button key={i} onClick={() => setCurrentInput(prev => prev.slice(0, -1))} className="w-full aspect-square text-white/40"><i className="fa-solid fa-delete-left text-xl"></i></button>;
                return ( <button key={i} onClick={() => onNumberClick(n.toString())} className="w-full aspect-square rounded-full bg-white/5 border border-white/10 text-white text-2xl font-black active:bg-white active:text-slate-900">{n}</button> );
              })}
           </div>
           <button onClick={() => setIsPasscodeModalOpen(false)} className="mt-12 text-[9px] font-black text-white/30 uppercase tracking-widest">Cancel</button>
        </div>
      )}
    </div>
  );
};

export default SecurityView;