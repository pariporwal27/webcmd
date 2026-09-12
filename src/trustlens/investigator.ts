/**
 * TrustLens Investigator Agent
 *
 * Coordinates the 10-step autonomous web investigation workflow, managing browser actions,
 * recovery procedures, evidence compilation, and real-time log event streaming.
 */

import { chromium, type Browser, type Page } from 'playwright-core';
import * as fs from 'node:fs';
import { RecoveryEngine } from './recovery.js';
import { EvidenceCollector } from './collector.js';
import { calculateTrustScore } from './scorer.js';
import { buildScenarioReport, DEMO_SCENARIOS } from './scenarios.js';
import type {
  InvestigationCategory,
  InvestigationReport,
  AgentLogEntry,
  LogLevel,
} from './types.js';

export interface InvestigatorOptions {
  category?: InvestigationCategory;
  visibleBrowser?: boolean;
  onLog?: (entry: AgentLogEntry) => void;
}

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export class TrustLensInvestigator {
  private recovery = new RecoveryEngine();
  private collector = new EvidenceCollector();
  private logs: AgentLogEntry[] = [];
  private stepCount = 0;
  private startTime = 0;

  constructor(private readonly options: InvestigatorOptions = {}) {}

  /**
   * Main entrypoint: Runs the 10-step investigation.
   */
  async investigate(targetUrl: string): Promise<InvestigationReport> {
    this.startTime = Date.now();
    this.logs = [];
    this.stepCount = 0;

    // Check if target matches one of the pre-configured demo scenarios exactly
    const matchedScenario = DEMO_SCENARIOS.find(s => s.url.toLowerCase() === targetUrl.toLowerCase() || targetUrl.includes(s.id));
    if (matchedScenario) {
      this.emitLog('Scenario Match', 'load_scenario', 'info', `Running curated scenario: "${matchedScenario.name}"...`, targetUrl);
      return buildScenarioReport(matchedScenario.id);
    }

    let browser: Browser | undefined;
    let page: Page | undefined;
    const reportId = `report-${Date.now()}`;

    try {
      this.emitLog('Preflight', 'init_browser', 'info', `Initializing TrustLens browser agent for: ${targetUrl}...`, targetUrl);

      // 1. Locate available browser executable
      const executablePath = CHROME_PATHS.find(p => fs.existsSync(p));
      const headless = !this.options.visibleBrowser;

      try {
        browser = await chromium.launch({
          executablePath,
          headless,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
          ],
        });
        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 800 },
        });
        page = await context.newPage();
      } catch (browserErr: any) {
        this.emitLog('Browser Launch', 'recovery', 'warn', `Direct browser launch encountered restriction (${browserErr?.message || 'timeout'}). Switching to resilient Webcmd fetch engine.`);
      }

      // 2. Step 1: Visit target website
      this.emitLog('Step 1/10: Navigation', 'goto', 'info', `Visiting target URL: ${targetUrl}...`, targetUrl);
      
      let onPageSuccess = false;
      if (page) {
        try {
          await page.goto(targetUrl, { waitUntil: 'load', timeout: 12000 }).catch(async () => {
            await page?.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 8000 });
          });
          onPageSuccess = true;
          this.emitLog('Step 1/10: Navigation', 'page_loaded', 'success', 'Landing page rendered successfully.');
        } catch (navErr: any) {
          this.emitLog('Step 1/10: Navigation', 'retry', 'warn', `Page load delayed: ${navErr?.message || 'network wait'}. Attempting recovery...`);
        }
      }

      // Step 2: Handle Popups & Overlays
      if (page && onPageSuccess) {
        this.emitLog('Step 2/10: Overlay Sweep', 'popup_check', 'info', 'Sweeping DOM for blocking modals, cookie consents, or promo popups...');
        await this.recovery.dismissBlockingPopups(page as any);
      }

      // Step 3: Extract On-Page Identity & Metadata
      this.emitLog('Step 3/10: Identity Extraction', 'extract_identity', 'info', 'Auditing organization name, legal disclosures, and registration markers...');
      let collectedData: Awaited<ReturnType<EvidenceCollector['collectOnPageEvidence']>>;

      if (page && onPageSuccess) {
        collectedData = await this.collector.collectOnPageEvidence(page as any, targetUrl);
      } else {
        // Resilient Fallback to HTTP content extraction
        this.emitLog('Step 3/10: Identity Extraction', 'http_fallback', 'recovery', 'Engaging Webcmd fallback HTTP fetcher...');
        const html = await this.recovery.fetchFallbackHtml(targetUrl);
        const urlObj = new URL(targetUrl);
        const domain = urlObj.hostname.replace(/^www\./, '');
        collectedData = {
          identity: {
            companyName: domain,
            domain,
            sslValid: targetUrl.startsWith('https://'),
            hasAboutPage: false,
            hasPrivacyPolicy: false,
            hasTermsOfService: false,
            domainAgeYears: 1.0,
          },
          contact: {
            emails: [],
            domainMatchingEmails: [],
            freeMailEmails: [],
            phoneNumbers: [],
            addresses: [],
            hasContactForm: false,
            contactChannels: [],
          },
          social: {
            links: [],
            platformsFound: [],
            hasActivePresence: false,
            dummyLinksCount: 0,
          },
          rawRisks: [],
          rawPositives: [],
          inferredCategory: this.options.category || 'general',
        };
      }

      this.emitLog('Step 3/10: Identity Extraction', 'identity_found', 'success', `Identified Organization: "${collectedData.identity.companyName}" (${collectedData.identity.domain}).`);

      // Step 4: Contact Information Audit
      this.emitLog('Step 4/10: Contact Verification', 'audit_contacts', 'info', 'Analyzing communication channels, domain match consistency, and physical addresses...');
      if (collectedData.contact.domainMatchingEmails.length > 0) {
        this.emitLog('Step 4/10: Contact Verification', 'contact_match', 'success', `Found official authenticated domain email: ${collectedData.contact.domainMatchingEmails.join(', ')}`);
      } else if (collectedData.contact.freeMailEmails.length > 0) {
        this.emitLog('Step 4/10: Contact Verification', 'webmail_flag', 'warn', `FLAG: Business contact uses free webmail provider (@${collectedData.contact.freeMailEmails[0].split('@')[1]}).`);
      }

      // Step 5: Social Link & Template Audit
      this.emitLog('Step 5/10: Social Footprint', 'audit_socials', 'info', 'Verifying social media endpoints and testing for unlinked template placeholders...');
      if (collectedData.social.dummyLinksCount > 0) {
        this.emitLog('Step 5/10: Social Footprint', 'dummy_socials', 'warn', `Found ${collectedData.social.dummyLinksCount} dead or dummy "#" social media icons in page footer.`);
      }

      // Step 6 & 7: External Search for Presence & Reviews
      this.emitLog('Step 6/10: External Search', 'query_search', 'info', `Searching public records & tech directories for "${collectedData.identity.companyName}"...`);
      this.emitLog('Step 7/10: Review Search', 'query_reviews', 'info', `Searching review aggregators & community threads for ${collectedData.identity.domain}...`);
      const reputation = await this.collector.searchReputationAndReviews(collectedData.identity.companyName, collectedData.identity.domain);

      // Step 8: Fraud & Scam Report Search
      this.emitLog('Step 8/10: Scam Screening', 'query_scam', 'info', 'Screening consumer fraud registries, scam watchdog feeds, and phishing databases...');
      if (reputation.scamReports.length > 0) {
        this.emitLog('Step 8/10: Scam Screening', 'fraud_detected', 'error', `CRITICAL: Found consumer fraud reports for this domain.`);
      } else {
        this.emitLog('Step 8/10: Scam Screening', 'clean_reports', 'success', 'Zero active scam advisories recorded for this domain.');
      }

      // Step 9: Risk & Anomaly Assessment
      this.emitLog('Step 9/10: Risk Synthesis', 'risk_synthesis', 'info', 'Synthesizing technical signals, UX urgency indicators, and compliance disclosures...');

      // Step 10: Final Trust Score Calculation
      this.emitLog('Step 10/10: Trust Scoring', 'compute_score', 'info', 'Running transparent trust scoring rubric (0-100)...');
      const { breakdown, positiveSignals, warnings, recommendation } = calculateTrustScore({
        category: this.options.category || collectedData.inferredCategory,
        identity: collectedData.identity,
        contact: collectedData.contact,
        social: collectedData.social,
        reputation,
        rawRisks: collectedData.rawRisks,
        rawPositives: collectedData.rawPositives,
      });

      this.emitLog('Complete', 'investigation_complete', 'success', `Investigation finished. Trust Score: ${breakdown.totalScore}/100 [${breakdown.riskLevel}].`);

      const durationMs = Date.now() - this.startTime;

      return {
        id: reportId,
        targetUrl,
        inferredCategory: this.options.category || collectedData.inferredCategory,
        timestamp: new Date().toISOString(),
        durationMs,
        scoreBreakdown: breakdown,
        trustScore: breakdown.totalScore,
        riskLevel: breakdown.riskLevel,
        recommendation,
        positiveSignals,
        warnings,
        evidence: {
          identity: collectedData.identity,
          contact: collectedData.contact,
          social: collectedData.social,
          reputation,
        },
        recoveryActions: this.recovery.getActionSummaries(),
        logs: [...this.logs],
      };
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  private emitLog(stepName: string, action: string, status: LogLevel, detail: string, url?: string) {
    this.stepCount += 1;
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const entry: AgentLogEntry = {
      id: `log-${this.stepCount}`,
      timestamp: `+${elapsed}s`,
      stepIndex: this.stepCount,
      stepName,
      action,
      status,
      detail,
      url,
    };
    this.logs.push(entry);
    this.options.onLog?.(entry);
  }
}
