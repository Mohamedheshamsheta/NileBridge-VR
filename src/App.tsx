import { useState, useEffect } from 'react';
import InterpreterDashboard from './components/InterpreterDashboard';
import { 
  HeartPulse, 
  Compass, 
  Mic, 
  MicOff, 
  Accessibility,
  User,
  ShieldCheck,
  PhoneCall,
  Volume2,
  Smartphone,
  Tablet,
  Check,
  CreditCard,
  Building,
  RotateCw,
  Lock,
  ArrowRight,
  ChevronDown,
  Sparkles,
  HelpCircle,
  FileSignature
} from 'lucide-react';

export default function App() {
  // Portal Roles:
  // - 'client': Patient/Tourist Interface with grandparent/senior modes
  // - 'interpreter': Back-office call history, earnings, SignalR triggers
  const [portalRole, setPortalRole] = useState<'client' | 'interpreter'>('client');
  
  // Client States
  // - 'idle': Shows landing with Mode Selector (Personal B2C vs. Institutional B2B Kiosk)
  // - 'loading': Calming baby blue pulse transition screen
  // - 'active': 85% video dominant WebRTC active call screen
  // - 'post_call_receipt': Shows calculated payment ledger or B2B enterprise append summary
  const [clientState, setClientState] = useState<'idle' | 'loading' | 'active' | 'post_call_receipt'>('idle');
  
  // Mode Selection: 'b2c' (Personal Mobile) or 'b2b' (Institutional Tablet Kiosk)
  const [deviceMode, setDeviceMode] = useState<'b2c' | 'b2b'>('b2c');
  
  // Personal B2C Steps: 'sms_otp' -> 'credit_card_hold' -> 'booking_choices'
  const [b2cStep, setB2cStep] = useState<'sms_otp' | 'credit_card_hold' | 'booking_choices'>('sms_otp');
  
  // Personal B2C State Inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [isPreAuthHoldSuccess, setIsPreAuthHoldSuccess] = useState(false);

  // Institutional B2B State Inputs
  const [b2bLanguage, setB2bLanguage] = useState('English ⇄ Arabic');
  const [b2bServiceType, setB2bServiceType] = useState<'medical' | 'tourism'>('medical');

  // Shared WebRTC Active Call configuration
  const [selectedService, setSelectedService] = useState<'medical' | 'tourism'>('medical');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraFlipped, setIsCameraFlipped] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  // Simulation values for Post-Call Ledger Billing
  const [lastEarningValue, setLastEarningValue] = useState(0);
  const [lastDurationSeconds, setLastDurationSeconds] = useState(0);

  // Trigger call counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (clientState === 'active') {
      timer = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setCallDurationSeconds(0);
    }
    return () => clearInterval(timer);
  }, [clientState]);

  // Loading Screen Simulated Transition (Reassuring Slow Pulse)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (clientState === 'loading') {
      timeout = setTimeout(() => {
        setClientState('active');
      }, 4000); // 4-second soothing baby blue pulse
    }
    return () => clearTimeout(timeout);
  }, [clientState]);

  // Start booking in B2C mode
  const handleB2cServiceSelect = (service: 'medical' | 'tourism') => {
    setSelectedService(service);
    setClientState('loading');
  };

  // Start booking in B2B mode
  const handleB2bConnect = () => {
    setSelectedService(b2bServiceType);
    setClientState('loading');
  };

  // End active call and compute results
  const handleEndCall = async () => {
    const finalSeconds = callDurationSeconds > 0 ? callDurationSeconds : Math.floor(Math.random() * 180) + 120; // 2-5 minutes simulation
    const perMinuteRate = selectedService === 'medical' ? 2.80 : 3.20;
    const computedEarning = (finalSeconds / 60) * perMinuteRate;

    setLastDurationSeconds(finalSeconds);
    setLastEarningValue(Number(computedEarning.toFixed(2)));

    // Fire webhook to the ASP.NET Core endpoint in the background to commit the session
    try {
      await fetch('/api/webhooks/agora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'channel_destroy',
          channel: `CHANNEL_${deviceMode.toUpperCase()}_${Date.now().toString().slice(-4)}`,
          durationSeconds: finalSeconds,
          ratePerMinute: perMinuteRate,
          clientName: deviceMode === 'b2b' ? 'Cairo General Hospital (Token: LH-9910-EGY)' : 'Guest Client (SMS OTP Verified)',
          languagePair: deviceMode === 'b2b' ? b2bLanguage : 'English ⇄ Arabic',
          serviceType: selectedService
        })
      });
    } catch (err) {
      console.error('Error reporting post-call ledger entry:', err);
    }

    setClientState('post_call_receipt');
  };

  // SMS OTP Flow Simulators
  const handleSendSmsOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 8) {
      setOtpError('Please enter a valid telephone number.');
      return;
    }
    setOtpError('');
    setIsOtpSent(true);
  };

  const handleVerifySmsOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '1234' && otpCode !== '4321' && otpCode.length < 4) {
      setOtpError('Invalid code. For quick evaluation, use code "1234"');
      return;
    }
    setOtpError('');
    setB2cStep('credit_card_hold');
  };

  const handleCreditCardHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s+/g, '').length < 13) {
      setCardError('Please enter a valid card number.');
      return;
    }
    setCardError('');
    setIsPreAuthHoldSuccess(true);
    setTimeout(() => {
      setB2cStep('booking_choices');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#121212] font-sans relative flex flex-col justify-between">
      
      {/* 
        DEVELOPER / STAFF DUAL-PORTAL SWITCHER 
        Positioned as an overlay for evaluators to jump between the Patient and Interpreter sides.
      */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <button
          id="role-portal-switcher"
          onClick={() => {
            setPortalRole(portalRole === 'client' ? 'interpreter' : 'client');
            setClientState('idle');
          }}
          className="bg-[#121212] border-2 border-[#121212] hover:bg-black text-[#FAF9F6] text-xs font-mono font-black px-6 py-3 rounded-2xl transition-all shadow-xl flex items-center gap-2.5 cursor-pointer h-16"
          aria-label="Switch between Patient Portal and Interpreter Portal"
        >
          <Accessibility className="w-5 h-5 text-[#89CFF0]" />
          <span>SWITCH TO {portalRole === 'client' ? 'INTERPRETER PORTAL' : 'PATIENT PORTAL'}</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 py-16">
        
        {portalRole === 'interpreter' ? (
          /* Render full-featured multi-tab interpreter pro portal */
          <div className="w-full max-w-7xl mx-auto">
            <InterpreterDashboard />
          </div>
        ) : (
          /* Render "Grandparent Mode" / Accessible Dual-Device Patient Booking & Call Flow */
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
            
            {/* =======================================================
                LANDING VIEW: Adaptive Device Context Selector
                ======================================================= */}
            {clientState === 'idle' && (
              <div className="w-full space-y-12 animate-fade-in">
                
                {/* Mode Select Header Switcher */}
                <div className="flex flex-col items-center space-y-4">
                  <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase bg-[#89CFF0]/20 px-3.5 py-1.5 rounded-full border border-[#89CFF0]/40 font-bold">
                    System Deployment Configuration
                  </span>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight text-[#121212] text-center leading-tight">
                    NileBridge VRI App
                  </h1>
                  <p className="text-xl sm:text-2xl font-sans font-medium text-slate-500 max-w-lg text-center">
                    Select device context to evaluate customized user-experience flows.
                  </p>

                  {/* Device Toggles (High contrast, tactile buttons over 64px) */}
                  <div className="flex bg-slate-200/60 p-2 rounded-3xl border-2 border-[#121212] gap-2 mt-4 w-full max-w-md">
                    <button
                      id="toggle-device-b2c"
                      onClick={() => {
                        setDeviceMode('b2c');
                        setB2cStep('sms_otp');
                      }}
                      className={`flex-1 py-4.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer h-16 min-h-[64px] ${
                        deviceMode === 'b2c'
                          ? 'bg-[#121212] text-white shadow-md'
                          : 'text-slate-700 hover:text-black hover:bg-slate-300/40'
                      }`}
                      style={{ minHeight: '64px' }}
                    >
                      <Smartphone className="w-5 h-5" />
                      Personal Mobile (B2C)
                    </button>
                    <button
                      id="toggle-device-b2b"
                      onClick={() => setDeviceMode('b2b')}
                      className={`flex-1 py-4.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer h-16 min-h-[64px] ${
                        deviceMode === 'b2b'
                          ? 'bg-[#121212] text-white shadow-md'
                          : 'text-slate-700 hover:text-black hover:bg-slate-300/40'
                      }`}
                      style={{ minHeight: '64px' }}
                    >
                      <Tablet className="w-5 h-5" />
                      B2B Tablet Kiosk
                    </button>
                  </div>
                </div>

                {/* =======================================================
                    MODE A: PERSONAL USER CONTEXT (B2C Mobile Frame Simulator)
                    ======================================================= */}
                {deviceMode === 'b2c' && (
                  <div id="b2c-mobile-viewport-simulator" className="max-w-sm mx-auto bg-[#FAF9F6] border-4 border-[#121212] rounded-[40px] shadow-2xl overflow-hidden relative min-h-[640px] flex flex-col justify-between p-6">
                    
                    {/* Simulated Phone Top Bezel Indicator */}
                    <div className="w-full flex justify-between items-center pb-6 border-b border-slate-200">
                      <div className="text-[10px] font-mono font-black text-slate-400"> Nile VRI LTE </div>
                      <div className="w-20 h-5 bg-[#121212] rounded-full mx-auto" />
                      <div className="text-[10px] font-mono font-black text-slate-400"> 100% 🔋 </div>
                    </div>

                    <div className="flex-1 py-4 flex flex-col justify-center space-y-6">
                      
                      {/* Step A.1: Quick Registration via SMS OTP */}
                      {b2cStep === 'sms_otp' && (
                        <div className="space-y-5 animate-fade-in">
                          <div className="space-y-2 text-center">
                            <span className="text-[11px] font-mono uppercase bg-baby-blue/20 text-[#121212] px-2.5 py-1 rounded-full font-bold">
                              Step 1: SMS Authentication
                            </span>
                            <h2 className="text-2xl font-black text-[#121212]">
                              Guest Registration
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              Enter your mobile number to receive a temporary passkey.
                            </p>
                          </div>

                          <form onSubmit={isOtpSent ? handleVerifySmsOtp : handleSendSmsOtp} className="space-y-4">
                            {!isOtpSent ? (
                              <div className="space-y-2">
                                <label htmlFor="b2c-phone-input" className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider block">
                                  Mobile Phone Number
                                </label>
                                <input
                                  id="b2c-phone-input"
                                  type="tel"
                                  required
                                  placeholder="+1 (555) 000-0101"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-4 py-3 text-sm font-bold text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue h-14"
                                />
                                <button
                                  type="submit"
                                  className="w-full bg-[#121212] hover:bg-black text-[#FAF9F6] font-black h-16 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-2 border-transparent"
                                  style={{ minHeight: '64px' }}
                                >
                                  <span>Send Authorization Code</span>
                                  <ArrowRight className="w-4 h-4 text-[#89CFF0]" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4 animate-fade-in">
                                <div className="space-y-2">
                                  <label htmlFor="b2c-otp-input" className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider block">
                                    4-Digit Verification Code
                                  </label>
                                  <input
                                    id="b2c-otp-input"
                                    type="text"
                                    required
                                    maxLength={4}
                                    placeholder="e.g. 1234"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-4 py-3 text-center text-lg font-mono font-black tracking-widest text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue h-14"
                                  />
                                  <span className="text-[10px] font-mono text-slate-400 block text-center">
                                    Simulated: use verification code <strong className="text-slate-700">1234</strong>
                                  </span>
                                </div>
                                <button
                                  type="submit"
                                  className="w-full bg-[#121212] hover:bg-black text-[#FAF9F6] font-black h-16 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-2 border-transparent"
                                  style={{ minHeight: '64px' }}
                                >
                                  <span>Verify & Continue</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsOtpSent(false)}
                                  className="text-xs font-mono text-slate-500 hover:text-black block mx-auto py-1 underline"
                                >
                                  Change phone number
                                </button>
                              </div>
                            )}

                            {otpError && (
                              <p className="text-xs font-mono text-red-500 text-center font-bold bg-red-100/50 p-2.5 rounded-xl border border-red-200">
                                {otpError}
                              </p>
                            )}
                          </form>
                        </div>
                      )}

                      {/* Step A.2: Billing Interface - Automated Credit Card Hold */}
                      {b2cStep === 'credit_card_hold' && (
                        <div className="space-y-5 animate-fade-in">
                          <div className="space-y-2 text-center">
                            <span className="text-[11px] font-mono uppercase bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300 font-bold">
                              Step 2: Pre-Authorization Hold
                            </span>
                            <h2 className="text-2xl font-black text-[#121212]">
                              Payment Method
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              An active credit hold ($1.00/min estimate) is required to secure the live Agora WebRTC router.
                            </p>
                          </div>

                          <form onSubmit={handleCreditCardHold} className="space-y-4">
                            
                            {/* Card Details */}
                            <div className="space-y-3">
                              <div className="relative">
                                <input
                                  id="b2c-card-number"
                                  type="text"
                                  required
                                  placeholder="Card Number (e.g. 4000 1234 5678)"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue h-14"
                                />
                                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  id="b2c-card-expiry"
                                  type="text"
                                  required
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-4 py-3 text-xs font-bold text-center text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue h-14"
                                />
                                <input
                                  id="b2c-card-cvv"
                                  type="password"
                                  required
                                  maxLength={4}
                                  placeholder="CVV"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-4 py-3 text-xs font-bold text-center text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue h-14"
                                />
                              </div>
                            </div>

                            <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
                              <p className="text-[10px] font-mono text-slate-500 leading-normal">
                                🔒 Secure Sandboxed Hold. Standard per-minute billing. Dynamic weekly multipliers apply automatically.
                              </p>
                            </div>

                            <button
                              type="submit"
                              disabled={isPreAuthHoldSuccess}
                              className={`w-full font-black h-16 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-2 ${
                                isPreAuthHoldSuccess 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-[#121212] text-white hover:bg-black'
                              }`}
                              style={{ minHeight: '64px' }}
                            >
                              {isPreAuthHoldSuccess ? (
                                <>
                                  <ShieldCheck className="w-5 h-5 text-white" />
                                  <span>Hold Authorized</span>
                                </>
                              ) : (
                                <span>Authorize Card Hold</span>
                              )}
                            </button>

                            {cardError && (
                              <p className="text-xs font-mono text-red-500 text-center font-bold">
                                {cardError}
                              </p>
                            )}
                          </form>
                        </div>
                      )}

                      {/* Step A.3: Thumb-friendly 2 massive cards under Grandparent design */}
                      {b2cStep === 'booking_choices' && (
                        <div className="space-y-6 animate-fade-in text-center">
                          <div className="space-y-2">
                            <h2 className="text-xl font-black text-[#121212] tracking-tight">
                              Select Service Type
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                              Press a button to connect instantly.
                            </p>
                          </div>

                          <div className="flex flex-col gap-4">
                            {/* Medical Button */}
                            <button
                              id="btn-b2c-medical"
                              onClick={() => handleB2cServiceSelect('medical')}
                              className="w-full min-h-[120px] bg-[#121212] hover:bg-black text-[#FAF9F6] rounded-3xl p-5 flex items-center gap-4 transition-all active:scale-98 cursor-pointer border-4 border-[#121212] focus:outline-none focus:ring-4 focus:ring-[#89CFF0] animate-breathing-shadow text-left"
                            >
                              <div className="w-14 h-14 rounded-2xl bg-[#89CFF0]/20 flex items-center justify-center shrink-0 border border-[#89CFF0]/30">
                                <HeartPulse className="w-8 h-8 text-[#89CFF0]" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-lg font-black block tracking-tight">Medical</span>
                                <span className="text-[11px] text-slate-400 font-medium block">Doctors, ER, Clinics</span>
                              </div>
                            </button>

                            {/* Tourism Button */}
                            <button
                              id="btn-b2c-tourism"
                              onClick={() => handleB2cServiceSelect('tourism')}
                              className="w-full min-h-[120px] bg-[#121212] hover:bg-black text-[#FAF9F6] rounded-3xl p-5 flex items-center gap-4 transition-all active:scale-98 cursor-pointer border-4 border-[#121212] focus:outline-none focus:ring-4 focus:ring-[#89CFF0] animate-breathing-shadow text-left"
                            >
                              <div className="w-14 h-14 rounded-2xl bg-[#89CFF0]/20 flex items-center justify-center shrink-0 border border-[#89CFF0]/30">
                                <Compass className="w-8 h-8 text-[#89CFF0]" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-lg font-black block tracking-tight">Tourism</span>
                                <span className="text-[11px] text-slate-400 font-medium block">Museums, Heritage</span>
                              </div>
                            </button>
                          </div>

                          {/* Account status note */}
                          <div className="bg-[#89CFF0]/10 border border-[#89CFF0]/30 rounded-xl p-2.5 flex items-center gap-2 justify-center text-[10px] font-mono text-slate-600">
                            <ShieldCheck className="w-4 h-4 text-[#89CFF0]" />
                            <span>Authenticated Guest Session Active</span>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Home Handle Bar */}
                    <div className="w-full pt-4 border-t border-slate-200 text-center">
                      <div className="w-24 h-1.5 bg-slate-300 rounded-full mx-auto" />
                    </div>

                  </div>
                )}

                {/* =======================================================
                    MODE B: INSTITUTIONAL TABLET CONTEXT (B2B Kiosk Mode)
                    ======================================================= */}
                {deviceMode === 'b2b' && (
                  <div id="b2b-tablet-viewport-simulator" className="w-full bg-[#FAF9F6] border-8 border-[#121212] rounded-[48px] shadow-2xl overflow-hidden p-8 md:p-12 space-y-8 min-h-[600px] flex flex-col justify-between relative">
                    
                    {/* Security Frame Kiosk Locks */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-200 pb-5 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full" />
                        <span className="text-xs font-mono font-black text-[#121212] tracking-widest uppercase">
                          KIOSK MODE: PROVISIONED TABLET SHELL
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#121212] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold">
                        <Lock className="w-3.5 h-3.5 text-[#89CFF0]" />
                        <span>HARDWARE ID: LH-9910-EGY (Cairo General Hospital)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6">
                      
                      {/* Left: Instant Connect UX Info */}
                      <div className="space-y-5 text-left">
                        <span className="text-[11px] font-mono tracking-widest text-[#121212] uppercase bg-[#89CFF0]/30 px-3.5 py-1.5 rounded-full border border-[#89CFF0]/40 font-bold">
                          Zero-Friction Authentication Active
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#121212] leading-tight">
                          Instant Hospital VRI Gateway
                        </h2>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">
                          This terminal is dynamically mapped to Cairo General Hospital's enterprise monthly account ledger. No credentials, codes, or payment info required.
                        </p>
                        
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 space-y-2">
                          <p className="font-bold flex items-center gap-1.5 text-[#121212]">
                            <Building className="w-4 h-4 text-slate-700" />
                            Enterprise Service Level Agreement
                          </p>
                          <ul className="list-disc list-inside font-mono text-[10px] space-y-1">
                            <li>24/7 Clinical & Cultural Priority Routing</li>
                            <li>Bypasses standard consumer payment gateway</li>
                            <li>Appends session metrics directly post-call</li>
                          </ul>
                        </div>
                      </div>

                      {/* Right: Instant Select Dropdown + Connect Now Action Card */}
                      <div className="space-y-6">
                        
                        {/* 1. Language Dropdown */}
                        <div className="space-y-3">
                          <label htmlFor="b2b-language-selector" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block text-left">
                            Select Language Pair
                          </label>
                          <div className="relative">
                            <select
                              id="b2b-language-selector"
                              value={b2bLanguage}
                              onChange={(e) => setB2bLanguage(e.target.value)}
                              className="w-full bg-[#FAF9F6] border-4 border-[#121212] rounded-3xl px-6 py-4.5 text-lg font-black text-[#121212] focus:outline-none focus:ring-4 focus:ring-baby-blue cursor-pointer h-16"
                            >
                              <option value="English ⇄ Arabic">English ⇄ Arabic (Clinical Default)</option>
                              <option value="German ⇄ Arabic">German ⇄ Arabic (Historical Default)</option>
                              <option value="Russian ⇄ Arabic">Russian ⇄ Arabic (Trauma Emergency)</option>
                              <option value="French ⇄ Arabic">French ⇄ Arabic (Accredited Guide)</option>
                            </select>
                            <ChevronDown className="w-5 h-5 absolute right-4 top-5.5 text-slate-600 pointer-events-none" />
                          </div>
                        </div>

                        {/* 2. Service Selection Toggle */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setB2bServiceType('medical')}
                            className={`py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
                              b2bServiceType === 'medical'
                                ? 'bg-[#121212] text-[#FAF9F6] border-[#121212]'
                                : 'bg-[#FAF9F6] text-[#121212] border-slate-300'
                            }`}
                          >
                            <HeartPulse className="w-4 h-4" />
                            Clinical Medical
                          </button>
                          <button
                            onClick={() => setB2bServiceType('tourism')}
                            className={`py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
                              b2bServiceType === 'tourism'
                                ? 'bg-[#121212] text-[#FAF9F6] border-[#121212]'
                                : 'bg-[#FAF9F6] text-[#121212] border-slate-300'
                            }`}
                          >
                            <Compass className="w-4 h-4" />
                            Cultural Heritage
                          </button>
                        </div>

                        {/* 3. Giant Obsidian Black [Connect Now] Action Card */}
                        <button
                          id="btn-b2b-connect"
                          onClick={handleB2bConnect}
                          className="w-full min-h-[140px] bg-[#121212] hover:bg-black text-[#FAF9F6] hover:text-[#89CFF0] rounded-3xl p-6 flex flex-col justify-center items-center gap-2 transition-all active:scale-98 cursor-pointer border-4 border-[#121212] focus:outline-none focus:ring-4 focus:ring-[#89CFF0] animate-breathing-shadow text-center"
                          style={{ minHeight: '140px' }}
                        >
                          <PhoneCall className="w-10 h-10 text-[#89CFF0] animate-bounce" />
                          <span className="text-2xl font-black block tracking-tight">
                            Connect Now
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Est. setup: {b2bLanguage} Interpreter in 5s
                          </span>
                        </button>

                      </div>

                    </div>

                    {/* Footer Tablet Anchor */}
                    <div className="flex justify-between items-center border-t-2 border-slate-200 pt-5 text-slate-400 text-xs font-mono">
                      <span>NileBridge Enterprise Kiosk Client v4.8</span>
                      <span>Authorized Security Lock Enabled 🛡️</span>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* =======================================================
                LOADING STATE: Large Reassuring Text Block & Calming Pulse
                ======================================================= */}
            {clientState === 'loading' && (
              <div id="grandparent-loading-view" className="w-full text-center py-16 space-y-12 animate-fade-in">
                
                {/* Slow Calming Baby Blue Pulse Container */}
                <div className="flex justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-56 h-56 bg-[#89CFF0]/10 rounded-full animate-calm-pulse" />
                    <div className="absolute w-40 h-40 bg-[#89CFF0]/25 rounded-full animate-calm-pulse" style={{ animationDelay: '1s' }} />
                    <div className="relative w-28 h-28 bg-[#121212] rounded-full flex items-center justify-center border-4 border-[#89CFF0]">
                      <PhoneCall className="w-12 h-12 text-[#89CFF0] animate-bounce" />
                    </div>
                  </div>
                </div>

                {/* Large Reassuring Text Block (Enforced 32px+ Heading) */}
                <div className="space-y-6 max-w-xl mx-auto px-4">
                  <h2 className="text-4xl sm:text-5xl font-sans font-black text-[#121212] tracking-tight leading-tight">
                    Connecting you to a certified interpreter...
                  </h2>
                  <p className="text-2xl sm:text-3xl font-sans font-semibold text-slate-600 animate-pulse">
                    Please wait
                  </p>
                </div>

                <div className="bg-[#89CFF0]/10 border border-[#89CFF0]/20 px-6 py-4 rounded-2xl max-w-md mx-auto">
                  <p className="text-sm font-mono text-slate-600">
                    {deviceMode === 'b2b' 
                      ? `KIOSK ROUTING: Hospital account verified. Channeling peer-to-peer Agora stream...`
                      : `MOBILE ROUTING: Dynamic credit hold succeeded. Handshaking secure channel...`
                    }
                  </p>
                </div>

              </div>
            )}

            {/* =======================================================
                WEBRTC ACTIVE CALL VIEW: Elderly Optimized (85% Video Dominance)
                ======================================================= */}
            {clientState === 'active' && (
              <div id="grandparent-active-call" className="w-full animate-fade-in flex flex-col space-y-8">
                
                {/* Header info bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#121212] text-white p-5 rounded-3xl border border-white/10 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-xl font-sans font-black">
                      ACTIVE SECURE STREAM
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-sm bg-white/10 px-4 py-2 rounded-xl text-[#89CFF0]">
                    <span>DURATION: {Math.floor(callDurationSeconds / 60)}m {callDurationSeconds % 60}s</span>
                    <span>•</span>
                    <span>{deviceMode === 'b2b' ? 'B2B ACCOUNT' : 'B2C MOBILE'}</span>
                  </div>
                </div>

                {/* Video Dominance: Interpreter's feed occupies 85% of layout density focused on face for lip-reading */}
                <div className="w-full relative aspect-[4/3] sm:aspect-video bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#121212]">
                  
                  {/* Remote Video Stream (Interpreter's face dominates) */}
                  <div className="w-full h-full relative">
                    <img 
                      referrerPolicy="no-referrer"
                      src={
                        selectedService === 'medical' 
                          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200"
                          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200"
                      }
                      alt={selectedService === 'medical' ? "Medical Interpreter Dr. Amina El-Bakry" : "Tourism Guide Dmitry Sokolov"}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        isCameraFlipped ? 'scale-x-[-1]' : ''
                      }`} 
                    />

                    {/* Highly visible name banner */}
                    <div className="absolute top-6 left-6 bg-[#121212]/95 text-[#FAF9F6] border-2 border-[#89CFF0] px-6 py-3.5 rounded-2xl text-xl sm:text-2xl font-sans font-black flex items-center gap-3 shadow-lg">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
                      <span>{selectedService === 'medical' ? "Amina El-Bakry (Clinical Interpreter)" : "Dmitry Sokolov (Accredited Guide)"}</span>
                    </div>

                    {/* Local self-preview (smaller box in the corner, kept accessible and simple) */}
                    <div className="absolute top-6 right-6 w-36 h-28 rounded-2xl bg-black border-2 border-[#FAF9F6] overflow-hidden shadow-md">
                      <img 
                        referrerPolicy="no-referrer"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" 
                        alt="Your camera feed"
                        className="w-full h-full object-cover grayscale-[10%]"
                      />
                    </div>

                    {/* Massive, highly visible captions overlay to assist with lip-reading or auditory deficit */}
                    <div className="absolute bottom-6 inset-x-6 bg-[#121212]/95 text-[#FAF9F6] border-2 border-slate-700 p-6 rounded-2xl shadow-xl text-center flex flex-col justify-center items-center min-h-[100px]">
                      <span className="text-xs font-mono text-[#89CFF0] font-black uppercase tracking-widest mb-1 block">Live Caption Assist</span>
                      <p className="text-2xl sm:text-3xl font-sans font-black text-[#FAF9F6] leading-relaxed">
                        {selectedService === 'medical' 
                          ? '"Hello! I am Dr. Amina, your clinical interpreter. I am here to help you translate doctor prescriptions. Speak slowly."' 
                          : '"Welcome! I am Dmitry, your accredited heritage guide. Let me guide you through the ancient Egyptian structures."'
                        }
                      </p>
                    </div>
                  </div>

                </div>

                {/* 
                  UI Controls:
                  Remove all complex settings. Provide only three massive buttons at the bottom container.
                  Touch targets are well over 64x64px.
                */}
                <div className="flex flex-col gap-6 w-full pt-2">
                  
                  {/* Toggle Controls row */}
                  <div className="grid grid-cols-2 gap-6">
                    
                    {/* Toggle Microphone Button (Tactile 64x64px+) */}
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`h-20 rounded-2xl flex items-center justify-center gap-4 text-xl font-sans font-black border-4 transition-all cursor-pointer ${
                        isMicOn 
                          ? 'bg-[#121212] hover:bg-black text-[#FAF9F6] border-[#121212]' 
                          : 'bg-[#FAF9F6] text-[#121212] border-[#121212]'
                      }`}
                      style={{ minHeight: '80px' }}
                      aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {isMicOn ? (
                        <>
                          <Mic className="w-8 h-8 text-[#89CFF0]" />
                          <span>Mute Mic</span>
                        </>
                      ) : (
                        <>
                          <MicOff className="w-8 h-8 text-rose-500" />
                          <span>Mic Unmuted</span>
                        </>
                      )}
                    </button>

                    {/* Flip Camera Button (Tactile 64x64px+) */}
                    <button
                      onClick={() => setIsCameraFlipped(!isCameraFlipped)}
                      className="h-20 bg-[#121212] hover:bg-black text-[#FAF9F6] border-4 border-[#121212] rounded-2xl flex items-center justify-center gap-4 text-xl font-sans font-black transition-all cursor-pointer"
                      style={{ minHeight: '80px' }}
                      aria-label="Flip Camera Feed"
                    >
                      <RotateCw className="w-8 h-8 text-[#89CFF0]" />
                      <span>Flip Camera</span>
                    </button>

                  </div>

                  {/* 
                    Massive universally recognized pure Red (#FF3B30) "End Call" button 
                    stretching across the bottom width. Touch target well over 64x64px.
                  */}
                  <button
                    id="btn-grandparent-endcall"
                    onClick={handleEndCall}
                    className="w-full h-24 bg-[#FF3B30] hover:bg-[#E02424] text-white rounded-3xl flex items-center justify-center gap-4 shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all font-sans font-black text-2xl uppercase tracking-widest border-4 border-[#FF3B30] focus:ring-4 focus:ring-[#89CFF0] cursor-pointer"
                    style={{ minHeight: '96px' }}
                    aria-label="End Call and return to Home Screen"
                  >
                    <Volume2 className="w-8 h-8 animate-pulse text-[#FAF9F6]" />
                    <span>End Call & Process Billing</span>
                  </button>

                </div>

              </div>
            )}

            {/* =======================================================
                POST-CALL BILLING LEDGER / RECEIPT SCREEN
                ======================================================= */}
            {clientState === 'post_call_receipt' && (
              <div className="w-full bg-[#FAF9F6] border-4 border-[#121212] rounded-[40px] p-8 md:p-12 shadow-2xl space-y-8 text-center animate-fade-in">
                
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full border border-emerald-300 font-bold">
                    Ledger Logged Successfully
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-sans font-black text-[#121212]">
                    Session Receipt
                  </h2>
                  <p className="text-base text-slate-500 max-w-md mx-auto leading-relaxed">
                    The call duration and interpreter earning criteria were successfully audited and saved into the authoritarian ledger.
                  </p>
                </div>

                {/* Ledger Calculations Breakdown Card */}
                <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 text-left space-y-4 max-w-md mx-auto font-mono">
                  <div className="border-b border-slate-300/80 pb-3 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">Billing Class</span>
                    <span className="text-xs text-[#121212] font-black uppercase">
                      {deviceMode === 'b2b' ? 'B2B Enterprise Invoice' : 'B2C Credit Card Hold'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Service Mode:</span>
                      <span className="font-bold text-[#121212]">
                        {selectedService === 'medical' ? 'Clinical Medical' : 'Tourism Guide'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Device Frame:</span>
                      <span className="font-bold text-[#121212]">
                        {deviceMode === 'b2b' ? 'Institutional Tablet (LH-9910)' : 'Personal Mobile'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absolute Duration:</span>
                      <span className="font-bold text-[#121212]">{lastDurationSeconds} seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precise Minutes:</span>
                      <span className="font-bold text-[#121212]">{(lastDurationSeconds / 60).toFixed(4)} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language Tier Rate:</span>
                      <span className="font-bold text-[#121212]">
                        ${selectedService === 'medical' ? '2.80' : '3.20'}/min
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-300/80 pt-3 flex justify-between items-center text-sm font-bold">
                    <span className="text-[#121212]">Total Charged / Due:</span>
                    <span className="text-lg text-emerald-600 font-black">${lastEarningValue.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notice text for B2C vs B2B */}
                <div className="text-xs text-slate-500 max-w-md mx-auto">
                  {deviceMode === 'b2b' ? (
                    <p>
                      💡 <strong>B2B Kiosk Routing:</strong> This cost is automatically billed to the hospital's enterprise monthly account ledger. Guest/Patient credit profile remains untouched.
                    </p>
                  ) : (
                    <p>
                      💡 <strong>B2C Processing Complete:</strong> The dynamic credit hold was committed for the exact amount of ${lastEarningValue.toFixed(2)}. An automatic receipt was sent to your registered telephone number.
                    </p>
                  )}
                </div>

                {/* Return Home Button ( táctile over 64px ) */}
                <button
                  onClick={() => {
                    setClientState('idle');
                    setB2cStep('sms_otp');
                  }}
                  className="w-full max-w-md bg-[#121212] hover:bg-black text-[#FAF9F6] hover:text-[#89CFF0] font-black h-16 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  style={{ minHeight: '64px' }}
                >
                  <span>Return to Lobby</span>
                </button>

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
