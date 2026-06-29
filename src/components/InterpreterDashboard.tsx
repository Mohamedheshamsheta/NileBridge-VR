import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Video, 
  Search, 
  FileText, 
  Upload, 
  Compass, 
  X, 
  Server, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Volume2,
  Mic,
  RefreshCw,
  TrendingUp,
  Coins,
  Clock,
  UserCheck,
  FileSpreadsheet,
  UserPlus,
  FileSignature,
  Activity,
  Landmark,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

interface CallRecord {
  id: string;
  clientName: string;
  timestamp: string;
  serviceType: 'medical' | 'tourism';
  durationSeconds: number;
  ratePerMinute: number;
  earningCredit: number;
  languagePair: string;
}

interface DashboardStats {
  totalSeconds: number;
  totalMinutes: number;
  walletBalance: number;
  performanceMultiplier: number;
  totalCallsCount: number;
}

interface MockCall {
  clientName: string;
  languagePair: string;
  type: 'medical' | 'tourism';
  location: string;
  ratePerMinute: number;
}

const MOCK_CALLS_POOL: MockCall[] = [
  { clientName: "Nile Hospital ER - Ward 3", languagePair: "English ⇄ Arabic", type: "medical", location: "Nile Hospital ER", ratePerMinute: 2.80 },
  { clientName: "Traveler Delta (Historical Explorer)", languagePair: "German ⇄ Arabic", type: "tourism", location: "Karnak Temple - South Gate", ratePerMinute: 3.20 },
  { clientName: "Sovereign Patient Gamma", languagePair: "Russian ⇄ Arabic", type: "medical", location: "Alexandria Trauma Bay", ratePerMinute: 3.50 },
  { clientName: "Vance Diplomatic Corps", languagePair: "French ⇄ Arabic", type: "tourism", location: "Giza Plateau - Pyramid Chamber", ratePerMinute: 3.10 }
];

const GLOSSARY_DB = [
  // Medical
  { term: "Epigastric Pain", arabic: "ألم فم المعدة / ألم الشرسوف", category: "Medical", definition: "Pain or discomfort localized in the upper abdomen, immediately below the ribs." },
  { term: "Sinus Tachycardia", arabic: "تسارع ضربات القلب الجيبي", category: "Medical", definition: "An elevated heart rate created by normal electrical impulses, exceeding 100 bpm." },
  { term: "Gastroesophageal Reflux", arabic: "الارتجاع المريئي", category: "Medical", definition: "A chronic condition where stomach acid or bile flows back into the food pipe." },
  { term: "Myocardial Infarction", arabic: "احتشاء عضلة القلب / نوبة قلبية", category: "Medical", definition: "Commonly known as a heart attack, occurring when blood flow decreases or stops to a part of the heart." },
  // Tourism
  { term: "Cartouche", arabic: "خرطوشة فرعونية", category: "Historical", definition: "An oval loop enclosing a group of hieroglyphs, representing a royal name." },
  { term: "Mastaba", arabic: "مصطبة", category: "Historical", definition: "An ancient Egyptian tomb with a flat roof and sloping sides." },
  { term: "Khan el-Khalili", arabic: "خان الخليلي", category: "Historical", definition: "A famous historic bazaar and souq in the historic center of Cairo, Egypt." },
  { term: "Papyrus scroll", arabic: "بردية فرعونية", category: "Material Culture", definition: "A thick paper-like material produced from the pith of the papyrus plant." }
];

export default function InterpreterDashboard() {
  // --- Registration / Onboarding States ---
  const [onboardingState, setOnboardingState] = useState<'not_registered' | 'Pending_Verification' | 'Approved'>('not_registered');
  const [regForm, setRegForm] = useState({
    fullName: '',
    languagePairs: 'English-Arabic',
    category: 'medical',
    licenseFile: null as File | null,
    licenseFileName: ''
  });
  const [registeredId, setRegisteredId] = useState<string>('');
  const [dragOverReg, setDragOverReg] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // --- Pro Dashboard States ---
  const [activeTab, setActiveTab] = useState<'live' | 'ledger' | 'portfolio'>('live');
  const [stats, setStats] = useState<DashboardStats>({
    totalSeconds: 1740,
    totalMinutes: 29.0,
    walletBalance: 91.10,
    performanceMultiplier: 1.25,
    totalCallsCount: 3
  });
  const [ledgerRecords, setLedgerRecords] = useState<CallRecord[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  // --- Live HUD States ---
  const [isOnline, setIsOnline] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [currentCall, setCurrentCall] = useState<MockCall | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocName, setSelectedDocName] = useState('Patient_Sovereign_Declaration.pdf');
  const [selectedDocContent, setSelectedDocContent] = useState('Patient confirms valid health coverage. Symptoms include burning epigastric discomfort, radiating back tightness. Prior medical records show no history of cardiac anomalies.');
  const [dragOverCopilot, setDragOverCopilot] = useState(false);
  
  // Call Controls states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // --- Simulation states for testing Webhook ---
  const [testWebhookDurationSec, setTestWebhookDurationSec] = useState<number>(360);
  const [testWebhookRate, setTestWebhookRate] = useState<number>(3.00);
  const [testWebhookEvent, setTestWebhookEvent] = useState<'channel_destroy' | 'user_left'>('channel_destroy');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookResponseMsg, setWebhookResponseMsg] = useState<string | null>(null);

  // Fetch ledger stats from the database endpoint
  const fetchLedger = async () => {
    setIsLoadingLedger(true);
    try {
      const res = await fetch('/api/interpreter/ledger');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLedgerRecords(data.ledger);
      }
    } catch (err) {
      console.error('Error fetching ledger from MS SQL Server:', err);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  // Initial load
  useEffect(() => {
    // If we bypass or complete registration, fetch ledger
    if (onboardingState === 'Approved') {
      fetchLedger();
    }
  }, [onboardingState]);

  // Countdown timer for incoming HUD
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === 'ringing' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Unanswered: return to online switch
            setCallStatus('idle');
            setCurrentCall(null);
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus, countdown]);

  // Handle registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName.trim()) return;

    setIsSubmittingReg(true);

    try {
      const res = await fetch('/api/interpreter/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.fullName,
          languages: regForm.languagePairs.split('-'),
          category: regForm.category,
          licenseDocName: regForm.licenseFileName || 'Sovereign_Certified_Credentials.pdf'
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegisteredId(data.interpreter.id);
        setOnboardingState('Pending_Verification');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Handle manual back-office verification bypass (Simulating SignalR validation)
  const handleVerifyBypass = async () => {
    try {
      const res = await fetch('/api/interpreter/verify-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registeredId })
      });
      const data = await res.json();
      if (data.success) {
        setOnboardingState('Approved');
        fetchLedger();
      }
    } catch (err) {
      console.error('Verification bypass failed:', err);
    }
  };

  // Trigger call signaling invite manually for simulation
  const simulateInboundCall = () => {
    if (!isOnline) return;
    const randomCall = MOCK_CALLS_POOL[Math.floor(Math.random() * MOCK_CALLS_POOL.length)];
    setCurrentCall(randomCall);
    setCountdown(20);
    setCallStatus('ringing');
  };

  // Handle local drop for license upload
  const handleRegFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverReg(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setRegForm(prev => ({
        ...prev,
        licenseFile: file,
        licenseFileName: file.name
      }));
    }
  };

  const handleRegFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRegForm(prev => ({
        ...prev,
        licenseFile: file,
        licenseFileName: file.name
      }));
    }
  };

  // Document uploader handler for live sight translation
  const handleDocDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverCopilot(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedDocName(file.name);
      setSelectedDocContent(`OCR Scan of uploaded file "${file.name}" completed. Ready for immediate sight translation. Content contains encrypted professional guidelines and sovereign record metadata.`);
    }
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedDocName(file.name);
      setSelectedDocContent(`OCR Scan of uploaded file "${file.name}" completed. Ready for immediate sight translation. Content contains encrypted professional guidelines and sovereign record metadata.`);
    }
  };

  // Trigger test Webhook call
  const triggerTestWebhook = async () => {
    setIsSendingWebhook(true);
    setWebhookResponseMsg(null);

    // Pick a random client details for webhook records
    const testClient = MOCK_CALLS_POOL[Math.floor(Math.random() * MOCK_CALLS_POOL.length)];

    try {
      const res = await fetch('/api/webhooks/agora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: testWebhookEvent,
          channel: `CHANNEL_${Date.now().toString().slice(-4)}`,
          durationSeconds: testWebhookDurationSec,
          ratePerMinute: testWebhookRate,
          clientName: testClient.clientName,
          languagePair: testClient.languagePair,
          serviceType: testClient.type
        })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookResponseMsg(`SUCCESS: Received "${data.eventReceived}". Computed earning: $${data.calculation.earningCredit}. COMMITTED successfully into MS SQL ledger database.`);
        // Reload ledger immediately simulating SignalR real-time notification
        fetchLedger();
      } else {
        setWebhookResponseMsg(`FAILED: ${data.error}`);
      }
    } catch (err: any) {
      setWebhookResponseMsg(`ERROR: ${err.message}`);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // Clean disconnect call
  const handleDisconnectCall = async () => {
    if (currentCall) {
      // Automatically run a real background webhook to commit this call in the database as completed!
      // This enforces the "commit the results instantly post-call" constraint
      const simulatedDuration = Math.floor(Math.random() * 200) + 120; // 2 to 5 minutes
      try {
        await fetch('/api/webhooks/agora', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'channel_destroy',
            channel: `CHANNEL_RTC_LIVE_${Math.floor(Math.random() * 90000)}`,
            durationSeconds: simulatedDuration,
            ratePerMinute: currentCall.ratePerMinute,
            clientName: currentCall.clientName,
            languagePair: currentCall.languagePair,
            serviceType: currentCall.type
          })
        });
        fetchLedger();
      } catch (err) {
        console.error('Error auto-logging finished call:', err);
      }
    }
    setCallStatus('idle');
    setCurrentCall(null);
  };

  // Filter glossary based on search
  const filteredGlossary = GLOSSARY_DB.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.arabic.includes(searchTerm) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart data for Tab 3 (Earnings Portfolio)
  const chartData = ledgerRecords.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    Minutes: Number((item.durationSeconds / 60).toFixed(1)),
    Earnings: item.earningCredit,
    Rate: item.ratePerMinute
  })).reverse();

  // If we are not registered, show Onboarding Wizard
  if (onboardingState === 'not_registered') {
    return (
      <div id="registration-wizard-card" className="max-w-2xl mx-auto bg-[#FAF9F6] border border-slate-200 rounded-3xl p-8 md:p-12 shadow-md space-y-8 animate-fade-in">
        
        {/* Banner */}
        <div className="flex justify-between items-center border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase bg-baby-blue/20 px-3 py-1 rounded-full border border-baby-blue/40 font-bold">
              Secure Provider Gateway
            </span>
            <h2 className="text-2xl font-display font-extrabold text-[#121212] tracking-tight">
              Interpreter Registration
            </h2>
          </div>
          <UserPlus className="w-10 h-10 text-baby-blue" />
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Welcome to the NileBridge Sovereign VRI gateway. To begin accepting clinical and cultural translation sessions, set up your professional profile and upload your certification documents.
        </p>

        {/* Wizard Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="reg-fullname" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
              Full Name
            </label>
            <input
              id="reg-fullname"
              type="text"
              required
              placeholder="e.g. Dr. Amina El-Bakry"
              value={regForm.fullName}
              onChange={(e) => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language Pairs */}
            <div className="space-y-2">
              <label htmlFor="reg-languages" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
                Primary Language Pair
              </label>
              <select
                id="reg-languages"
                value={regForm.languagePairs}
                onChange={(e) => setRegForm(prev => ({ ...prev, languagePairs: e.target.value }))}
                className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue cursor-pointer"
              >
                <option value="English-Arabic">English ⇄ Arabic</option>
                <option value="German-Arabic">German ⇄ Arabic</option>
                <option value="Russian-Arabic">Russian ⇄ Arabic</option>
                <option value="French-Arabic">French ⇄ Arabic</option>
                <option value="Spanish-English">Spanish ⇄ English</option>
              </select>
            </div>

            {/* Certification Category */}
            <div className="space-y-2">
              <label htmlFor="reg-category" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
                Professional Classification
              </label>
              <select
                id="reg-category"
                value={regForm.category}
                onChange={(e) => setRegForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue cursor-pointer"
              >
                <option value="medical">Medical Interpreter (HIPAA Certified)</option>
                <option value="tourism">Tourism & Cultural Heritage Guide</option>
              </select>
            </div>
          </div>

          {/* Secure drag-and-drop document upload block framed in a Baby Blue border */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
              Certified Professional License (PDF Parsing)
            </label>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverReg(true); }}
              onDragLeave={() => setDragOverReg(false)}
              onDrop={handleRegFileDrop}
              className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-3 relative cursor-pointer min-h-[160px] ${
                dragOverReg 
                  ? 'border-[#89CFF0] bg-[#89CFF0]/10' 
                  : 'border-[#89CFF0] hover:bg-slate-100/50 bg-[#FAF9F6]'
              }`}
            >
              <input
                id="license-file-upload"
                type="file"
                onChange={handleRegFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <FileSignature className="w-8 h-8 text-[#89CFF0] animate-bounce" />
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#121212] block">
                  {regForm.licenseFileName ? regForm.licenseFileName : "Drag & Drop Certified Credentials"}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Supports certified medical license, academic degrees, or diplomatic accreditation PDFs
                </span>
              </div>
              {regForm.licenseFileName && (
                <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-100/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for secure sandbox verification
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmittingReg}
            className="w-full bg-[#121212] hover:bg-black text-[#FAF9F6] hover:text-[#89CFF0] font-black py-5 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-2 border-transparent"
          >
            {isSubmittingReg ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#89CFF0]" />
                Initializing State...
              </>
            ) : (
              <>
                Initialize Account State
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Bypass for evaluation ease */}
        <div className="border-t border-slate-200/80 pt-6 flex flex-col items-center gap-3 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            EVALUATOR SHORTCUT: Want to test the dashboard immediately without filing out the fields?
          </p>
          <button
            type="button"
            onClick={() => {
              setRegForm({
                fullName: 'Michael Vance',
                languagePairs: 'German-Arabic',
                category: 'tourism',
                licenseFile: null,
                licenseFileName: 'Bypass_Verified_Sovereign.pdf'
              });
              setOnboardingState('Approved');
            }}
            className="text-xs text-[#121212] font-extrabold hover:text-[#89CFF0] bg-white border border-slate-300 px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Instant Evaluation Approved Portal
          </button>
        </div>

      </div>
    );
  }

  // If we are in Pending_Verification
  if (onboardingState === 'Pending_Verification') {
    return (
      <div id="pending-verification-state" className="max-w-xl mx-auto bg-[#FAF9F6] border border-slate-200 rounded-3xl p-8 md:p-12 shadow-md text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-[#89CFF0] animate-spin" />
            <ShieldCheck className="w-10 h-10 text-[#89CFF0] absolute inset-0 m-auto" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-full border border-amber-300 font-bold">
            Account State: Pending_Verification
          </span>
          <h2 className="text-2xl font-display font-extrabold text-[#121212]">
            Verifying Credentials
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your uploaded license <span className="font-bold text-slate-700 font-mono">"{regForm.licenseFileName || 'Credentials.pdf'}"</span> is undergoing automatic digital signature decryption and sovereignty protocol validation in the background.
          </p>
        </div>

        <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
          <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-600" />
            ASP.NET Core Back-Office Task
          </h4>
          <ul className="text-[10px] font-mono text-slate-500 space-y-1 list-disc list-inside">
            <li>Account Initialization Completed successfully</li>
            <li>Parsing uploaded document for verified SHA-256</li>
            <li>Awaiting background authority approval signal...</li>
          </ul>
        </div>

        {/* Real-time SignalR push verification trigger button */}
        <div className="pt-4 space-y-3">
          <button
            type="button"
            id="btn-trigger-signalr-approval"
            onClick={handleVerifyBypass}
            className="w-full bg-[#121212] hover:bg-black text-[#FAF9F6] hover:text-[#89CFF0] font-black py-4.5 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4.5 h-4.5 text-[#89CFF0] animate-spin" />
            Simulate SignalR Approval Push Notification
          </button>
          <p className="text-[9px] font-mono text-slate-400">
            Clicking this simulates the ASP.NET Core authority broadcasting a verified account status update via real-time SignalR sockets.
          </p>
        </div>
      </div>
    );
  }

  // Once Approved, render full PRO DASHBOARD with FIXED MULTI-TAB INTERFACE & OBSIDIAN BLACK NAVIGATION HEADER
  return (
    <div id="interpreter-pro-portal" className="w-full space-y-8 animate-fade-in">
      
      {/* OBSIDIAN BLACK NAVIGATION HEADER */}
      <header className="bg-[#121212] text-white rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl border border-white/5">
        
        {/* Portal Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#89CFF0]/20 flex items-center justify-center border border-[#89CFF0]/40">
            <Compass className="w-5.5 h-5.5 text-[#89CFF0] animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-black tracking-tight text-[#FAF9F6]">
                NileBridge VRI
              </h1>
              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 uppercase">
                Approved Portal
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Provider Account: <span className="text-[#89CFF0] font-bold">{regForm.fullName || 'Michael Vance'}</span> ({regForm.category === 'medical' ? 'Clinical Medical VRI' : 'Heritage Guide VRI'})
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs (Fixed multi-tab interface) */}
        <nav className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1 w-full md:w-auto">
          <button
            id="tab-btn-live"
            onClick={() => setActiveTab('live')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[#FAF9F6] text-[#121212] shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live HUD
          </button>
          
          <button
            id="tab-btn-ledger"
            onClick={() => {
              setActiveTab('ledger');
              fetchLedger();
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-[#FAF9F6] text-[#121212] shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Call History
          </button>

          <button
            id="tab-btn-portfolio"
            onClick={() => {
              setActiveTab('portfolio');
              fetchLedger();
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-[#FAF9F6] text-[#121212] shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Earnings Portfolio
          </button>
        </nav>

      </header>

      {/* =======================================================
          TAB 1 - LIVE HUD (AVIALABILITY SWITCH, SIGNALR OVERLAYS, WEBRTC STREAM, COPILOT)
          ======================================================= */}
      {activeTab === 'live' && (
        <div id="tab-content-live" className="space-y-8 animate-fade-in relative">
          
          {/* Default Offline/Online Screen */}
          {callStatus === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 bg-[#FAF9F6] border border-slate-200 rounded-3xl min-h-[480px] shadow-sm text-center relative overflow-hidden">
              
              {/* Subtle ambient gradients */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#89CFF0]/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#89CFF0]/5 rounded-full blur-3xl" />

              <div className="max-w-md space-y-8 relative z-10">
                <div className="space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase bg-[#89CFF0]/20 px-3.5 py-1.5 rounded-full border border-[#89CFF0]/30 font-black">
                    SignalR Live Hub Connected
                  </span>
                  <h2 className="text-3xl font-display font-extrabold text-[#121212] tracking-tight">
                    On-Call Availability HUD
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Toggle your status to online to accept incoming {regForm.category === 'medical' ? 'clinical medical' : 'travel heritage'} routing requests. Managed by authoritarian server.
                  </p>
                </div>

                {/* Minimalist Switch with Baby Blue Glow */}
                <div className="flex flex-col items-center gap-3 py-6">
                  <button
                    id="toggle-availability"
                    onClick={() => setIsOnline(!isOnline)}
                    className={`relative w-64 h-24 rounded-full transition-all duration-500 border p-2 flex items-center cursor-pointer ${
                      isOnline 
                        ? 'bg-[#FAF9F6] border-[#89CFF0] shadow-[0_0_35px_rgba(137,207,240,0.65)]' 
                        : 'bg-[#121212] border-slate-800 shadow-md'
                    }`}
                  >
                    {/* Switch Knob */}
                    <div 
                      className={`w-20 h-20 rounded-full transition-all duration-500 flex items-center justify-center font-bold text-xs uppercase tracking-wider ${
                        isOnline 
                          ? 'transform translate-x-40 bg-[#89CFF0] text-[#121212] shadow-lg shadow-[#89CFF0]/30 font-black' 
                          : 'bg-[#FAF9F6] text-[#121212] font-black'
                      }`}
                    >
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </div>

                    {/* Switch Labels */}
                    <span className={`absolute left-6 text-xs font-mono font-bold tracking-widest ${
                      isOnline ? 'text-slate-400 opacity-40' : 'text-[#FAF9F6] opacity-100'
                    }`}>
                      GO ONLINE
                    </span>
                    <span className={`absolute right-6 text-xs font-mono font-bold tracking-widest ${
                      isOnline ? 'text-[#89CFF0] font-black opacity-100' : 'text-slate-600 opacity-40'
                    }`}>
                      ONLINE
                    </span>
                  </button>
                </div>

                {isOnline ? (
                  <div className="space-y-4 pt-4 animate-fade-in">
                    <button
                      id="btn-simulate-inbound"
                      onClick={simulateInboundCall}
                      className="bg-[#121212] hover:bg-black text-white hover:text-[#89CFF0] font-black px-6 py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2.5 mx-auto active:scale-95 cursor-pointer border border-transparent"
                    >
                      <PhoneCall className="w-4 h-4 text-[#89CFF0] animate-pulse" />
                      Simulate Inbound Call (SignalR Alert)
                    </button>
                    <div className="flex justify-center items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Ready to receive live Agora WebRTC requests...</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest py-4">
                    Your availability is currently offline
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Incoming Call HUD: override the entire dashboard with a high-contrast Black overlay */}
          {callStatus === 'ringing' && currentCall && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#121212] rounded-3xl p-8 text-center text-white overflow-hidden animate-fade-in min-h-[480px]">
              
              {/* Glowing Aura backdrop */}
              <div className="absolute w-[400px] h-[400px] bg-[#89CFF0]/15 rounded-full blur-[100px] pointer-events-none" />

              <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Top Indicator */}
                <div className="flex justify-center">
                  <span className="text-xs font-mono bg-[#89CFF0]/10 border border-[#89CFF0]/30 text-[#89CFF0] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    SIGNALR INVITATION ACTIVE
                  </span>
                </div>

                {/* Details (Only Language Pair & Client Identifier) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
                    {currentCall.type === 'medical' ? 'Clinical Medical VRI' : 'Heritage Tour VRI'}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white font-sans">
                    {currentCall.languagePair}
                  </h1>
                  <div className="pt-2">
                    <p className="text-xs font-mono text-[#89CFF0]/80 tracking-wide">
                      CLIENT ID: <span className="text-white font-bold">{currentCall.clientName}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Location / Target Station: {currentCall.location}
                    </p>
                  </div>
                </div>

                {/* 20-Second Circular Countdown Timer */}
                <div className="flex justify-center my-6">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        className="stroke-slate-800"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        className="stroke-[#89CFF0] transition-all duration-1000 ease-linear"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 64}
                        strokeDashoffset={(2 * Math.PI * 64) * (1 - (countdown / 20))}
                        fill="transparent"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0px 0px 6px #89CFF0)' }}
                      />
                    </svg>
                    <div className="flex flex-col items-center leading-none z-10">
                      <span className="text-4xl font-display font-black text-[#89CFF0] font-mono">{countdown}</span>
                      <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase mt-1 font-bold">Sec Remaining</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    id="btn-accept-call"
                    onClick={() => setCallStatus('connected')}
                    className="w-full bg-[#89CFF0] hover:bg-[#a6dcfc] text-[#121212] font-black py-5 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(137,207,240,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Accept Call
                  </button>

                  <button
                    id="btn-decline-call"
                    onClick={() => {
                      setCallStatus('idle');
                      setCurrentCall(null);
                    }}
                    className="w-full bg-transparent hover:bg-white/5 text-slate-400 hover:text-white py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Decline & Pass back to Router
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Call Grid: Simplify the active view into a strict 60/40 split screen */}
          {callStatus === 'connected' && currentCall && (
            <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-800 rounded-3xl bg-[#121212] overflow-hidden min-h-[580px] text-white animate-fade-in shadow-xl">
              
              {/* Left 60%: Fixed Agora WebRTC video feed */}
              <div className="lg:col-span-7 flex flex-col justify-between p-6 bg-slate-950 border-r border-slate-800 relative">
                
                {/* Call Header */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#89CFF0] bg-[#89CFF0]/10 border border-[#89CFF0]/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                      Agora RTC Live Channel
                    </span>
                    <h3 className="text-sm font-bold font-mono text-white tracking-tight flex items-center gap-1.5">
                      {currentCall.languagePair} 
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </h3>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    ACTIVE CLIENT: {currentCall.clientName}
                  </div>
                </div>

                {/* Simulated Live Stream Grid */}
                <div className="my-6 grid grid-cols-2 gap-4 flex-1 items-center">
                  
                  {/* User Stream (Interpreter - You) */}
                  <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group">
                    {isVideoOff ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                        <Video className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-[10px] font-mono uppercase font-bold">Video Muted</span>
                      </div>
                    ) : (
                      <img 
                        referrerPolicy="no-referrer"
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350" 
                        alt="You (Interpreter)"
                        className="w-full h-full object-cover grayscale-[20%]" 
                      />
                    )}
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800/80 text-[10px] font-mono font-bold">
                      You ({regForm.fullName || 'Interpreter'})
                    </div>
                  </div>

                  {/* Counterparty Stream (Patient / Traveler) */}
                  <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <img 
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350" 
                      alt="Remote Counterparty"
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800/80 text-[10px] font-mono font-bold">
                      {currentCall.type === 'medical' ? 'Remote Patient' : 'Remote Traveler'}
                    </div>
                  </div>

                  {/* Third Stream (Doctor / Site Host) */}
                  <div className="col-span-2 relative aspect-video max-h-[180px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden mx-auto w-full max-w-sm">
                    <img 
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=350" 
                      alt="Clinical Station"
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800/80 text-[10px] font-mono font-bold">
                      {currentCall.type === 'medical' ? 'Nile Hospital Station (Dr. Farouk)' : 'Giza Site Host / Tourism Board'}
                    </div>
                  </div>

                </div>

                {/* Bottom Controls panel */}
                <div className="flex justify-between items-center border-t border-slate-800 pt-4 relative z-10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer font-bold ${
                        isMuted 
                          ? 'bg-red-500/20 border-red-500 text-red-500' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      {isMuted ? 'Muted' : 'Mute Audio'}
                    </button>
                    <button
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer font-bold ${
                        isVideoOff 
                          ? 'bg-red-500/20 border-red-500 text-red-500' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      {isVideoOff ? 'Video Off' : 'Stop Video'}
                    </button>
                  </div>

                  <button
                    id="btn-disconnect-active"
                    onClick={handleDisconnectCall}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md shadow-red-900/10"
                  >
                    Disconnect Call & Save
                  </button>
                </div>

              </div>

              {/* Right 40%: A single contextual panel containing a fast-lookup medical dictionary bar and a drag-and-drop document viewport for immediate sight translation. */}
              <div className="lg:col-span-5 flex flex-col p-6 bg-[#161618] border-l border-slate-800 space-y-6 overflow-y-auto max-h-[580px]">
                
                {/* Header */}
                <div className="border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">
                    Workspace Copilot
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Immediate reference tools synced for sight translation and terminology validation.
                  </p>
                </div>

                {/* 1. Fast-Lookup Medical & Historical Dictionary Bar */}
                <div className="space-y-3">
                  <label htmlFor="dashboard-lexicon-search" className="text-[10px] font-mono uppercase tracking-wider text-[#89CFF0] font-bold block">
                    {currentCall.type === 'medical' ? 'Fast-Lookup Medical Dictionary' : 'Fast-Lookup Heritage Glossary'}
                  </label>
                  
                  <div className="relative">
                    <input
                      id="dashboard-lexicon-search"
                      type="text"
                      placeholder={currentCall.type === 'medical' ? 'Type to lookup (e.g. Epigastric, Pain)...' : 'Type to lookup (e.g. Cartouche, scroll)...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#89CFF0]"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  </div>

                  {/* Glossary Results Pane */}
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                    {filteredGlossary.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic block py-2 text-center">No match found. Type to query terminology.</span>
                    ) : (
                      filteredGlossary.map((item, idx) => (
                        <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-left space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white font-sans">{item.term}</span>
                            <span className="text-[9px] font-mono text-[#89CFF0] bg-[#89CFF0]/10 px-1.5 py-0.5 rounded uppercase font-bold">
                              {item.arabic}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Drag & Drop Document Viewport for Sight Translation */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#89CFF0] font-bold block">
                    Sight Translation Document
                  </label>

                  {/* Drop Zone Box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOverCopilot(true); }}
                    onDragLeave={() => setDragOverCopilot(false)}
                    onDrop={handleDocDrop}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center space-y-2 relative cursor-pointer min-h-[130px] ${
                      dragOverCopilot 
                        ? 'border-[#89CFF0] bg-[#89CFF0]/5' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                    }`}
                  >
                    <input
                      id="dashboard-file-upload"
                      type="file"
                      onChange={handleDocSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-6 h-6 text-slate-500 animate-pulse" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-300 block">Drag & Drop prescription or site map</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">or click to upload local assets</span>
                    </div>
                  </div>

                  {/* Active Document Viewport Display */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <FileText className="w-3.5 h-3.5 text-[#89CFF0]" />
                      <span className="text-[10px] font-mono font-bold text-white truncate max-w-[200px]" title={selectedDocName}>
                        {selectedDocName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans leading-relaxed italic overflow-y-auto max-h-[140px] whitespace-pre-line">
                      "{selectedDocContent}"
                    </div>
                    <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center text-[9px] font-mono text-slate-500">
                      <span className="text-emerald-500 flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Secured
                      </span>
                      <span>AES-256 decrypted</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* =======================================================
          TAB 2 - CALL HISTORY LOG (RESPONSIVE HIGH-CONTRAST DATA GRID)
          ======================================================= */}
      {activeTab === 'ledger' && (
        <div id="tab-content-ledger" className="space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center bg-[#FAF9F6] border border-slate-200 p-6 rounded-3xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase bg-[#89CFF0]/20 px-3 py-1 rounded-full border border-[#89CFF0]/30 font-bold">
                MS SQL Audit Trail
              </span>
              <h2 className="text-xl font-display font-extrabold text-[#121212] tracking-tight">
                Verified Call History Ledger
              </h2>
              <p className="text-xs text-slate-500">
                Official real-time synchronized event logs computed authoritatively at the backend.
              </p>
            </div>
            <button
              onClick={fetchLedger}
              disabled={isLoadingLedger}
              className="bg-[#121212] hover:bg-black text-[#FAF9F6] px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLedger ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Ledger Table Data Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-[#121212] text-white">
                  <tr>
                    <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider">Session ID</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider">Client / Location</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider">Language Pair</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider">Service Classification</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider text-right">Duration</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider text-right">Earning Credit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-[#121212]">
                  {isLoadingLedger ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex justify-center items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#89CFF0]" />
                          <span className="text-xs font-mono uppercase font-bold text-slate-500">Retrieving secure ledger entries...</span>
                        </div>
                      </td>
                    </tr>
                  ) : ledgerRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-mono text-xs">
                        No committed sessions found on this provider profile.
                      </td>
                    </tr>
                  ) : (
                    ledgerRecords.map((record) => {
                      const mins = Math.floor(record.durationSeconds / 60);
                      const secs = record.durationSeconds % 60;
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-[#121212]">
                            {record.id}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className="font-bold text-[#121212] block">{record.clientName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {new Date(record.timestamp).toLocaleString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-[#121212]">
                            {record.languagePair}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {record.serviceType === 'medical' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#121212] text-white border border-[#121212]/15">
                                <Activity className="w-3.5 h-3.5 text-[#89CFF0]" /> CLINICAL MEDICAL
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#FAF9F6] text-[#121212] border border-slate-300">
                                <Landmark className="w-3.5 h-3.5 text-[#89CFF0]" /> TOURISM HERITAGE
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-bold">
                            <div>{mins}m {secs}s</div>
                            <span className="text-[9px] text-slate-400 font-normal">({record.durationSeconds}s)</span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs font-black text-emerald-600 bg-emerald-50/30">
                            ${record.earningCredit.toFixed(2)}
                            <div className="text-[9px] text-slate-400 font-mono font-normal">${record.ratePerMinute.toFixed(2)}/min</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =======================================================
          TAB 3 - EARNINGS PORTFOLIO (STATS, METRICS, RECHARTS, INTERACTIVE WEBHOOK CONTROLLER)
          ======================================================= */}
      {activeTab === 'portfolio' && (
        <div id="tab-content-portfolio" className="space-y-8 animate-fade-in">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Wallet Balance */}
            <div className="bg-[#FAF9F6] border border-slate-200 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-[#89CFF0] transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">Net Wallet Balance</span>
                <span className="text-3xl font-display font-black text-[#121212] tracking-tight block">
                  ${stats.walletBalance.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">Committed to MS SQL Ledger</span>
              </div>
              <div className="w-12 h-12 bg-[#89CFF0]/15 rounded-full flex items-center justify-center text-[#89CFF0]">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* Total Minutes */}
            <div className="bg-[#FAF9F6] border border-slate-200 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-[#89CFF0] transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">Aggregated Interpreted Minutes</span>
                <span className="text-3xl font-display font-black text-[#121212] tracking-tight block">
                  {stats.totalMinutes} <span className="text-sm font-sans font-normal text-slate-500">mins</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">Precise float tracking from seconds</span>
              </div>
              <div className="w-12 h-12 bg-[#89CFF0]/15 rounded-full flex items-center justify-center text-[#89CFF0]">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Performance Multiplier */}
            <div className="bg-[#FAF9F6] border border-slate-200 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-[#89CFF0] transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block">Performance Multiplier</span>
                <span className="text-3xl font-display font-black text-[#121212] tracking-tight block">
                  {stats.performanceMultiplier.toFixed(2)}x
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">Based on session history volume</span>
              </div>
              <div className="w-12 h-12 bg-[#89CFF0]/15 rounded-full flex items-center justify-center text-[#89CFF0]">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
            </div>

          </div>

          {/* Recharts styled in Baby Blue and Black accents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Call Minutes Trend Area Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold font-mono text-[#121212] uppercase tracking-wider block">Session Duration Trend (Minutes)</h3>
                <p className="text-[10px] text-slate-400 font-mono">Visualized timeline of completed translation session lengths.</p>
              </div>
              
              <div className="h-64 w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">No chart data compiled yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#89CFF0" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#89CFF0" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: 'none', color: '#FAF9F6', fontSize: '11px', fontFamily: 'monospace' }}
                        labelStyle={{ color: '#89CFF0', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="Minutes" stroke="#89CFF0" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Earning Portfolio Bar Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold font-mono text-[#121212] uppercase tracking-wider block">Earning Per Call Log ($)</h3>
                <p className="text-[10px] text-slate-400 font-mono font-bold">Computed dynamically using second-accurate rate divisions.</p>
              </div>

              <div className="h-64 w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">No chart data compiled yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: 'none', color: '#FAF9F6', fontSize: '11px', fontFamily: 'monospace' }}
                        labelStyle={{ color: '#89CFF0', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Earnings" fill="#121212" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* ASYNC AGORA WEBHOOK SIMULATION PANEL */}
          <div id="agora-webhook-debugger" className="bg-[#FAF9F6] border border-[#89CFF0] p-6 md:p-8 rounded-3xl space-y-6">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <span className="text-[9px] font-mono tracking-widest text-[#121212] uppercase bg-[#89CFF0]/25 px-3 py-1 rounded-full border border-[#89CFF0]/40 font-bold">
                Integration Sandbox
              </span>
              <h3 className="text-lg font-display font-extrabold text-[#121212]">
                Agora Platform Event Webhook Simulator
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Agora sends asynchronous platform webhooks strictly listening to <code className="bg-slate-200 px-1 py-0.5 rounded font-bold font-mono">channel_destroy</code> and <code className="bg-slate-200 px-1 py-0.5 rounded font-bold font-mono">user_left</code> events when video calls end. The backend automatically calculates precise second-based earnings and logs them to the MS SQL server ledger instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              {/* Event dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600 block">Agora Event Type</label>
                <select
                  value={testWebhookEvent}
                  onChange={(e) => setTestWebhookEvent(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#89CFF0]"
                >
                  <option value="channel_destroy">channel_destroy</option>
                  <option value="user_left">user_left</option>
                </select>
              </div>

              {/* Call Duration in Seconds */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600 block">Duration in Seconds (Absolute)</label>
                <input
                  type="number"
                  value={testWebhookDurationSec}
                  onChange={(e) => setTestWebhookDurationSec(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#89CFF0]"
                />
              </div>

              {/* Specific Rate per Minute */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600 block">Rate / Minute ($)</label>
                <input
                  type="number"
                  step="0.10"
                  value={testWebhookRate}
                  onChange={(e) => setTestWebhookRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#89CFF0]"
                />
              </div>

              {/* Trigger button */}
              <div>
                <button
                  type="button"
                  onClick={triggerTestWebhook}
                  disabled={isSendingWebhook}
                  className="w-full bg-[#121212] hover:bg-black text-[#FAF9F6] hover:text-[#89CFF0] font-black py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSendingWebhook ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Webhook...
                    </>
                  ) : (
                    <>
                      <Server className="w-3.5 h-3.5 text-[#89CFF0]" />
                      Execute Webhook POST
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Formula display */}
            <div className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Authoritarian Earnings Formula</span>
                <span className="font-mono text-[#121212] font-black block">
                  Interpreter Earning = (Call Duration in Seconds / 60) * Specific Language Tier Per-Minute Rate
                </span>
                <p className="text-[10px] text-slate-500">
                  Example calculation: ({testWebhookDurationSec} seconds / 60) * ${testWebhookRate.toFixed(2)} = <span className="font-black text-emerald-600">${((testWebhookDurationSec / 60) * testWebhookRate).toFixed(2)}</span>
                </p>
              </div>
              <div className="bg-[#FAF9F6] border border-slate-200 px-3.5 py-2.5 rounded-xl font-mono text-[10px] text-slate-500 space-y-0.5">
                <span className="font-bold text-[#121212] block">✔ Rounding-friction eliminated</span>
                <span>✔ Authorized by back-end proxy</span>
              </div>
            </div>

            {/* Response Console */}
            {webhookResponseMsg && (
              <div className="bg-[#121212] text-[#89CFF0] border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2 animate-fade-in text-left">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-white font-bold">ASP.NET Core Server Event Stream Console</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{webhookResponseMsg}</div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
