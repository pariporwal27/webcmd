/**
 * TrustLens Demo Scenarios
 *
 * Pre-configured real-world investigation scenarios optimized for hackathon judging.
 */

import type { DemoScenario, InvestigationReport } from './types.js';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'legit-tech-startup',
    name: 'NovaFlow AI (Verified AI Startup)',
    category: 'startup_service',
    url: 'https://novaflow-ai-demo.org',
    tagline: 'Enterprise Autonomous Data Workflows',
    description: 'A genuine high-growth B2B enterprise software company with transparent founders, active GitHub, verified Delaware registration, and positive press.',
    targetProfile: 'legitimate',
    expectedScoreRange: [80, 95],
  },
  {
    id: 'fake-internship-scam',
    name: 'Apex Global (Remote AI Intern Scam)',
    category: 'job_internship',
    url: 'https://apex-careers-portal.net/jobs/ai-intern',
    tagline: '$50/hr Remote AI Data Annotator — No Experience Needed',
    description: 'A fraudulent recruitment portal that lures university students with high pay, conducts interviews exclusively on Telegram, and demands a $150 "training kit" fee.',
    targetProfile: 'scam',
    expectedScoreRange: [10, 25],
  },
  {
    id: 'suspicious-ecommerce',
    name: 'LuxeTrend Outlet (Deceptive Storefront)',
    category: 'ecommerce',
    url: 'https://luxetrend-flashdeals.shop',
    tagline: 'Designer Bags & Electronics — 90% Off Today Only!',
    description: 'A newly-created dropshipping store with dummy "#" social media icons, fake countdown timers, missing physical headquarters, and multiple complaint reports.',
    targetProfile: 'suspicious',
    expectedScoreRange: [15, 30],
  },
  {
    id: 'phishing-scholarship',
    name: 'National Merit Grant (Fee Harvesting Portal)',
    category: 'scholarship',
    url: 'https://national-merit-grant-foundation.org',
    tagline: 'Guaranteed $10,000 Academic Student Grants',
    description: 'A deceptive scholarship website demanding a non-refundable $35 "expedited application fee" and sensitive financial details without any educational accreditation.',
    targetProfile: 'phishing',
    expectedScoreRange: [12, 25],
  },
];

export function buildScenarioReport(scenarioId: string): InvestigationReport {
  const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId) ?? DEMO_SCENARIOS[0];
  const now = new Date().toISOString();

  if (scenario.id === 'legit-tech-startup') {
    return {
      id: `report-${Date.now()}`,
      targetUrl: scenario.url,
      inferredCategory: 'startup_service',
      timestamp: now,
      durationMs: 4250,
      trustScore: 88,
      riskLevel: 'Low Risk',
      recommendation: 'Appears legitimate with verified business identity, active founder presence, and consistent contact channels. Continue normal caution.',
      scoreBreakdown: {
        identityScore: 25,
        domainSecurityScore: 20,
        socialPresenceScore: 20,
        reputationScore: 18,
        businessPracticeScore: 15,
        riskPenalties: 0,
        totalScore: 88,
        riskLevel: 'Low Risk',
      },
      positiveSignals: [
        { category: 'Identity', title: 'Company Identity Stated', detail: 'Verified organization entity: "NovaFlow AI Technologies, Inc." (Delaware File #749281).' },
        { category: 'Identity', title: 'Physical Address Provided', detail: 'Headquarters: 450 Townsend St, San Francisco, CA 94107, USA.' },
        { category: 'Contact', title: 'Official Domain Email', detail: 'Inquiries route through official domain: support@novaflow.ai, press@novaflow.ai.' },
        { category: 'Security', title: 'Valid SSL Certificate', detail: 'Transport layer security is active (Issuer: Let\'s Encrypt Authority E6).' },
        { category: 'Domain', title: 'Established Domain Footprint', detail: 'Domain registration active for 3.4 years with stable DNS history.' },
        { category: 'Social', title: 'Active Social Presence', detail: 'Verified active profiles on GitHub (4.2k stars), LinkedIn (34 employees), Twitter/X.' },
        { category: 'Reputation', title: 'Positive External Reviews', detail: 'Found independent coverage on Hacker News, TechCrunch, and G2 (4.7/5 rating).' },
        { category: 'Policy', title: 'Privacy Policy Published', detail: 'GDPR and CCPA compliant privacy disclosure updated within the last 6 months.' },
      ],
      warnings: [
        { severity: 'low', category: 'Reputation', title: 'Limited Consumer Review Volume', detail: 'B2B enterprise focus results in few consumer reviews on Trustpilot.' },
      ],
      evidence: {
        identity: {
          companyName: 'NovaFlow AI Technologies, Inc.',
          legalEntity: 'Delaware C-Corp',
          domain: 'novaflow-ai-demo.org',
          claimedAddress: '450 Townsend St, San Francisco, CA 94107',
          copyrightYear: 2026,
          sslValid: true,
          sslIssuer: 'Let\'s Encrypt E6',
          domainAgeYears: 3.4,
          hasAboutPage: true,
          hasPrivacyPolicy: true,
          hasTermsOfService: true,
          headingsSummary: 'Autonomous Data Workflows for Modern Engineering Teams',
        },
        contact: {
          emails: ['support@novaflow.ai', 'press@novaflow.ai'],
          domainMatchingEmails: ['support@novaflow.ai'],
          freeMailEmails: [],
          phoneNumbers: ['+1 (415) 890-3211'],
          addresses: ['450 Townsend St, San Francisco, CA 94107'],
          hasContactForm: true,
          contactChannels: ['email', 'phone', 'form'],
        },
        social: {
          links: [
            { platform: 'github', url: 'https://github.com/novaflow-ai', isDummy: false },
            { platform: 'linkedin', url: 'https://linkedin.com/company/novaflow-ai', isDummy: false },
            { platform: 'twitter', url: 'https://x.com/novaflow_ai', isDummy: false },
          ],
          platformsFound: ['github', 'linkedin', 'twitter'],
          hasActivePresence: true,
          dummyLinksCount: 0,
        },
        reputation: {
          reviews: [
            { platform: 'G2', rating: 4.7, maxRating: 5, reviewCount: 48, summary: 'High reliability in data ingestion pipelines', sentiment: 'positive' },
            { platform: 'Hacker News', summary: 'Discussion thread verified founder accounts and technical architecture', sentiment: 'positive' },
          ],
          scamReports: [],
          mentionsCount: 124,
          overallSentiment: 'positive',
        },
      },
      recoveryActions: [
        'Detected GDPR cookie consent banner on landing page — automatically dismissed using BasePage click recovery.',
        'Extracted structured JSON-LD organization schema to verify legal entity registration.',
      ],
      logs: [
        { id: '1', timestamp: '00:00.120', stepIndex: 1, stepName: 'Navigation', action: 'goto', status: 'info', detail: 'Connecting to target website https://novaflow-ai-demo.org...', url: 'https://novaflow-ai-demo.org' },
        { id: '2', timestamp: '00:00.640', stepIndex: 2, stepName: 'DOM Inspection', action: 'snapshot', status: 'recovery', detail: 'Consent overlay [aria-label="Cookie Consent"] detected — successfully bypassed.' },
        { id: '3', timestamp: '00:01.150', stepIndex: 3, stepName: 'Identity Extraction', action: 'extract', status: 'success', detail: 'Identified entity "NovaFlow AI Technologies, Inc." (San Francisco, CA).' },
        { id: '4', timestamp: '00:01.890', stepIndex: 4, stepName: 'Contact Audit', action: 'extract', status: 'success', detail: 'Found domain-matching contact email support@novaflow.ai and US headquarters.' },
        { id: '5', timestamp: '00:02.400', stepIndex: 5, stepName: 'Social Verification', action: 'verify_socials', status: 'success', detail: 'Confirmed active GitHub repository and verified company LinkedIn profile.' },
        { id: '6', timestamp: '00:03.100', stepIndex: 6, stepName: 'Search Reputation', action: 'search_query', status: 'info', detail: 'Queried: "NovaFlow AI" review OR scam OR complaints across search engines.' },
        { id: '7', timestamp: '00:03.800', stepIndex: 7, stepName: 'Risk Analysis', action: 'analyze_risk', status: 'success', detail: 'Zero scam reports found. Domain age: 3.4 years. SSL: Valid TLS 1.3.' },
        { id: '8', timestamp: '00:04.250', stepIndex: 8, stepName: 'Trust Scoring', action: 'finalize_score', status: 'success', detail: 'Calculated Trust Score: 88/100 (Low Risk).' },
      ],
    };
  }

  if (scenario.id === 'fake-internship-scam') {
    return {
      id: `report-${Date.now()}`,
      targetUrl: scenario.url,
      inferredCategory: 'job_internship',
      timestamp: now,
      durationMs: 4680,
      trustScore: 14,
      riskLevel: 'High Risk',
      recommendation: 'HIGH RISK OF EMPLOYMENT FRAUD. Do NOT pay any upfront equipment, training, or application fees. Legitimate employers never conduct official onboarding solely through unverified chat apps (Telegram/WhatsApp).',
      scoreBreakdown: {
        identityScore: 4,
        domainSecurityScore: 5,
        socialPresenceScore: 0,
        reputationScore: 5,
        businessPracticeScore: 0,
        riskPenalties: 45,
        totalScore: 14,
        riskLevel: 'High Risk',
      },
      positiveSignals: [
        { category: 'Security', title: 'Basic SSL Present', detail: 'Domain has a free Cloudflare SSL certificate installed.' },
      ],
      warnings: [
        { severity: 'critical', category: 'Fraud Alert', title: 'Upfront Equipment / Training Fee Demanded', detail: 'Job posting requires applicants to pay a $150 "Software License & Hardware Shipping Kit" fee before receiving work.' },
        { severity: 'critical', category: 'Contact', title: 'Recruitment Redirected Exclusively to Telegram', detail: 'Candidates are instructed to message a personal Telegram handle (@HR_Apex_Recruiter) for interviews instead of official corporate channels.' },
        { severity: 'high', category: 'Identity', title: 'Ghost Company / Stolen Business Identity', detail: 'No business incorporation record matches "Apex Global Talent Ltd." at the claimed UK address.' },
        { severity: 'high', category: 'Domain', title: 'Disposable Domain', detail: 'Domain apex-careers-portal.net was registered 9 days ago with privacy redaction.' },
        { severity: 'high', category: 'Social', title: 'No Verifiable Social Footprint', detail: 'All social media icons on footer point to "#" (dummy placeholder links).' },
        { severity: 'medium', category: 'Compensation', title: 'Unrealistic Pay Promises', detail: 'Offers $50/hour for "entry-level data entry / AI training" with no interview or prerequisite experience.' },
      ],
      evidence: {
        identity: {
          companyName: 'Apex Global Talent Ltd.',
          domain: 'apex-careers-portal.net',
          claimedAddress: '71-75 Shelton Street, London, WC2H 9JQ, UK (Known virtual mail drop)',
          copyrightYear: 2026,
          sslValid: true,
          sslIssuer: 'Cloudflare',
          domainAgeYears: 0.02,
          hasAboutPage: false,
          hasPrivacyPolicy: false,
          hasTermsOfService: false,
          headingsSummary: 'Immediate Hire: Remote AI Annotator ($50/hr)',
        },
        contact: {
          emails: ['apexrecruiting2026@gmail.com'],
          domainMatchingEmails: [],
          freeMailEmails: ['apexrecruiting2026@gmail.com'],
          phoneNumbers: [],
          addresses: ['71-75 Shelton Street, London (Virtual Office)'],
          hasContactForm: true,
          contactChannels: ['telegram', 'gmail'],
        },
        social: {
          links: [
            { platform: 'facebook', url: '#', isDummy: true },
            { platform: 'twitter', url: '#', isDummy: true },
            { platform: 'linkedin', url: '#', isDummy: true },
          ],
          platformsFound: [],
          hasActivePresence: false,
          dummyLinksCount: 3,
        },
        reputation: {
          reviews: [
            { platform: 'Reddit (r/Scams)', summary: 'User report: "Apex Careers took $150 via Zelle for fake laptop kit and ghosted"', sentiment: 'negative' },
          ],
          scamReports: [
            'Fake task-based employment scam reported on r/Scams and ScamAdviser',
          ],
          mentionsCount: 14,
          overallSentiment: 'suspicious',
        },
      },
      recoveryActions: [
        'Page attempted anti-right-click and text selection blocker — bypassed via CDP evaluate injection.',
        'Extracted hidden contact parameters from job submission form action.',
      ],
      logs: [
        { id: '1', timestamp: '00:00.110', stepIndex: 1, stepName: 'Navigation', action: 'goto', status: 'info', detail: 'Navigating to https://apex-careers-portal.net/jobs/ai-intern...', url: 'https://apex-careers-portal.net' },
        { id: '2', timestamp: '00:00.750', stepIndex: 2, stepName: 'DOM Inspection', action: 'snapshot', status: 'warn', detail: 'Detected script blocking right-click/inspect — neutralized via evaluate script.' },
        { id: '3', timestamp: '00:01.320', stepIndex: 3, stepName: 'Job Offer Extraction', action: 'extract', status: 'warn', detail: 'Extracted job description: "$50/hr Entry Level Remote AI Intern — No Experience".' },
        { id: '4', timestamp: '00:02.100', stepIndex: 4, stepName: 'Contact Channel Audit', action: 'extract', status: 'error', detail: 'ALERT: Contact directs to Telegram handle @HR_Apex_Recruiter and gmail.com webmail!' },
        { id: '5', timestamp: '00:02.850', stepIndex: 5, stepName: 'Fee Keyword Scanning', action: 'regex_scan', status: 'error', detail: 'FLAG: Found payment demand: "$150 onboarding security deposit / software kit".' },
        { id: '6', timestamp: '00:03.550', stepIndex: 6, stepName: 'Domain Age Lookup', action: 'whois_probe', status: 'warn', detail: 'Domain created 9 days ago. Name servers: Cloudflare disposable setup.' },
        { id: '7', timestamp: '00:04.120', stepIndex: 7, stepName: 'Reputation Check', action: 'search_query', status: 'error', detail: 'Found matching complaint thread on r/Scams: "Fake remote job asking for Zelle deposit".' },
        { id: '8', timestamp: '00:04.680', stepIndex: 8, stepName: 'Trust Scoring', action: 'finalize_score', status: 'error', detail: 'Calculated Trust Score: 14/100 (HIGH RISK SCAM).' },
      ],
    };
  }

  if (scenario.id === 'suspicious-ecommerce') {
    return {
      id: `report-${Date.now()}`,
      targetUrl: scenario.url,
      inferredCategory: 'ecommerce',
      timestamp: now,
      durationMs: 4120,
      trustScore: 22,
      riskLevel: 'High Risk',
      recommendation: 'HIGH RISK OF FINANCIAL LOSS. Indicators suggest a deceptive storefront with fake discounts and unverified payment handling. Avoid entering credit card or payment details.',
      scoreBreakdown: {
        identityScore: 5,
        domainSecurityScore: 5,
        socialPresenceScore: 0,
        reputationScore: 5,
        businessPracticeScore: 7,
        riskPenalties: 35,
        totalScore: 22,
        riskLevel: 'High Risk',
      },
      positiveSignals: [
        { category: 'Security', title: 'SSL Encryption Present', detail: 'HTTPS connection is established.' },
        { category: 'Policy', title: 'Copied Terms Document Present', detail: 'Standard generic e-commerce terms template found.' },
      ],
      warnings: [
        { severity: 'critical', category: 'Deceptive UX', title: 'Artificial Urgency Countdown Timers', detail: 'Page injects a recurring "Only 3 items left - deal ends in 04:59" timer that resets on reload.' },
        { severity: 'high', category: 'Pricing', title: 'Unrealistic 90% Price Markdown', detail: 'High-end luxury electronics and fashion listed at 85-95% below manufacturer wholesale prices.' },
        { severity: 'high', category: 'Identity', title: 'No Registered Corporate Address', detail: 'Footer and Contact Us page list zero physical warehouse or office addresses.' },
        { severity: 'high', category: 'Social', title: 'Unlinked Template Social Icons', detail: 'Facebook, Instagram, and Pinterest buttons link to dead "#" URLs.' },
        { severity: 'medium', category: 'Domain', title: 'Brand New .shop Domain', detail: 'Domain was created 18 days ago via a budget registrar.' },
      ],
      evidence: {
        identity: {
          companyName: 'LuxeTrend Flash Deals',
          domain: 'luxetrend-flashdeals.shop',
          claimedAddress: '',
          copyrightYear: 2026,
          sslValid: true,
          sslIssuer: 'Let\'s Encrypt',
          domainAgeYears: 0.05,
          hasAboutPage: false,
          hasPrivacyPolicy: true,
          hasTermsOfService: true,
          headingsSummary: 'Mega Summer Clearance — 90% Off Everything',
        },
        contact: {
          emails: ['service_luxetrend@hotmail.com'],
          domainMatchingEmails: [],
          freeMailEmails: ['service_luxetrend@hotmail.com'],
          phoneNumbers: [],
          addresses: [],
          hasContactForm: true,
          contactChannels: ['form', 'webmail'],
        },
        social: {
          links: [
            { platform: 'instagram', url: '#', isDummy: true },
            { platform: 'facebook', url: '#', isDummy: true },
          ],
          platformsFound: [],
          hasActivePresence: false,
          dummyLinksCount: 2,
        },
        reputation: {
          reviews: [
            { platform: 'Trustpilot Search', summary: 'Multiple complaints: "Items never received, unauthorized recurring billing"', sentiment: 'negative' },
          ],
          scamReports: ['Reported on ScamAdviser (Trustscore: 1/100)'],
          mentionsCount: 9,
          overallSentiment: 'suspicious',
        },
      },
      recoveryActions: [
        'Detected floating discount modal overlay — dismissed via button:has-text("X") selector.',
        'Detected artificial JavaScript timer restarting upon sessionStorage purge.',
      ],
      logs: [
        { id: '1', timestamp: '00:00.100', stepIndex: 1, stepName: 'Navigation', action: 'goto', status: 'info', detail: 'Navigating to storefront https://luxetrend-flashdeals.shop...', url: 'https://luxetrend-flashdeals.shop' },
        { id: '2', timestamp: '00:00.820', stepIndex: 2, stepName: 'Popup Dismissal', action: 'click', status: 'recovery', detail: 'Closed intrusive "SPIN TO WIN 90% OFF" full-screen overlay.' },
        { id: '3', timestamp: '00:01.450', stepIndex: 3, stepName: 'Storefront Scan', action: 'extract', status: 'warn', detail: 'Detected fake urgency timer (resetting on reload) and universal 90% discount.' },
        { id: '4', timestamp: '00:02.100', stepIndex: 4, stepName: 'Contact Audit', action: 'extract', status: 'error', detail: 'Zero physical address listed. Customer care email is service_luxetrend@hotmail.com.' },
        { id: '5', timestamp: '00:02.900', stepIndex: 5, stepName: 'Social Audit', action: 'verify_socials', status: 'error', detail: 'Social icons in footer are dummy "#" links without connected accounts.' },
        { id: '6', timestamp: '00:03.600', stepIndex: 6, stepName: 'External Query', action: 'search_query', status: 'error', detail: 'ScamAdviser match: Trust rating 1/100, unfulfilled shipment reports.' },
        { id: '7', timestamp: '00:04.120', stepIndex: 7, stepName: 'Trust Scoring', action: 'finalize_score', status: 'error', detail: 'Calculated Trust Score: 22/100 (HIGH RISK STORE).' },
      ],
    };
  }

  // Fallback / Scholarship
  return {
    id: `report-${Date.now()}`,
    targetUrl: scenario.url,
    inferredCategory: 'scholarship',
    timestamp: now,
    durationMs: 3890,
    trustScore: 18,
    riskLevel: 'High Risk',
    recommendation: 'HIGH RISK OF SCHOLARSHIP PHISHING. Legitimate academic grants and scholarships never charge mandatory application fees or demand sensitive banking info upfront.',
    scoreBreakdown: {
      identityScore: 6,
      domainSecurityScore: 5,
      socialPresenceScore: 0,
      reputationScore: 5,
      businessPracticeScore: 2,
      riskPenalties: 40,
      totalScore: 18,
      riskLevel: 'High Risk',
    },
    positiveSignals: [
      { category: 'Security', title: 'HTTPS Enabled', detail: 'Secure connection active.' },
    ],
    warnings: [
      { severity: 'critical', category: 'Financial', title: 'Mandatory $35 "Processing Fee"', detail: 'Requires non-refundable credit card payment before scholarship application can be submitted.' },
      { severity: 'high', category: 'Accreditation', title: 'Unaccredited Entity', detail: 'No educational board or government agency affiliation found.' },
      { severity: 'high', category: 'Identity', title: 'No Official Contact Phone or Building', detail: 'Contact form only, no verifiable organization headquarters.' },
    ],
    evidence: {
      identity: {
        companyName: 'National Merit Grant Foundation',
        domain: 'national-merit-grant-foundation.org',
        claimedAddress: 'Washington, D.C.',
        copyrightYear: 2026,
        sslValid: true,
        domainAgeYears: 0.1,
        hasAboutPage: true,
        hasPrivacyPolicy: false,
        hasTermsOfService: false,
        headingsSummary: 'Guaranteed College Scholarship Grants for 2026-2027',
      },
      contact: {
        emails: [],
        domainMatchingEmails: [],
        freeMailEmails: [],
        phoneNumbers: [],
        addresses: ['Washington, D.C. (No street address)'],
        hasContactForm: true,
        contactChannels: ['form'],
      },
      social: {
        links: [],
        platformsFound: [],
        hasActivePresence: false,
        dummyLinksCount: 2,
      },
      reputation: {
        reviews: [],
        scamReports: ['FTC advisory alert regarding fake scholarship fee collection'],
        mentionsCount: 5,
        overallSentiment: 'suspicious',
      },
    },
    recoveryActions: [
      'Bypassed required input fields to inspect final payment step.',
    ],
    logs: [
      { id: '1', timestamp: '00:00.100', stepIndex: 1, stepName: 'Navigation', action: 'goto', status: 'info', detail: 'Navigating to https://national-merit-grant-foundation.org...' },
      { id: '2', timestamp: '00:01.100', stepIndex: 2, stepName: 'Grant Audit', action: 'extract', status: 'warn', detail: 'Extracted grant claims: "Guaranteed $10,000 for all qualifying students".' },
      { id: '3', timestamp: '00:02.200', stepIndex: 3, stepName: 'Payment Gate Check', action: 'extract', status: 'error', detail: 'ALERT: Step 3 demands mandatory non-refundable $35 processing fee.' },
      { id: '4', timestamp: '00:03.200', stepIndex: 4, stepName: 'Entity Validation', action: 'search_query', status: 'error', detail: 'No 501(c)(3) non-profit registration exists for this organization name.' },
      { id: '5', timestamp: '00:03.890', stepIndex: 5, stepName: 'Trust Scoring', action: 'finalize_score', status: 'error', detail: 'Calculated Trust Score: 18/100 (HIGH RISK PHISHING).' },
    ],
  };
}
