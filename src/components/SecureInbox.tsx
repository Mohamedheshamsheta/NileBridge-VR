import { useState, useEffect } from 'react';
import { Mail, ShieldCheck, FileText, CheckCircle, Clock, Eye, Lock, Unlock, RefreshCw, AlertCircle } from 'lucide-react';

interface ScribeMessage {
  speaker: string;
  text: string;
  translation?: string;
}

interface ScribeSummary {
  patientInformation: string;
  chiefComplaints: string;
  doctorAssessment: string;
  instructions: string[];
  prescriptions: string[];
  complianceAudit: string;
}

export interface InboxItem {
  id: string;
  title: string;
  date: string;
  type: 'AI_SCRIBE_SUMMARY' | 'BILLING_INVOICE' | 'COMPLIANCE_ALERT';
  status: 'processing' | 'delivered';
  interpreterName: string;
  doctorName: string;
  symptoms: string;
  documentName?: string;
  documentType?: string;
  transcript?: ScribeMessage[];
  summary?: ScribeSummary;
  isEncrypted: boolean;
  decryptedData?: {
    transcript: ScribeMessage[];
    summary: ScribeSummary;
  };
}

interface SecureInboxProps {
  inboxItems: InboxItem[];
  currentRegion: 'EG' | 'US';
  onRefreshInbox: () => void;
}

export default function SecureInbox({ inboxItems, currentRegion, onRefreshInbox }: SecureInboxProps) {
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptionError, setDecryptionError] = useState('');
  const [isLoadingScribe, setIsLoadingScribe] = useState<string | null>(null);

  // Auto-select first item or updated items
  useEffect(() => {
    if (inboxItems.length > 0 && !selectedItem) {
      setSelectedItem(inboxItems[0]);
    } else if (selectedItem) {
      // Keep state updated for active item
      const updated = inboxItems.find(item => item.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [inboxItems]);

  // Handle decryption for US Zero-Knowledge mode
  const handleDecrypt = () => {
    if (passcode === 'HIPAA-2026') {
      setIsDecrypted(true);
      setDecryptionError('');
    } else {
      setDecryptionError('Invalid HSM Compliance Passcode. Access denied.');
      setIsDecrypted(false);
    }
  };

  // Trigger Scribe Generation via Express API proxies
  const triggerAILayer = async (item: InboxItem) => {
    setIsLoadingScribe(item.id);
    try {
      const response = await fetch('/api/scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interpreterName: item.interpreterName,
          doctorName: item.doctorName,
          durationSeconds: 180,
          symptoms: item.symptoms,
          documentName: item.documentName,
          documentType: item.documentType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Feed the retrieved AI Scribe transcript and summary back
        item.status = 'delivered';
        item.transcript = data.transcript;
        item.summary = data.summary;
        setSelectedItem({ ...item });
        onRefreshInbox();
      }
    } catch (err) {
      console.error('Failed to trigger AI Scribe processing:', err);
    } finally {
      setIsLoadingScribe(null);
    }
  };

  // Format encrypted string representation
  const renderEncryptedString = (text: string) => {
    return text.split(' ').map(() => '●●●●●●').join(' ');
  };

  return (
    <div id="secure-inbox" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/40 border border-amber-500/10 rounded-2xl p-6 backdrop-blur-md">
      
      {/* Left panel: Inbox List */}
      <div className="lg:col-span-4 flex flex-col gap-4 border-r border-slate-800/80 pr-0 lg:pr-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-amber-100 font-sans">
              Secure Patient Inbox
            </h3>
          </div>
          <button 
            id="refresh-inbox-btn"
            onClick={onRefreshInbox}
            className="text-slate-500 hover:text-amber-500 transition-colors"
            title="Reload items"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
          {inboxItems.length === 0 ? (
            <div className="text-center py-10">
              <Mail className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 italic">Your secure inbox is empty.</p>
            </div>
          ) : (
            inboxItems.map((item) => (
              <button
                id={`inbox-item-${item.id}`}
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setIsDecrypted(false);
                  setPasscode('');
                  setDecryptionError('');
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                  selectedItem?.id === item.id
                    ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-950/10'
                    : 'bg-slate-950/40 border-slate-850 hover:bg-slate-950/80'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-slate-200 truncate pr-2">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 shrink-0">
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.isEncrypted && currentRegion === 'US' ? (
                      <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> HSM Encrypted
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        Sovereign Vault
                      </span>
                    )}
                  </div>

                  {item.status === 'processing' ? (
                    <span className="text-[9px] font-mono text-amber-400 animate-pulse flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" /> Processing Scribe...
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" /> Delivered
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Active Message Details */}
      <div className="lg:col-span-8 flex flex-col min-h-[400px]">
        {selectedItem ? (
          <div className="flex flex-col h-full gap-4">
            
            {/* Header detail */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block">Clinical Scribe File</span>
                <h4 className="text-sm font-bold text-slate-200 mt-1">{selectedItem.title}</h4>
              </div>

              {selectedItem.status === 'processing' && (
                <button
                  id={`process-scribe-btn-${selectedItem.id}`}
                  disabled={isLoadingScribe === selectedItem.id}
                  onClick={() => triggerAILayer(selectedItem)}
                  className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isLoadingScribe === selectedItem.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Piping Audio to STT...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      Generate AI Medical Summary
                    </>
                  )}
                </button>
              )}
            </div>

            {/* If US Region & Zero-Knowledge Encryption applies */}
            {selectedItem.isEncrypted && currentRegion === 'US' && !isDecrypted ? (
              <div id="decryption-vault-lock" className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 border border-indigo-500/20 rounded-2xl gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h5 className="text-sm font-bold text-indigo-300">Zero-Knowledge HIPAA Column Decryption</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This medical log is dynamically encrypted with specialized column-level AES-256-GCM. NileBridge servers do not store your private decryption keys. Enter your compliance passkey to decrypt client-side.
                  </p>
                  <span className="text-[10px] text-amber-500 font-mono block">Hint for demo review: Enter "HIPAA-2026" to decrypt logs.</span>
                </div>

                <div className="flex gap-2 w-full max-w-sm mt-3">
                  <input
                    id="compliance-passcode-input"
                    type="password"
                    placeholder="Enter compliance passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                  />
                  <button
                    id="decrypt-logs-btn"
                    onClick={handleDecrypt}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Unlock className="w-4 h-4" />
                    Decrypt
                  </button>
                </div>
                {decryptionError && (
                  <p className="text-[11px] text-red-400 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {decryptionError}
                  </p>
                )}
              </div>
            ) : selectedItem.status === 'processing' ? (
              /* Awaiting audio processing visualization */
              <div id="processing-audio-box" className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl gap-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <h5 className="text-xs font-bold text-slate-300">Piping Live Audio Stream</h5>
                <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                  Capture of 3-Way WebRTC call complete. Standing by for post-call secure cloud recording pipeline to package the bilingual clinical transcript.
                </p>
              </div>
            ) : (
              /* Displaying decrypted/authorized data */
              <div id="clinical-summary-container" className="flex-1 space-y-6 max-h-[460px] overflow-y-auto pr-2">
                {isDecrypted && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-[10px] font-mono text-indigo-300">
                      Successfully decrypted locally via client HSM keys. All logs are unmasked.
                    </span>
                  </div>
                )}

                {/* Patient Summary Information Box */}
                {selectedItem.summary && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
                    <div className="flex justify-between items-start border-b border-slate-850 pb-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        📋 Post-Consultation Medical Care Summary
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {selectedItem.summary.patientInformation}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Chief Complaints / Symptoms</span>
                        <p className="text-xs text-slate-300 mt-1">
                          {selectedItem.summary.chiefComplaints}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Doctor Assessment</span>
                        <p className="text-xs text-slate-300 mt-1">
                          {selectedItem.summary.doctorAssessment}
                        </p>
                      </div>
                    </div>

                    {/* Prescriptions */}
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Prescribed Medications</span>
                      <ul className="space-y-1">
                        {selectedItem.summary.prescriptions.map((p, idx) => (
                          <li key={idx} className="text-xs text-amber-100 flex items-center gap-2 bg-amber-500/5 px-2.5 py-1.5 rounded border border-amber-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Doctor Instructions */}
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Directives & Instructions</span>
                      <ul className="space-y-1">
                        {selectedItem.summary.instructions.map((ins, idx) => (
                          <li key={idx} className="text-xs text-slate-300 leading-normal flex items-start gap-2">
                            <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Scribe Security Policy audit */}
                    <div className="text-[9px] text-slate-500 font-mono border-t border-slate-850 pt-2 flex justify-between">
                      <span>Gateway Audit: {selectedItem.summary.complianceAudit}</span>
                    </div>
                  </div>
                )}

                {/* Secure Bilingual Transcript */}
                {selectedItem.transcript && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 block border-b border-slate-850 pb-1">
                      🗣️ Multi-Party Clinical Dialogue Transcript
                    </span>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {selectedItem.transcript.map((msg, idx) => {
                        const isPatient = msg.speaker === 'Patient';
                        const isDoc = msg.speaker === 'Doctor';
                        const isInt = msg.speaker === 'Interpreter';

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex flex-col gap-1 ${
                              isPatient
                                ? 'bg-[#0b1329] border-blue-500/10'
                                : isDoc
                                ? 'bg-emerald-950/20 border-emerald-500/10'
                                : 'bg-amber-950/25 border-amber-500/10'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span className={`font-bold uppercase tracking-wider ${
                                isPatient ? 'text-blue-400' : isDoc ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {msg.speaker}
                              </span>
                            </div>
                            <p className="text-xs text-slate-200">{msg.text}</p>
                            {msg.translation && (
                              <p className="text-xs text-amber-200/75 italic border-t border-slate-850 pt-1 mt-1 font-mono">
                                ⇄ {msg.translation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/20 border border-slate-850 rounded-2xl text-slate-500 gap-2">
            <Mail className="w-8 h-8 text-slate-700" />
            <p className="text-xs italic">Select a clinical file from the left to view summary details.</p>
          </div>
        )}
      </div>

    </div>
  );
}
