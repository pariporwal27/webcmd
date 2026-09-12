/**
 * TrustLens Transparent Scoring Engine
 *
 * Implements an explainable, auditable trust evaluation rubric (0-100 score + Risk Level).
 */

import type {
  IdentityEvidence,
  ContactEvidence,
  SocialEvidence,
  ReputationEvidence,
  RiskSignal,
  PositiveSignal,
  TrustScoreBreakdown,
  RiskLevel,
  InvestigationCategory,
} from './types.js';

export interface ScoreInput {
  category: InvestigationCategory;
  identity: IdentityEvidence;
  contact: ContactEvidence;
  social: SocialEvidence;
  reputation: ReputationEvidence;
  rawRisks: RiskSignal[];
  rawPositives: PositiveSignal[];
}

export function calculateTrustScore(input: ScoreInput): {
  breakdown: TrustScoreBreakdown;
  positiveSignals: PositiveSignal[];
  warnings: RiskSignal[];
  recommendation: string;
} {
  const { identity, contact, social, reputation } = input;
  const positiveSignals: PositiveSignal[] = [...input.rawPositives];
  const warnings: RiskSignal[] = [...input.rawRisks];

  // 1. Identity & Transparency Score (0 - 25)
  let identityScore = 0;
  if (identity.companyName && identity.companyName !== 'Unknown' && identity.companyName.length > 2) {
    identityScore += 10;
    positiveSignals.push({
      category: 'Identity',
      title: 'Company Identity Stated',
      detail: `Identified organization entity: "${identity.companyName}".`,
    });
  } else {
    warnings.push({
      severity: 'high',
      category: 'Identity',
      title: 'Vague or Missing Organization Identity',
      detail: 'The website does not clearly state a verified registered business or organization name.',
    });
  }

  if (identity.claimedAddress || contact.addresses.length > 0) {
    identityScore += 8;
    positiveSignals.push({
      category: 'Identity',
      title: 'Physical Address Provided',
      detail: `Found claimed physical location: ${contact.addresses[0] || identity.claimedAddress}.`,
    });
  } else {
    warnings.push({
      severity: 'medium',
      category: 'Identity',
      title: 'No Physical Address Found',
      detail: 'No verifiable physical office or operational address is listed on the site.',
    });
  }

  if (contact.domainMatchingEmails.length > 0) {
    identityScore += 7;
    positiveSignals.push({
      category: 'Contact',
      title: 'Official Domain Email',
      detail: `Inquiries route through official domain email: ${contact.domainMatchingEmails.join(', ')}.`,
    });
  } else if (contact.freeMailEmails.length > 0) {
    warnings.push({
      severity: 'high',
      category: 'Contact',
      title: 'Free Webmail Address Used',
      detail: `Using generic webmail (@${contact.freeMailEmails[0].split('@')[1] || 'gmail.com'}) instead of an authenticated company domain email.`,
    });
  }

  // 2. Domain & Security Score (0 - 20)
  let domainSecurityScore = 0;
  if (identity.sslValid) {
    domainSecurityScore += 10;
    positiveSignals.push({
      category: 'Security',
      title: 'Valid SSL Certificate',
      detail: `Transport layer security is active (Issuer: ${identity.sslIssuer || 'Trusted CA'}).`,
    });
  } else {
    warnings.push({
      severity: 'critical',
      category: 'Security',
      title: 'Invalid or Missing SSL Encryption',
      detail: 'Connection to this site is not encrypted or carries an invalid certificate.',
    });
  }

  const age = identity.domainAgeYears ?? 2;
  if (age >= 1) {
    domainSecurityScore += 10;
    positiveSignals.push({
      category: 'Domain',
      title: 'Established Domain Footprint',
      detail: `Domain registration has been active for ~${age.toFixed(1)} years.`,
    });
  } else {
    warnings.push({
      severity: 'high',
      category: 'Domain',
      title: 'Newly Registered Domain',
      detail: 'Domain was created very recently (< 1 year), a common trait of disposable scam sites.',
    });
  }

  // 3. Social & External Footprint Score (0 - 20)
  let socialPresenceScore = 0;
  if (social.hasActivePresence && social.platformsFound.length > 0) {
    const points = Math.min(20, social.platformsFound.length * 7);
    socialPresenceScore += points;
    positiveSignals.push({
      category: 'Social',
      title: 'Active Social Presence',
      detail: `Verified active profiles across ${social.platformsFound.join(', ')}.`,
    });
  }

  if (social.dummyLinksCount > 0) {
    warnings.push({
      severity: 'high',
      category: 'Social',
      title: 'Unconfigured / Dummy Social Links',
      detail: `Found ${social.dummyLinksCount} social icon links pointing to '#' or template placeholders rather than actual profiles.`,
    });
  }

  // 4. Reputation & Reviews Score (0 - 20)
  let reputationScore = 0;
  if (reputation.reviews.length > 0) {
    const positiveReviews = reputation.reviews.filter(r => r.sentiment === 'positive');
    const negativeReviews = reputation.reviews.filter(r => r.sentiment === 'negative');
    if (positiveReviews.length > negativeReviews.length) {
      reputationScore += 15;
      positiveSignals.push({
        category: 'Reputation',
        title: 'Positive External Reviews',
        detail: `Found independent review presence on ${positiveReviews.map(r => r.platform).join(', ')}.`,
      });
    } else if (negativeReviews.length > 0) {
      reputationScore += 5;
      warnings.push({
        severity: 'high',
        category: 'Reputation',
        title: 'Negative Review Sentiment',
        detail: `Consumer reports on ${negativeReviews.map(r => r.platform).join(', ')} flag customer dissatisfaction or unfulfilled services.`,
      });
    } else {
      reputationScore += 10;
    }
  } else {
    // Neutral score for unreviewed but not flagged sites
    reputationScore += 10;
    warnings.push({
      severity: 'low',
      category: 'Reputation',
      title: 'Limited Independent Reviews',
      detail: 'No significant review volume found on major aggregators (Trustpilot, Sitejabber, Google).',
    });
  }

  // 5. Business & Policy Practices (0 - 15)
  let businessPracticeScore = 0;
  if (identity.hasPrivacyPolicy) {
    businessPracticeScore += 8;
    positiveSignals.push({
      category: 'Policy',
      title: 'Privacy Policy Published',
      detail: 'Legitimate privacy disclosure document is accessible on site.',
    });
  }
  if (identity.hasTermsOfService) {
    businessPracticeScore += 7;
    positiveSignals.push({
      category: 'Policy',
      title: 'Terms of Service Available',
      detail: 'Operational terms and consumer service contract are defined.',
    });
  }
  if (!identity.hasPrivacyPolicy && !identity.hasTermsOfService) {
    warnings.push({
      severity: 'medium',
      category: 'Policy',
      title: 'Missing Legal Disclosures',
      detail: 'No Terms of Service or Privacy Policy found, violating standard consumer compliance.',
    });
  }

  // 6. Direct Risk Deductions (Critical Penalties)
  let riskPenalties = 0;

  if (reputation.scamReports.length > 0) {
    riskPenalties += 30;
    warnings.push({
      severity: 'critical',
      category: 'Fraud Alert',
      title: 'Consumer Scam Reports Detected',
      detail: `External databases flag active scam or fraudulent activity: "${reputation.scamReports[0]}".`,
    });
  }

  if (social.dummyLinksCount >= 2) {
    riskPenalties += 15;
  }

  for (const risk of input.rawRisks) {
    if (risk.severity === 'critical') riskPenalties += 25;
    else if (risk.severity === 'high') riskPenalties += 15;
    else if (risk.severity === 'medium') riskPenalties += 8;
  }

  // Aggregate Total Score (0 - 100)
  const basePositive = identityScore + domainSecurityScore + socialPresenceScore + reputationScore + businessPracticeScore;
  const totalScore = Math.max(5, Math.min(100, Math.round(basePositive - riskPenalties)));

  let riskLevel: RiskLevel;
  if (totalScore >= 75) {
    riskLevel = 'Low Risk';
  } else if (totalScore >= 45) {
    riskLevel = 'Medium Risk';
  } else {
    riskLevel = 'High Risk';
  }

  // Deduplicate signals by title
  const seenPositives = new Set<string>();
  const uniquePositives = positiveSignals.filter(p => {
    if (seenPositives.has(p.title)) return false;
    seenPositives.add(p.title);
    return true;
  });

  const seenWarnings = new Set<string>();
  const uniqueWarnings = warnings.filter(w => {
    if (seenWarnings.has(w.title)) return false;
    seenWarnings.add(w.title);
    return true;
  });

  // Generate actionable recommendation
  const recommendation = generateRecommendation(riskLevel, input.category, uniqueWarnings);

  const breakdown: TrustScoreBreakdown = {
    identityScore: Math.min(25, identityScore),
    domainSecurityScore: Math.min(20, domainSecurityScore),
    socialPresenceScore: Math.min(20, socialPresenceScore),
    reputationScore: Math.min(20, reputationScore),
    businessPracticeScore: Math.min(15, businessPracticeScore),
    riskPenalties,
    totalScore,
    riskLevel,
  };

  return {
    breakdown,
    positiveSignals: uniquePositives,
    warnings: uniqueWarnings,
    recommendation,
  };
}

function generateRecommendation(
  riskLevel: RiskLevel,
  category: InvestigationCategory,
  warnings: RiskSignal[],
): string {
  if (riskLevel === 'Low Risk') {
    return 'Appears legitimate with verified business identity and consistent contact channels. Continue normal caution.';
  }

  if (riskLevel === 'Medium Risk') {
    const hasContactIssue = warnings.some(w => w.category === 'Contact' || w.category === 'Identity');
    if (hasContactIssue) {
      return 'Proceed with elevated caution. Company footprint is real but contact or ownership details are incomplete. Do not transmit sensitive documents or unverified payments.';
    }
    return 'Exercise caution. Limited independent track record observed. Verify credentials directly with the organization before committing.';
  }

  // High Risk
  if (category === 'job_internship') {
    return 'HIGH RISK OF EMPLOYMENT FRAUD. Do NOT pay any upfront equipment, training, or application fees. Legitimate employers never conduct official onboarding solely through unverified chat apps (Telegram/WhatsApp).';
  }
  if (category === 'ecommerce') {
    return 'HIGH RISK OF FINANCIAL LOSS. Indicators suggest a deceptive storefront with fake discounts and unverified payment handling. Avoid entering credit card or payment details.';
  }
  if (category === 'scholarship') {
    return 'HIGH RISK OF SCHOLARSHIP PHISHING. Legitimate academic grants and scholarships never charge mandatory application fees or demand sensitive banking info upfront.';
  }

  return 'HIGH RISK DETECTED. Strong indicators of scam, impersonation, or deceptive practices. Avoid sharing credentials, personal information, or making financial transactions.';
}
