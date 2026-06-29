import { useState, useEffect } from 'react';
import { CallSession } from '../types';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ClipboardList, 
  TrendingUp, 
  Zap, 
  Server, 
  Settings, 
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface BillingEngineProps {
  session: CallSession;
}

interface HistoricalSession {
  id: string;
  date: string;
  languages: string;
  durationMinutes: number;
  ratePerMinute: number;
  platformMargin: number;
  totalCost: number;
  status: string;
}

const HISTORICAL_SESSIONS: HistoricalSession[] = [
  {
    id: 'bil-1',
    date: 'Jun 27, 2026',
    languages: 'English ⇄ Arabic',
    durationMinutes: 14.5,
    ratePerMinute: 2.80,
    platformMargin: 3.50,
    totalCost: 44.10,
    status: 'Settled',
  },
  {
    id: 'bil-2',
    date: 'Jun 24, 2026',
    languages: 'Russian ⇄ Arabic',
    durationMinutes: 28.2,
    ratePerMinute: 3.20,
    platformMargin: 3.50,
    totalCost: 93.74,
    status: 'Settled',
  }
];

export default function BillingEngine({ session }: BillingEngineProps) {
  const [history, setHistory] = useState<HistoricalSession[]>(HISTORICAL_SESSIONS);
  const [liveDuration, setLiveDuration] = useState(0);

  // Billing Profile States
  const [billingProfile, setBillingProfile] = useState<'B2C' | 'B2B'>('B2C');
  const [hospitalName, setHospitalName] = useState('Nile University Hospital Group');
  const [hospitalCode, setHospitalCode] = useState('NUH-CAIRO-441-ACC');

  // Manual Test Simulator States
  const [simDurationSec, setSimDurationSec] = useState(240);
  const [simRate, setSimRate] = useState(2.80);

  // Server Webhook Log States
  const [webhookLogs, setWebhookLogs] = useState<any>(null);
  const [invoiceLogs, setInvoiceLogs] = useState<any>(null);
  const [isProcessingBackend, setIsProcessingBackend] = useState(false);

  const ratePerMinute = session.interpreter?.ratePerMinute || 2.80;
  const platformMargin = 3.50; // Flat platform transaction margin

  // Calculate live cost
  const liveCost = (liveDuration / 60) * ratePerMinute + platformMargin;

  // Track live session duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (session.status === 'connected') {
      interval = setInterval(() => {
        setLiveDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (session.status === 'idle') {
        setLiveDuration(0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.status]);

  // Hook listening to session completions to run the actual backend billing calculations
  useEffect(() => {
    if (session.status === 'completed' && session.interpreter) {
      const runBackendBilling = async () => {
        setIsProcessingBackend(true);
        try {
          // POST to Agora Event-Driven Webhook Simulator on the Express backend
          const webhookRes = await fetch('/api/billing/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'channel_destroy',
              channel: `VRI_AMBER_NIL_${session.channelName}`,
              durationSeconds: liveDuration || 145,
              ratePerMinute: ratePerMinute
            })
          });
          const webhookData = await webhookRes.json();
          setWebhookLogs(webhookData);

          // POST to B2B / B2C invoicing profile router on the Express backend
          const invoiceRes = await fetch('/api/billing/invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileType: billingProfile === 'B2B' ? 'B2B_HOSPITAL' : 'B2C_RETAIL',
              hospitalAccountCode: hospitalCode,
              clientName: billingProfile === 'B2B' ? hospitalName : 'International Patient Delta',
              totalAmount: webhookData?.calculation?.computedTotalInvoice || 11.90
            })
          });
          const invoiceData = await invoiceRes.json();
          setInvoiceLogs(invoiceData);

          // Push to settled local list
          const newHistory: HistoricalSession = {
            id: `bil-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            languages: session.interpreter.languages.join(' ⇄ '),
            durationMinutes: Number(((liveDuration || 145) / 60).toFixed(1)),
            ratePerMinute: ratePerMinute,
            platformMargin: platformMargin,
            totalCost: webhookData?.calculation?.computedTotalInvoice || 11.90,
            status: billingProfile === 'B2B' ? 'Invoiced B2B' : 'Settled'
          };
          setHistory(prev => [newHistory, ...prev]);

        } catch (err) {
          console.error('Failed to trigger backend billing endpoint:', err);
        } finally {
          setIsProcessingBackend(false);
        }
      };
      runBackendBilling();
    }
  }, [session.status]);

  // Trigger manual backend webhook testing on-demand
  const triggerManualWebhookTest = async () => {
    setIsProcessingBackend(true);
    try {
      const webhookRes = await fetch('/api/billing/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'channel_destroy',
          channel: `VRI_AMBER_NIL_MANUAL_${Math.floor(100000 + Math.random() * 900000)}`,
          durationSeconds: simDurationSec,
          ratePerMinute: simRate
        })
      });
      const webhookData = await webhookRes.json();
      setWebhookLogs(webhookData);

      const invoiceRes = await fetch('/api/billing/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileType: billingProfile === 'B2B' ? 'B2B_HOSPITAL' : 'B2C_RETAIL',
          hospitalAccountCode: hospitalCode,
          clientName: billingProfile === 'B2B' ? hospitalName : 'Accredited Retail Tourist',
          totalAmount: webhookData?.calculation?.computedTotalInvoice || 11.90
        })
      });
      const invoiceData = await invoiceRes.json();
      setInvoiceLogs(invoiceData);

      // Push to history
      const newHistory: HistoricalSession = {
        id: `bil-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        languages: 'English ⇄ Arabic (Demo)',
        durationMinutes: Number((simDurationSec / 60).toFixed(1)),
        ratePerMinute: simRate,
        platformMargin: platformMargin,
        totalCost: webhookData?.calculation?.computedTotalInvoice || 11.90,
        status: billingProfile === 'B2B' ? 'Invoiced B2B' : 'Settled'
      };
      setHistory(prev => [newHistory, ...prev]);

    } catch (err) {
      console.error('Failed to post manual webhook test:', err);
    } finally {
      setIsProcessingBackend(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div id="billing-engine" className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: ACTIVE METER & CONFIGURATOR */}
      <div className="xl:col-span-6 space-y-6">
        
        {/* Dynamic Billing Card */}
        <div className="bg-slate-900/40 border border-amber-500/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-amber-100 font-sans">
                Dynamic Billing Engine
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
              Formula: (Minutes * Rate) + Margin
            </span>
          </div>

          {/* Billing Profile Toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider block">
              Active Billing / Invoicing Profile
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-850">
              <button
                id="profile-b2c"
                onClick={() => setBillingProfile('B2C')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  billingProfile === 'B2C'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                💳 B2C Retail Tourist (Pre-auth Card)
              </button>
              <button
                id="profile-b2b"
                onClick={() => setBillingProfile('B2B')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  billingProfile === 'B2B'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                🏢 B2B Hospital Account (Invoicing)
              </button>
            </div>
          </div>

          {/* Conditional Input details */}
          {billingProfile === 'B2B' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-850">
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Hospital Account Group</label>
                <input
                  id="b2b-hospital-name"
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">FACILITY ACCOUNT CODE</label>
                <input
                  id="b2b-hospital-code"
                  type="text"
                  value={hospitalCode}
                  onChange={(e) => setHospitalCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> SECURE PRE-AUTHORIZATION HOLD
              </span>
              <span className="font-bold text-slate-100">${session.status !== 'idle' ? session.preAuthAmount.toFixed(2) : '150.00'} Hold</span>
            </div>
          )}

          {/* Real-time Counter Grid */}
          {session.status === 'connected' ? (
            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
              <div className="text-center">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  Active Call Metering (Agora WebRTC Live)
                </span>
                <span id="live-call-duration" className="text-4xl font-bold text-white font-mono tracking-wider block mt-1.5">
                  {formatTime(liveDuration)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  At rate of ${ratePerMinute.toFixed(2)}/minute
                </span>
              </div>

              <div className="border-t border-slate-850 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500/60" /> Interpretation Base</span>
                  <span className="font-mono text-amber-200">${((liveDuration / 60) * ratePerMinute).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-amber-500/60" /> Service Platform Margin</span>
                  <span className="font-mono text-amber-200">${platformMargin.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm">
                  <span className="font-semibold text-white">Estimated Grand Total</span>
                  <span id="live-grand-total" className="text-lg font-bold text-amber-400 font-mono">
                    ${liveCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : session.status === 'calling' ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-3">
                <DollarSign className="w-5 h-5 animate-spin" />
              </div>
              <h4 className="text-xs font-bold text-amber-100 uppercase tracking-wider">Pre-Authorization Lock</h4>
              <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto">
                Holding <strong>${session.preAuthAmount.toFixed(2)}</strong> on your payment profile to guarantee translator availability. Final billing will be computed by server webhooks.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-850">
              <p className="text-xs text-slate-400">
                Initiate a 3-Way video remote consultation to engage the live billing meter.
              </p>
            </div>
          )}
        </div>

        {/* DEVELOPER PLAYGROUND: MANUAL AGORA WEBHOOK CALL */}
        <div className="bg-slate-900/40 border border-amber-500/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <Settings className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-mono font-bold text-amber-100 uppercase tracking-wider">
              Agora Webhook Simulator Console
            </h4>
          </div>
          
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Directly test the Express backend event webhook listeners (<code className="text-amber-500 font-mono">channel_destroy</code> and <code className="text-amber-500 font-mono">user_left</code>) without starting a WebRTC stream.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Simulate Duration</label>
              <select
                id="sim-duration-select"
                value={simDurationSec}
                onChange={(e) => setSimDurationSec(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value={60}>60 Seconds (1 Minute)</option>
                <option value={180}>180 Seconds (3 Minutes)</option>
                <option value={300}>300 Seconds (5 Minutes)</option>
                <option value={900}>900 Seconds (15 Minutes)</option>
                <option value={1800}>1800 Seconds (30 Minutes)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Language Pair Rate ($/Min)</label>
              <select
                id="sim-rate-select"
                value={simRate}
                onChange={(e) => setSimRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value={2.50}>$2.50 / Min (Spanish-English)</option>
                <option value={2.80}>$2.80 / Min (English-Arabic)</option>
                <option value={3.20}>$3.20 / Min (German-Arabic)</option>
                <option value={3.50}>$3.50 / Min (Russian-Arabic)</option>
              </select>
            </div>
          </div>

          <button
            id="btn-trigger-webhook-test"
            onClick={triggerManualWebhookTest}
            disabled={isProcessingBackend}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {isProcessingBackend ? 'Querying Backend...' : 'Post Simulated Agora Event Webhook'}
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: RECENT LEDGER & BACKEND LIVE RAW TRACES */}
      <div className="xl:col-span-6 space-y-6">
        
        {/* Live Raw JSON Response logs */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-amber-500" />
                Live Node.js Billing Webhook Logs
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            {webhookLogs ? (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-200 font-medium">Channel Webhook Received</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                    {webhookLogs?.eventReceived || 'SUCCESS'}
                  </span>
                </div>

                {/* Raw Code View */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Computed Invoice Trace:</span>
                  <pre className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[160px] scrollbar-thin">
                    {JSON.stringify(webhookLogs, null, 2)}
                  </pre>
                </div>

                {invoiceLogs && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Payment Settlement Trace:</span>
                    <pre className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[160px] scrollbar-thin">
                      {JSON.stringify(invoiceLogs, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2.5 h-[240px]">
                <Sparkles className="w-7 h-7 text-amber-500/30" />
                <p className="text-xs">No active backend trace logs captured yet.</p>
                <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
                  Click 'Post Simulated Agora Event Webhook' on the left or finish a live video call to observe immediate server auditing.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-850 pt-4 mt-4 text-[9px] font-mono text-slate-500 leading-relaxed flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              All duration math operates on backend timers, enforcing cryptographic integrity. TAMPER_MITIGATION enabled.
            </span>
          </div>
        </div>

        {/* Settled Transactions */}
        <div className="bg-slate-900/40 border border-amber-500/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-semibold text-amber-100 font-sans">
              Settled Platform Ledger
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                id={`invoice-item-${item.id}`}
                key={item.id}
                className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between hover:border-amber-500/20 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-100 block">{item.languages}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5 block">
                      {item.date} • {item.durationMinutes}m @ ${item.ratePerMinute}/min
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white block">${item.totalCost.toFixed(2)}</span>
                  <span className="text-[8px] font-mono text-emerald-400 mt-1 inline-block bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
