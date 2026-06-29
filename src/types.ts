export type Specialization = 'Surgery' | 'General ER' | 'Pharmacology' | 'Pediatrics' | 'Cardiology' | 'Internal Medicine';

export interface Interpreter {
  id: string;
  name: string;
  avatar: string;
  languages: string[];
  rating: number;
  specializations: Specialization[];
  isOnline: boolean;
  ratePerMinute: number;
  experienceYears: number;
  bio: string;
  dialect?: string;
  cairoDist?: number;
  alexDist?: number;
}

export interface Guide {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  languages: string[];
  specialties: string[];
  pricePerHour: number;
  experienceYears: number;
  bio: string;
}

export interface CallSession {
  id: string;
  channelName: string;
  clientName: string;
  interpreter: Interpreter | null;
  serviceType?: 'medical' | 'tourism';
  doctorName?: string;
  startTime?: Date;
  endTime?: Date;
  durationSeconds: number;
  status: 'idle' | 'calling' | 'failover' | 'connected' | 'completed' | 'timeout';
  isPreAuthHoldActive: boolean;
  preAuthAmount: number;
  totalCost: number;
}

export interface MedicalDocument {
  id: string;
  name: string;
  fileType: 'PDF' | 'Image' | 'Prescription';
  size: string;
  uploadedAt: string;
  uploadedBy: 'Client' | 'Doctor';
  contentUrl?: string;
}

export type RegionCode = 'EG' | 'US';

export interface RegionConfig {
  code: RegionCode;
  countryName: string;
  timezone: string;
  complianceName: string;
  hipaaEnforced: boolean;
  encryptionStandard: string;
  storagePolicy: string;
}
