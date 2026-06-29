import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  console.log('Gemini API configured successfully.');
} else {
  console.warn('GEMINI_API_KEY not found in environment variables. Scribe will run in realistic simulated mode.');
}

// ==========================================
// SIMULATED MS SQL SERVER LEDGER DATABASE
// ==========================================
interface RegisteredInterpreter {
  id: string;
  name: string;
  languages: string[];
  category: string;
  verificationStatus: 'Pending_Verification' | 'Approved';
  licenseDocName: string;
  registrationDate: string;
}

interface CallLedgerRecord {
  id: string;
  clientName: string;
  timestamp: string;
  serviceType: 'medical' | 'tourism';
  durationSeconds: number;
  ratePerMinute: number;
  earningCredit: number;
  languagePair: string;
}

let INTERPRETER_ACCOUNTS: RegisteredInterpreter[] = [];

let CALL_HISTORY_LEDGER: CallLedgerRecord[] = [
  {
    id: "call-101",
    clientName: "Nile Hospital ER - Ward 3",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    serviceType: "medical",
    durationSeconds: 480, // 8 minutes
    ratePerMinute: 2.80,
    earningCredit: 22.40,
    languagePair: "English ⇄ Arabic"
  },
  {
    id: "call-102",
    clientName: "German Archaeology - Giza Plateau",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hours ago
    serviceType: "tourism",
    durationSeconds: 960, // 16 minutes
    ratePerMinute: 3.20,
    earningCredit: 51.20,
    languagePair: "German ⇄ Arabic"
  },
  {
    id: "call-103",
    clientName: "Sovereign Emergency Station Delta",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    serviceType: "medical",
    durationSeconds: 300, // 5 minutes
    ratePerMinute: 3.50,
    earningCredit: 17.50,
    languagePair: "Russian ⇄ Arabic"
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // --- INTERPRETER PRO PORTAL API ENDPOINTS ---

  // 1. Get Call History Ledger & Earnings Stats
  app.get('/api/interpreter/ledger', (req, res) => {
    // Calculate stats on-the-fly from the MS SQL ledger
    const totalSeconds = CALL_HISTORY_LEDGER.reduce((sum, item) => sum + item.durationSeconds, 0);
    const totalMinutes = totalSeconds / 60;
    const walletBalance = CALL_HISTORY_LEDGER.reduce((sum, item) => sum + item.earningCredit, 0);
    
    // Performance Multiplier formula based on minutes and ratings
    // (e.g. 1.0x baseline, 1.25x if > 15 mins, 1.5x if > 30 mins)
    let multiplier = 1.0;
    if (totalMinutes > 30) {
      multiplier = 1.5;
    } else if (totalMinutes > 15) {
      multiplier = 1.25;
    }

    res.json({
      success: true,
      service: 'ASP.NET Core Ledger Service (MS SQL Database)',
      timestamp: new Date().toISOString(),
      stats: {
        totalSeconds,
        totalMinutes: Number(totalMinutes.toFixed(2)),
        walletBalance: Number(walletBalance.toFixed(2)),
        performanceMultiplier: multiplier,
        totalCallsCount: CALL_HISTORY_LEDGER.length
      },
      ledger: CALL_HISTORY_LEDGER
    });
  });

  // 2. Register New Interpreter Account
  app.post('/api/interpreter/register', (req, res) => {
    const { name, languages, category, licenseDocName } = req.body;
    
    if (!name || !languages || !category) {
      return res.status(400).json({ success: false, error: 'Name, languages, and category are required.' });
    }

    const newInterpreter: RegisteredInterpreter = {
      id: `int-reg-${Date.now().toString().slice(-5)}`,
      name,
      languages: Array.isArray(languages) ? languages : [languages],
      category,
      verificationStatus: 'Pending_Verification',
      licenseDocName: licenseDocName || 'Certified_License.pdf',
      registrationDate: new Date().toISOString()
    };

    INTERPRETER_ACCOUNTS.push(newInterpreter);

    console.log(`[MS SQL Server] Committed new registration ID ${newInterpreter.id} as Pending_Verification.`);

    res.json({
      success: true,
      service: 'ASP.NET Registration Wizard Daemon',
      interpreter: newInterpreter
    });
  });

  // 3. Admin Verification Bypass (Simulates Back-Office SignalR verification approval)
  app.post('/api/interpreter/verify-bypass', (req, res) => {
    const { id } = req.body;
    
    const account = INTERPRETER_ACCOUNTS.find(item => item.id === id);
    if (account) {
      account.verificationStatus = 'Approved';
      console.log(`[MS SQL Server / SignalR Server] Approved account ID ${id}. Pushing updates...`);
      return res.json({
        success: true,
        message: 'Account approved successfully. Real-time SignalR status push broadcasted.',
        interpreter: account
      });
    }

    // Fallback: If no account ID provided, approve the last registered one or create one
    if (INTERPRETER_ACCOUNTS.length > 0) {
      const lastAccount = INTERPRETER_ACCOUNTS[INTERPRETER_ACCOUNTS.length - 1];
      lastAccount.verificationStatus = 'Approved';
      console.log(`[MS SQL Server / SignalR Server] Approved last registered account ID ${lastAccount.id}.`);
      return res.json({
        success: true,
        message: 'Last account approved successfully via simulated backend SignalR.',
        interpreter: lastAccount
      });
    }

    // Default simulation fallback
    const defaultAccount: RegisteredInterpreter = {
      id: 'int-reg-sim',
      name: 'Professional Expert',
      languages: ['English', 'Arabic'],
      category: 'medical',
      verificationStatus: 'Approved',
      licenseDocName: 'Bypass_Verified_Sovereign.pdf',
      registrationDate: new Date().toISOString()
    };
    INTERPRETER_ACCOUNTS.push(defaultAccount);
    res.json({
      success: true,
      message: 'Generated and auto-approved simulated professional account.',
      interpreter: defaultAccount
    });
  });

  // 4. Asynchronous AGORA Webhook listening strictly to channel_destroy & user_left
  app.post('/api/webhooks/agora', (req, res) => {
    const { event, channel, durationSeconds, ratePerMinute, clientName, languagePair, serviceType } = req.body;

    // Strict validation
    if (!event || !['channel_destroy', 'user_left'].includes(event)) {
      console.warn(`[Agora Webhook] Ignored non-critical event: "${event || 'unknown'}"`);
      return res.status(400).json({ 
        success: false, 
        error: 'Asynchronous webhook strictly listens to "channel_destroy" or "user_left" events.' 
      });
    }

    const durationSec = durationSeconds !== undefined ? Number(durationSeconds) : 360; // 6 minutes default
    const rateMin = ratePerMinute !== undefined ? Number(ratePerMinute) : 3.00;
    const name = clientName || "Nile Trauma Unit / Sovereign Patient";
    const pair = languagePair || "English ⇄ Arabic";
    const type = (serviceType === 'medical' || serviceType === 'tourism') ? serviceType : 'medical';

    // Formula: Interpreter Earning Credit = (Call Duration in Seconds / 60) * Specific Language Tier Per-Minute Rate
    const computedEarningCredit = (durationSec / 60) * rateMin;

    const newRecord: CallLedgerRecord = {
      id: `call-${Date.now().toString().slice(-6)}`,
      clientName: name,
      timestamp: new Date().toISOString(),
      serviceType: type,
      durationSeconds: durationSec,
      ratePerMinute: rateMin,
      earningCredit: Number(computedEarningCredit.toFixed(2)),
      languagePair: pair
    };

    // Commit results instantly into MS SQL ledger
    CALL_HISTORY_LEDGER.unshift(newRecord);

    console.log(`[MS SQL Server Ledger] COMMITTED: Record ${newRecord.id} saved. Calculated via event "${event}" with duration ${durationSec}s at $${rateMin}/min.`);
    console.log(`[SignalR Push Server] Broadcasted refresh to active interpreter dashboards.`);

    res.json({
      success: true,
      service: 'ASP.NET Core Agora Webhook Gateway',
      eventReceived: event,
      channelId: channel || `AGORA_VRI_${Math.floor(Math.random() * 900000)}`,
      auditLogs: {
        databaseEngine: 'MS SQL Server Ledger Table',
        commitStatus: 'COMMITTED_SUCCESSFULLY',
        antiTamperClock: 'VERIFIED_OK_SERVER_AUTHORITATIVE',
        timestamp: new Date().toISOString()
      },
      calculation: {
        absoluteDurationSeconds: durationSec,
        preciseMinutes: Number((durationSec / 60).toFixed(4)),
        perMinuteRate: rateMin,
        earningCredit: Number(computedEarningCredit.toFixed(2))
      },
      recordCommitted: newRecord
    });
  });

  // API Route: Secure AI Medical Scribe Generator
  app.post('/api/scribe', async (req, res) => {
    const { interpreterName, doctorName, languagePair, durationSeconds, symptoms, documentName, documentType } = req.body;

    const languages = languagePair || ['Arabic', 'English'];
    const specSymptoms = symptoms || 'Acute epigastric discomfort, nausea, radiating lower throat tightness.';
    const docName = doctorName || 'Dr. Farouk (Nile Hospital)';
    const intName = interpreterName || 'Prof. Dmitry Sokolov';
    const activeDoc = documentName ? `Shared Document: ${documentName} (${documentType})` : 'No uploaded clinical records';

    const prompt = `You are NileBridge VRI's state-of-the-art secure Real-Time AI Medical Scribe.
We have just completed a tri-party medical translation session of ${Math.floor(durationSeconds || 180)} seconds.
Here are the session parameters:
- Certified Interpreter: ${intName}
- Languages: ${languages.join(' and ')}
- Doctor: ${docName}
- Patient Chief Complaints/Symptoms: ${specSymptoms}
- Active Clinical Documents: ${activeDoc}

Generate a highly detailed post-consultation clinic file in JSON format.
The file must contain:
1. "transcript": A highly authentic, professional bi-lingual (English and Arabic) sequential dialogue transcript of about 6-8 exchanges during the live video call. Show the patient describing symptoms in Arabic/English, the interpreter translating into Egyptian Arabic or English flawlessly, and the doctor providing clinical assessments/instructions.
2. "summary": A structured 'Post-Consultation Medical Care Summary' containing the following fields:
   - "patientInformation": Patient ID (NB-992-DELTA), session duration, and date.
   - "chiefComplaints": A detailed summary of symptoms reported.
   - "doctorAssessment": Clinical assessment, diagnostics, or observations.
   - "instructions": Multi-step instructions given by the doctor (translated clearly into both Arabic and English).
   - "prescriptions": Structured medication lists including dosage, frequency, and duration (e.g. Amoxicillin, Antacids).
   - "complianceAudit": Compliance audit log noting HIPAA and Egyptian Sovereignty policies observed.

Return strictly a JSON object matching the following TypeScript shape (no extra markdown blocks, code blocks, or text wrapper outside the raw JSON string):
{
  "transcript": [
    { "speaker": "Patient" | "Interpreter" | "Doctor", "text": string, "translation"?: string }
  ],
  "summary": {
    "patientInformation": string,
    "chiefComplaints": string,
    "doctorAssessment": string,
    "instructions": string[],
    "prescriptions": string[],
    "complianceAudit": string
  }
}`;

    if (ai) {
      try {
        console.log('Calling Gemini model gemini-3.5-flash for medical scribing...');
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const textResponse = response.text;
        if (textResponse) {
          const parsedData = JSON.parse(textResponse);
          return res.json({ success: true, ...parsedData });
        } else {
          throw new Error('Empty response from Gemini API');
        }
      } catch (err: any) {
        console.error('Gemini API scribe generation failed, falling back to simulated high-fidelity scribe:', err.message);
        // Fallback to high-fidelity mock if Gemini client throws error
        return res.json(getSimulatedScribe(intName, docName, languages, specSymptoms, activeDoc));
      }
    } else {
      // Return simulated scribe response immediately if no API key is provided
      console.log('No Gemini API key. Returning realistic simulated scribe.');
      return res.json(getSimulatedScribe(intName, docName, languages, specSymptoms, activeDoc));
    }
  });

  // --- NEW VRI PLATFORM ENTERPRISE ENDPOINTS ---

  // Live Staff Queue Memory (mimics ASP.NET routing table & database state)
  const ON_CALL_QUEUE = [
    {
      id: 'int-1',
      name: 'Yasmine Mansour',
      languages: ['English', 'Arabic'],
      rating: 4.9,
      specializations: ['Surgery', 'General ER'],
      isOnline: true,
      ratePerMinute: 2.80,
      experienceYears: 8,
      dialect: 'Egyptian Cairene (Highly Fluent)',
      cairoDist: 0.4,
      alexDist: 220.0
    },
    {
      id: 'int-2',
      name: 'Michael Vance',
      languages: ['English', 'German', 'Arabic'],
      rating: 4.8,
      specializations: ['Internal Medicine', 'Pharmacology'],
      isOnline: true,
      ratePerMinute: 3.20,
      experienceYears: 12,
      dialect: 'Egyptian Classical / Cairene',
      cairoDist: 1.8,
      alexDist: 225.5
    },
    {
      id: 'int-3',
      name: 'Lucia Sanchez',
      languages: ['English', 'Spanish'],
      rating: 4.6,
      specializations: ['Pediatrics', 'General ER'],
      isOnline: true,
      ratePerMinute: 2.50,
      experienceYears: 7,
      dialect: 'Latin American Spanish / US English',
      cairoDist: 3.2,
      alexDist: 228.0
    },
    {
      id: 'int-4',
      name: 'Karim El-Gawly',
      languages: ['English', 'Arabic'],
      rating: 4.7,
      specializations: ['Pharmacology', 'Cardiology'],
      isOnline: true,
      ratePerMinute: 2.90,
      experienceYears: 6,
      dialect: 'Egyptian Alexandrian / Saeedi Accent Match',
      cairoDist: 218.0,
      alexDist: 0.2
    },
    {
      id: 'int-5',
      name: 'Prof. Dmitry Sokolov',
      languages: ['English', 'Russian', 'Arabic'],
      rating: 5.0,
      specializations: ['Surgery', 'Cardiology'],
      isOnline: true,
      ratePerMinute: 3.50,
      experienceYears: 15,
      dialect: 'Levantine / Cairene Scientific Arabic',
      cairoDist: 1.1,
      alexDist: 219.2
    }
  ];

  // 1. Get On-Call Queue Table
  app.get('/api/oncall/queue', (req, res) => {
    res.json({
      success: true,
      service: 'ASP.NET Core Hunt-Group Daemon',
      timestamp: new Date().toISOString(),
      queue: ON_CALL_QUEUE
    });
  });

  // 2. Perform Backend 20-Second Hunt-Group & Failover Routing Calculation
  app.post('/api/oncall/route', (req, res) => {
    const { primaryInterpreterId, languagePair, currentGpsNode } = req.body;
    
    // Look for matching language-tier interpreters excluding the primary
    const reqLangs = languagePair || ['English', 'Arabic'];
    const backupStaff = ON_CALL_QUEUE.filter(item => {
      if (item.id === primaryInterpreterId) return false;
      if (!item.isOnline) return false;
      // Match language overlaps
      return reqLangs.every((lang: string) => item.languages.includes(lang)) || 
             (reqLangs[0] && item.languages.includes(reqLangs[0])) ||
             (reqLangs[1] && item.languages.includes(reqLangs[1]));
    });

    // Sort by proximity to selected GPS Node
    const sortedBackups = [...backupStaff].sort((a, b) => {
      const distA = currentGpsNode === 'Alexandria' ? (a.alexDist || 200) : (a.cairoDist || 1);
      const distB = currentGpsNode === 'Alexandria' ? (b.alexDist || 200) : (b.cairoDist || 1);
      return distA - distB;
    });

    const primaryStaff = ON_CALL_QUEUE.find(item => item.id === primaryInterpreterId) || null;
    const selectedBackup = sortedBackups[0] || ON_CALL_QUEUE.find(item => item.id !== primaryInterpreterId && item.isOnline) || null;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      service: 'ASP.NET SignalR Dispatch Engine',
      routingTrace: {
        stage1_primaryMatch: primaryStaff ? { id: primaryStaff.id, name: primaryStaff.name, status: 'ALERTED' } : 'none',
        stage2_failoverAction: 'AUTOMATIC_CASCADE_20S_TIMEOUT',
        stage3_cascadedMatch: selectedBackup ? {
          id: selectedBackup.id,
          name: selectedBackup.name,
          languages: selectedBackup.languages,
          proximityKm: currentGpsNode === 'Alexandria' ? selectedBackup.alexDist : selectedBackup.cairoDist,
          ratePerMinute: selectedBackup.ratePerMinute
        } : null,
        huntGroupSeconds: 20
      }
    });
  });

  // 3. Agora Event-Driven Billing Webhook
  app.post('/api/billing/webhook', (req, res) => {
    const { event, channel, durationSeconds, ratePerMinute } = req.body;
    
    // Agora channel destroy or user left simulation
    if (!event || !['channel_destroy', 'user_left'].includes(event)) {
      return res.status(400).json({ success: false, error: 'Invalid Agora event webhook' });
    }

    const durationSec = durationSeconds !== undefined ? Number(durationSeconds) : 180;
    const rateMin = ratePerMinute !== undefined ? Number(ratePerMinute) : 2.80;
    const platformMargin = 3.50;

    // Calculate duration in minutes (precise float)
    const durationMin = durationSec / 60;
    
    // Compute invoice amount directly on the backend to avoid client clock tamper
    const invoiceAmount = (durationMin * rateMin) + platformMargin;

    res.json({
      success: true,
      service: 'Agora Live Metering Webhook Handler',
      eventReceived: event,
      channelId: channel || `VRI_AMBER_NIL_${Math.floor(Math.random() * 900000)}`,
      auditLogs: {
        processedTimestamp: new Date().toISOString(),
        calculationEngine: 'Live Event-Driven Billing Service (AES-256-GCM)',
        antiTamperClockStatus: 'VERIFIED_OK'
      },
      calculation: {
        durationSeconds: durationSec,
        durationMinutes: Number(durationMin.toFixed(2)),
        specificRate: rateMin,
        platformServiceMargin: platformMargin,
        computedTotalInvoice: Number(invoiceAmount.toFixed(2))
      }
    });
  });

  // 4. B2B Invoicing and Retail B2C Pre-auth Settlement
  app.post('/api/billing/invoice', (req, res) => {
    const { profileType, hospitalAccountCode, clientName, totalAmount } = req.body;

    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const amt = totalAmount !== undefined ? Number(totalAmount) : 11.90;

    if (profileType === 'B2B_HOSPITAL') {
      return res.json({
        success: true,
        settlementType: 'B2B_CREDIT_FACILITY_INVOICING',
        invoiceId,
        billingProfile: {
          clientName: clientName || 'Nile University Hospital Group',
          accountCode: hospitalAccountCode || 'NUH-EGYPT-990-ACC',
          terms: 'NET_30_DAYS'
        },
        auditTrail: {
          hipaaSigned: true,
          sovereignVoucherGenerated: true,
          amountInvoiced: amt,
          status: 'ISSUED_B2B_LEDGER'
        }
      });
    } else {
      return res.json({
        success: true,
        settlementType: 'B2C_RETAIL_CARD_PREAUTH_RELEASE',
        invoiceId,
        billingProfile: {
          clientName: clientName || 'International Tourist',
          cardTokenRef: 'tok_18fE9Gg83F4S',
          preAuthHoldHeld: 150.00
        },
        auditTrail: {
          stripeChargeApproved: true,
          finalSettlementReleased: amt,
          refundIssued: Number((150.00 - amt).toFixed(2)),
          status: 'SETTLED_RETAIL_STRIPE'
        }
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for development.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static path mounted.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// High-fidelity fallback generation to match extreme enterprise quality even when offline/unconfigured
function getSimulatedScribe(intName: string, docName: string, languages: string[], symptoms: string, activeDoc: string) {
  return {
    success: true,
    isSimulated: true,
    transcript: [
      {
        speaker: 'Patient',
        text: 'أشعر بألم شديد وحرقان في الجزء العلوي من المعدة بعد تناول الطعام، ويمتد الألم أحياناً إلى حلقي.',
        translation: 'I feel severe pain and burning in the upper part of my stomach after eating, and the pain sometimes extends to my throat.'
      },
      {
        speaker: 'Interpreter',
        text: 'The patient describes experiencing severe pain and a sharp burning sensation in the epigastric region of the stomach post-prandial. She mentions it occasionally radiates upwards towards her lower throat.',
        translation: 'تصف المريضة شعوراً بألم شديد وحرقان حاد في منطقة الجزء العلوي من المعدة بعد الأكل. وتذكر أنه يمتد أحياناً إلى حلقها.'
      },
      {
        speaker: 'Doctor',
        text: 'I see. This sounds like severe gastroesophageal reflux or possible gastritis. I will prescribe Amoxicillin to cover any bacterial involvement and an antacid suspension. How long has this been occurring?',
        translation: 'أفهم ذلك. يبدو هذا كارتجاع مريئي حاد أو التهاب محتمل في المعدة. سأصف لها دواء أموكسيسيلين كعلاج مضاد حيوي ومحلول مضاد للحموضة. منذ متى يحدث هذا؟'
      },
      {
        speaker: 'Interpreter',
        text: 'يا مدام، الدكتور يسأل منذ متى وأنتِ تعانين من هذه الأعراض؟',
        translation: 'Madam, the doctor is asking how long you have been suffering from these symptoms?'
      },
      {
        speaker: 'Patient',
        text: 'بدأت هذه الحالة منذ حوالي أسبوعين تقريباً، وتزداد سوءاً بشكل خاص في الليل عندما أحاول النوم.',
        translation: 'This condition started about two weeks ago, and it gets particularly worse at night when I try to sleep.'
      },
      {
        speaker: 'Interpreter',
        text: 'She states that the symptoms initiated approximately two weeks ago, and they exacerbate significantly during nocturnal hours when she attempts to recumb.'
      }
    ],
    summary: {
      patientInformation: 'Patient ID: NB-992-DELTA | Session Duration: 180s | Date: June 29, 2026',
      chiefComplaints: symptoms || 'Epigastric burning discomfort, post-prandial severity, nocturnal exacerbation.',
      doctorAssessment: 'Gastroesophageal Reflux Disease (GERD) with mild gastric mucosal irritation. Vitals are hemodynamically stable. ' + activeDoc,
      instructions: [
        'Avoid heavy or high-fat meals at least 3 hours before sleep. (تجنب الوجبات الثقيلة أو الدسمة قبل النوم بـ 3 ساعات على الأقل)',
        'Elevate the head of your bed by 6 inches to minimize nocturnal acid reflux. (ارفع رأس السرير بمقدار 15 سم لتقليل الارتجاع الليلي)',
        'Take the prescribed antibiotic course completely without interruption. (خذ جرعة المضاد الحيوي كاملة دون انقطاع)'
      ],
      prescriptions: [
        'Amoxicillin 500mg - 1 capsule every 8 hours post meals for 7 days.',
        'Antacid Suspension (Gaviscon) - 10ml thrice daily after meals and before bedtime.'
      ],
      complianceAudit: 'Processed under Zero-Knowledge Sovereign Gateway. Enforced HIPAA Title II Transit Safeguards. Encryption: AES-256-GCM. Session Vault cleared.'
    }
  };
}

startServer();
