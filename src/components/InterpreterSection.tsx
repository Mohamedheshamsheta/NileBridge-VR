import { useState } from 'react';
import { Interpreter } from '../types';
import { Activity, Landmark, ShieldCheck, RefreshCw, Compass, ArrowRight } from 'lucide-react';

interface InterpreterSectionProps {
  onSelectInterpreter: (interpreter: Interpreter, serviceType: 'medical' | 'tourism') => void;
  activeSessionStatus: string;
}

// Certified professional VRI interpreters
const ON_CALL_POOL: Interpreter[] = [
  {
    id: 'int-1',
    name: 'Yasmine Mansour',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    languages: ['English', 'Arabic'],
    rating: 4.9,
    specializations: ['Surgery', 'General ER'],
    isOnline: true,
    ratePerMinute: 2.80,
    experienceYears: 8,
    bio: 'Accredited medical and travel interpreter with 8+ years of expertise. Highly fluent in Cairo dialect and Levantine Arabic translation.',
  },
  {
    id: 'int-2',
    name: 'Michael Vance',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    languages: ['English', 'German', 'Arabic'],
    rating: 4.8,
    specializations: ['Internal Medicine', 'Pharmacology'],
    isOnline: true,
    ratePerMinute: 3.20,
    experienceYears: 12,
    bio: 'Bilingual expert specializing in high-accuracy technical handovers and ancient site historical guidance for German-speaking delegations.',
  },
  {
    id: 'int-3',
    name: 'Lucia Sanchez',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=200',
    languages: ['Spanish', 'English'],
    rating: 4.95,
    specializations: ['General ER', 'Pediatrics'],
    isOnline: true,
    ratePerMinute: 2.50,
    experienceYears: 7,
    bio: 'Experienced translator certified for emergency trauma translation and cultural travel assistance across Egypt.',
  },
  {
    id: 'int-4',
    name: 'Karim El-Gawly',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    languages: ['English', 'Arabic'],
    rating: 4.75,
    specializations: ['Pharmacology', 'Cardiology'],
    isOnline: true,
    ratePerMinute: 2.90,
    experienceYears: 6,
    bio: 'Specialized interpreter with a deep background in Alexandria archaeological history and professional medical guidelines translation.',
  },
  {
    id: 'int-5',
    name: 'Prof. Dmitry Sokolov',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    languages: ['Russian', 'Arabic'],
    rating: 5.0,
    specializations: ['Surgery', 'Cardiology'],
    isOnline: true,
    ratePerMinute: 3.50,
    experienceYears: 15,
    bio: 'Senior Arabic-Russian professional translation expert with 15+ years experience translating elite delegations and medical conferences.',
  }
];

export default function InterpreterSection({ onSelectInterpreter, activeSessionStatus }: InterpreterSectionProps) {
  const [selectedLanguagePair, setSelectedLanguagePair] = useState<string>('English-Arabic');
  const [isPreauthorizing, setIsPreauthorizing] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<'medical' | 'tourism' | null>(null);

  const handleInstantDispatch = (serviceType: 'medical' | 'tourism') => {
    setIsPreauthorizing(true);
    setSelectedService(serviceType);

    // Simulate real-time backend credit card authorization hold and SignalR handshake instantly
    setTimeout(() => {
      // Find matching interpreter in pool
      const [lang1, lang2] = selectedLanguagePair.split('-');
      const matchedInterpreter = ON_CALL_POOL.find(item => 
        item.languages.includes(lang1) && item.languages.includes(lang2)
      ) || ON_CALL_POOL[0]; // fallback

      onSelectInterpreter(matchedInterpreter, serviceType);
      setIsPreauthorizing(false);
      setSelectedService(null);
    }, 1200);
  };

  return (
    <div id="booking-landing-core" className="max-w-2xl mx-auto bg-[#FAF9F6] border border-slate-200 rounded-3xl p-8 md:p-12 shadow-md space-y-8 text-center animate-fade-in">
      
      {/* Decorative Branding Indicator */}
      <div className="flex justify-center">
        <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase bg-baby-blue/25 px-4 py-2 rounded-full border border-baby-blue/50 font-black">
          Sovereign VRI Dispatch
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-display font-extrabold text-[#121212] tracking-tight">
          2-Click Instant Translation
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Choose your languages and dispatch a certified professional interpreter instantly. Zero wizards. HIPAA & sovereignty secure.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dropdown Selector */}
        <div className="text-left space-y-2">
          <label htmlFor="language-pair-select" className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider block">
            Select Language Pair
          </label>
          <div className="relative">
            <select
              id="language-pair-select"
              value={selectedLanguagePair}
              onChange={(e) => setSelectedLanguagePair(e.target.value)}
              className="w-full bg-[#FAF9F6] border-2 border-[#121212] rounded-2xl px-5 py-4 text-sm font-bold text-[#121212] focus:outline-none focus:ring-2 focus:ring-baby-blue cursor-pointer appearance-none transition-all"
            >
              <option value="English-Arabic">English ⇄ Arabic</option>
              <option value="Russian-Arabic">Russian ⇄ Arabic</option>
              <option value="Spanish-English">Spanish ⇄ English</option>
              <option value="German-Arabic">German ⇄ Arabic</option>
              <option value="French-Arabic">French ⇄ Arabic</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-[#121212]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Two Primary Obsidian Black Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            id="btn-medical-now"
            type="button"
            disabled={isPreauthorizing || activeSessionStatus !== 'idle'}
            onClick={() => handleInstantDispatch('medical')}
            className="w-full bg-[#121212] hover:bg-black disabled:bg-slate-300 text-white hover:text-baby-blue font-black py-5 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border-2 border-transparent"
          >
            {isPreauthorizing && selectedService === 'medical' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-baby-blue" />
                Pre-Authorizing Hold...
              </>
            ) : (
              <>
                <Activity className="w-4.5 h-4.5 text-baby-blue" />
                Medical Now
              </>
            )}
          </button>

          <button
            id="btn-tourism-now"
            type="button"
            disabled={isPreauthorizing || activeSessionStatus !== 'idle'}
            onClick={() => handleInstantDispatch('tourism')}
            className="w-full bg-[#121212] hover:bg-black disabled:bg-slate-300 text-white hover:text-baby-blue font-black py-5 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border-2 border-transparent"
          >
            {isPreauthorizing && selectedService === 'tourism' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-baby-blue" />
                Pre-Authorizing Hold...
              </>
            ) : (
              <>
                <Landmark className="w-4.5 h-4.5 text-baby-blue" />
                Tourism Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trust & Architecture Safeguards Bar */}
      <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4.5 h-4.5 text-[#10B981]" />
          <span>Sovereign Storage Enforced</span>
        </div>
        <div className="hidden sm:block text-slate-300">|</div>
        <div>AES-256 Hold Enforced</div>
        <div className="hidden sm:block text-slate-300">|</div>
        <div className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-baby-blue" />
          <span>SignalR Sockets Ready</span>
        </div>
      </div>

    </div>
  );
}
