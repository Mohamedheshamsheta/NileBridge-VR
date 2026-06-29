import { RegionConfig, RegionCode } from '../types';
import { Globe, Shield, Lock, HardDrive, Key, CheckCircle, RefreshCw } from 'lucide-react';

const REGION_CONFIGS: Record<RegionCode, RegionConfig> = {
  EG: {
    code: 'EG',
    countryName: 'Egypt (Primary)',
    timezone: 'Africa/Cairo (UTC+02:00)',
    complianceName: 'Egyptian Digital Sovereignty Act',
    hipaaEnforced: false,
    encryptionStandard: 'AES-256-CBC / TLS 1.3',
    storagePolicy: 'Nile Delta East Datacenter (Local Grouping)'
  },
  US: {
    code: 'US',
    countryName: 'United States (Expansion)',
    timezone: 'America/New_York (UTC-05:00)',
    complianceName: 'HIPAA Title II / HITECH Compliant Vault',
    hipaaEnforced: true,
    encryptionStandard: 'Strict End-to-End AES-256-GCM (HSM Key Rotation)',
    storagePolicy: 'AWS US-East Virginia HIPAA-Audited Container'
  }
};

interface ComplianceConfigProps {
  currentRegion: RegionCode;
  onRegionChange: (region: RegionCode) => void;
}

export default function ComplianceConfig({ currentRegion, onRegionChange }: ComplianceConfigProps) {
  const config = REGION_CONFIGS[currentRegion];

  return (
    <div id="compliance-config" className="bg-slate-900/40 border border-amber-500/10 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5 mb-5">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-500 animate-pulse" />
          <div>
            <h3 className="text-lg font-semibold text-amber-100 font-sans">
              Multi-Region Compliance Vault
            </h3>
            <p className="text-xs text-slate-400">
              Database residency is partitioned strictly by ISO Country Code context
            </p>
          </div>
        </div>

        {/* Region Code Toggles */}
        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            id="region-eg"
            onClick={() => onRegionChange('EG')}
            className={`px-4 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              currentRegion === 'EG'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            🇪🇬 EG (Egypt)
          </button>
          <button
            id="region-us"
            onClick={() => onRegionChange('US')}
            className={`px-4 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              currentRegion === 'US'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            🇺🇸 US (United States)
          </button>
        </div>
      </div>

      {/* Visualizer showing the active database configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Compliance details */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">ISO Country Context</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block flex items-center gap-1.5">
              {currentRegion === 'EG' ? '🇪🇬' : '🇺🇸'} {config.countryName}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">Absolute Time Zone</span>
            <span className="text-xs text-slate-300 mt-1 block font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 w-fit">
              {config.timezone}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">Data Sovereignty Law</span>
            <span className="text-xs text-slate-300 mt-1 block">
              {config.complianceName}
            </span>
          </div>
        </div>

        {/* Real-time Crypto lock display */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Data Path Security Mode
            </span>
            {config.hipaaEnforced ? (
              <span id="hipaa-badge" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                HIPAA Locked
              </span>
            ) : (
              <span id="standard-badge" className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                Standard Sovereignty
              </span>
            )}
          </div>

          <div className="my-3 flex items-center gap-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              config.hipaaEnforced ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
            }`}>
              <Lock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Encryption Standard</span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{config.encryptionStandard}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Residency Group: {config.storagePolicy}</span>
          </div>
        </div>

      </div>

      {/* Dynamic Column-Level Encryption & ZKP Simulator */}
      <div className="mt-5 border-t border-slate-800/60 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Dynamic Database Column-Level Encryption (ZKP Sovereignty Ready)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Field: Patient_Name</span>
            <div className="mt-1 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">"Mariam G. Ghali"</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${currentRegion === 'US' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                {currentRegion === 'US' ? '🔒 0x8F4A...B9CD' : '🔓 Plaintext'}
              </span>
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Field: Medical_Symptom</span>
            <div className="mt-1 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">"Severe Epigastric Burning"</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${currentRegion === 'US' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                {currentRegion === 'US' ? '🔒 0x9D2C...7A1E' : '🔓 Plaintext'}
              </span>
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Field: Audio_Scribe_Transcript</span>
            <div className="mt-1 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">"Prescribed Amoxicillin..."</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${currentRegion === 'US' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                {currentRegion === 'US' ? '🔒 0xE3B8...42F0' : '🔓 Plaintext'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {config.hipaaEnforced && (
        <div id="hipaa-guideline-banner" className="mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2.5">
          <Shield className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-200/70 leading-relaxed">
            <strong>US Compliance Protocol Active:</strong> BAA (Business Associate Agreements) are enforced across cloud storage layers. All client-interpreter session metadata, including chat transcript segments or uploaded records, are processed under HIPAA Title II physical safeguards. Dynamic database column-level encryption is automatically applied.
          </p>
        </div>
      )}
    </div>
  );
}
