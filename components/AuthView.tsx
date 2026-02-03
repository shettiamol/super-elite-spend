
import React, { useState, useEffect } from 'react';
import { useAppState, ADMIN_MASTER_CODE } from '../store';

const AuthView: React.FC = () => {
  const { setUser, theme } = useAppState();
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [resendTimer, setResendTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '+91 ',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleMobileChange = (val: string) => {
    if (!val.startsWith('+91 ')) {
      setFormData({ ...formData, mobile: '+91 ' });
      return;
    }
    const digits = val.slice(4).replace(/\D/g, '');
    if (digits.length <= 10) {
      setFormData({ ...formData, mobile: '+91 ' + digits });
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const mobileDigits = formData.mobile.slice(4);
    if (mobileDigits.length !== 10) {
      alert("Validation Error: Please enter a valid 10-digit mobile number.");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      setResendTimer(30);
    }, 1200);
  };

  const generateBypassCodes = () => {
    const codes = [];
    const BLACKLIST = ['123456', '000000', '111111', '654321', '369639'];
    for (let i = 0; i < 500; i++) {
      let code = Math.floor(100000 + Math.random() * 900000).toString();
      while (BLACKLIST.includes(code)) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
      }
      codes.push(code);
    }
    return codes;
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    const enteredCode = formData.otp;

    // SECURITY PROTOCOL: Block 123456 explicitly
    if (enteredCode === '123456') {
      alert("SECURITY ALERT: Blacklisted access key detected. Access denied.");
      setFormData({ ...formData, otp: '' });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      // Verified key check: Must be the admin code or a specific demo code
      const isMaster = enteredCode === ADMIN_MASTER_CODE;
      const isDemoClient = enteredCode === '000000'; // Default valid client demo code

      if (isMaster || isDemoClient) {
        setUser({
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name || (isMaster ? 'Master Admin' : 'Standard Client'),
          email: formData.email,
          mobile: formData.mobile,
          accessCodes: isMaster ? generateBypassCodes() : [],
          isMaster: isMaster
        });
        
        if (isMaster) {
          alert("Master Access Granted: Full Protocol Control initialized.");
        } else {
          alert("Client Access Granted: Standard Protocol initialized.");
        }
      } else {
        alert("SECURITY ALERT: Access code unauthorized. Enter a valid protocol key.");
      }
    }, 800);
  };

  const triggerResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    alert("SYSTEM: Email authentication packets re-dispatched to " + formData.email);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 pb-12 overflow-y-auto hide-scrollbar ${theme === 'dark' ? 'bg-slate-900' : 'bg-[#F8F9FD]'}`}>
      <div className="w-full max-w-sm animate-slide-up">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 gradient-purple rounded-[2.25rem] flex items-center justify-center text-white text-3xl smooth-deep-shadow mx-auto mb-6 transform hover:rotate-12 transition-transform duration-500">
            <i className="fa-solid fa-vault"></i>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>SmartSpend</h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-2 opacity-80">Initial Enrollment Protocol</p>
        </div>

        <div className={`rounded-[2.5rem] p-8 border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-2xl'}`}>
          {step === 'DETAILS' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-transparent focus:border-indigo-500/30 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-transparent focus:border-indigo-500/30 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                  placeholder="name@protocol.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Mobile (India)</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-transparent focus:border-indigo-500/30 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all" 
                  placeholder="+91 0000000000"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full gradient-purple text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all uppercase text-[10px] tracking-[0.2em]"
                >
                  {isLoading ? <i className="fa-solid fa-circle-notch animate-spin text-lg"></i> : 'Initialize Access'}
                </button>
              </div>
              
              <p className="text-[8px] font-bold text-slate-400 uppercase text-center tracking-widest opacity-60">
                Enrollment Security Required
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-center">
                 <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Authorization Hub</p>
                 <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase leading-relaxed">
                   Enter 6-digit OTP or <br/> 
                   <span className="text-indigo-600 dark:text-indigo-400 font-black">Admin Master Key</span>
                 </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block text-center">6-Digit Key</label>
                <input 
                  type="text" 
                  maxLength={6} 
                  required 
                  autoFocus
                  value={formData.otp} 
                  onChange={e => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})} 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-5 text-center font-black tracking-[0.5em] text-xl dark:text-white" 
                  placeholder="••••••" 
                />
              </div>

              <div className="space-y-3">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full gradient-purple text-white font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-[10px] tracking-[0.2em]"
                >
                  {isLoading ? <i className="fa-solid fa-circle-notch animate-spin text-lg"></i> : 'Verify & Launch'}
                </button>
                
                <div className="flex flex-col items-center gap-4 pt-2">
                  <button 
                    type="button" 
                    onClick={triggerResend}
                    disabled={resendTimer > 0}
                    className={`text-[9px] font-black uppercase tracking-widest transition-colors ${resendTimer > 0 ? 'text-slate-300' : 'text-indigo-500 hover:text-indigo-600'}`}
                  >
                    {resendTimer > 0 ? `Resend Key in ${resendTimer}s` : 'Resend Verification Packet'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep('DETAILS')} 
                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Return to Identity Setup
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
        
        <div className="mt-12 text-center opacity-40">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Elite Ledger Protection v3.0</p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
