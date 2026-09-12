/**
 * TrustLens Data Contracts & Types
 */

export type InvestigationCategory =
  | 'auto'
  | 'job_internship'
  | 'ecommerce'
  | 'startup_service'
  | 'scholarship'
  | 'general';

export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface IdentityEvidence {
  companyName: string;
  legalEntity?: string;
  domain: string;
  claimedAddress?: string;
  copyrightYear?: number;
  sslValid: boolean;
  sslIssuer?: string;
  domainAgeYears?: number;
  hasAboutPage: boolean;
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  headingsSummary?: string;
}

export interface ContactEvidence {
  emails: string[];
  domainMatchingEmails: string[];
  freeMailEmails: string[]; // gmail, yahoo, hotmail, etc.
  phoneNumbers: string[];
  addresses: string[];
  hasContactForm: boolean;
  contactChannels: string[]; // email, phone, form, telegram, whatsapp
}

export interface SocialLink {
  platform: string;
  url: string;
  isDummy: boolean; // '#' or unconfigured template link
}

export interface SocialEvidence {
  links: SocialLink[];
  platformsFound: string[];
  hasActivePresence: boolean;
  dummyLinksCount: number;
}

export interface ReviewSource {
  platform: string;
  rating?: number;
  maxRating?: number;
  reviewCount?: number;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  url?: string;
}

export interface ReputationEvidence {
  reviews: ReviewSource[];
  scamReports: string[];
  mentionsCount: number;
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'suspicious';
}

export interface RiskSignal {
  severity: Severity;
  category: string;
  title: string;
  detail: string;
  evidenceSnippet?: string;
}

export interface PositiveSignal {
  category: string;
  title: string;
  detail: string;
}

export interface TrustScoreBreakdown {
  identityScore: number;       // 0-25
  domainSecurityScore: number; // 0-20
  socialPresenceScore: number; // 0-20
  reputationScore: number;     // 0-20
  businessPracticeScore: number; // 0-15
  riskPenalties: number;       // deductions (negative)
  totalScore: number;          // 0-100
  riskLevel: RiskLevel;
}

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'recovery';

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  stepIndex: number;
  stepName: string;
  action: string;
  status: LogLevel;
  detail: string;
  url?: string;
}

export interface InvestigationReport {
  id: string;
  targetUrl: string;
  inferredCategory: InvestigationCategory;
  timestamp: string;
  durationMs: number;
  scoreBreakdown: TrustScoreBreakdown;
  trustScore: number;
  riskLevel: RiskLevel;
  recommendation: string;
  positiveSignals: PositiveSignal[];
  warnings: RiskSignal[];
  evidence: {
    identity: IdentityEvidence;
    contact: ContactEvidence;
    social: SocialEvidence;
    reputation: ReputationEvidence;
  };
  recoveryActions: string[];
  logs: AgentLogEntry[];
}

export interface DemoScenario {
  id: string;
  name: string;
  category: InvestigationCategory;
  url: string;
  tagline: string;
  description: string;
  targetProfile: 'legitimate' | 'suspicious' | 'scam' | 'phishing';
  expectedScoreRange: [number, number];
  cachedReport?: InvestigationReport;
}
