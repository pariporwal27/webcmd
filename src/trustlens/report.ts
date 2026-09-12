/**
 * TrustLens Report Generator
 *
 * Formats investigation reports into human-friendly terminal tables and Markdown documents.
 */

import Table from 'cli-table3';
import type { InvestigationReport } from './types.js';

export function formatReportTerminal(report: InvestigationReport): string {
  const lines: string[] = [];

  // Header Banner
  lines.push('');
  lines.push('================================================================================');
  lines.push('   TRUSTLENS — See Beyond the Website | AI Autonomous Web Investigator');
  lines.push('================================================================================');
  lines.push(`Target URL:  ${report.targetUrl}`);
  lines.push(`Category:    ${report.inferredCategory.toUpperCase()}`);
  lines.push(`Duration:    ${(report.durationMs / 1000).toFixed(2)}s`);
  lines.push(`Analyzed At: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('--------------------------------------------------------------------------------');

  // Trust Score Box
  const scoreBox = new Table({
    head: ['METRIC', 'ASSESSMENT', 'BENCHMARK'],
    colWidths: [22, 28, 26],
  });

  const riskColor = report.riskLevel === 'Low Risk' ? '\x1b[32m' : (report.riskLevel === 'Medium Risk' ? '\x1b[33m' : '\x1b[31m');
  const reset = '\x1b[0m';

  scoreBox.push(
    ['Trust Score', `${report.trustScore} / 100`, report.trustScore >= 75 ? 'Safe / Legitimate' : report.trustScore >= 45 ? 'Caution Advised' : 'High Risk Alert'],
    ['Risk Classification', `${riskColor}${report.riskLevel}${reset}`, report.riskLevel === 'Low Risk' ? 'Minimal Anomaly' : 'Action Required'],
    ['Identity & Legal', `${report.scoreBreakdown.identityScore} / 25 pts`, report.evidence.identity.companyName || 'Not Stated'],
    ['Domain & Security', `${report.scoreBreakdown.domainSecurityScore} / 20 pts`, report.evidence.identity.sslValid ? 'HTTPS Valid' : 'Insecure TLS'],
    ['Social & Footprint', `${report.scoreBreakdown.socialPresenceScore} / 20 pts`, `${report.evidence.social.platformsFound.length} Verified Channels`],
    ['Reputation & Reviews', `${report.scoreBreakdown.reputationScore} / 20 pts`, `${report.evidence.reputation.reviews.length} Sources Analyzed`],
    ['Business Policies', `${report.scoreBreakdown.businessPracticeScore} / 15 pts`, report.evidence.identity.hasPrivacyPolicy ? 'Disclosures Present' : 'Missing TOS/Privacy'],
    ['Risk Deductions', `-${report.scoreBreakdown.riskPenalties} pts`, `${report.warnings.length} Active Warnings`],
  );

  lines.push(scoreBox.toString());
  lines.push('');

  // Executive Recommendation
  lines.push('--------------------------------------------------------------------------------');
  lines.push('EXECUTIVE RECOMMENDATION:');
  lines.push(`  ${report.recommendation}`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push('');

  // Positive Signals
  lines.push('POSITIVE SIGNALS (✓):');
  if (report.positiveSignals.length === 0) {
    lines.push('  (None identified)');
  } else {
    for (const pos of report.positiveSignals) {
      lines.push(`  \x1b[32m✓\x1b[0m [${pos.category}] ${pos.title}: ${pos.detail}`);
    }
  }
  lines.push('');

  // Warnings / Red Flags
  lines.push('WARNINGS & RISK SIGNALS (⚠):');
  if (report.warnings.length === 0) {
    lines.push('  (Zero risk signals detected)');
  } else {
    for (const warn of report.warnings) {
      const icon = warn.severity === 'critical' ? '\x1b[31m[CRITICAL]\x1b[0m' : '\x1b[33m[WARNING]\x1b[0m';
      lines.push(`  ${icon} [${warn.category}] ${warn.title}: ${warn.detail}`);
    }
  }
  lines.push('');

  // Recovery Log Summary
  if (report.recoveryActions.length > 0) {
    lines.push('RECOVERY & RESILIENCE ACTIONS EXECUTED:');
    for (const rec of report.recoveryActions) {
      lines.push(`  \x1b[36m⚙\x1b[0m ${rec}`);
    }
    lines.push('');
  }

  lines.push('================================================================================');
  return lines.join('\n');
}

export function formatReportMarkdown(report: InvestigationReport): string {
  const lines: string[] = [];

  lines.push(`# TrustLens Investigation Report: ${report.evidence.identity.companyName || report.targetUrl}`);
  lines.push('');
  lines.push(`> **Tagline:** See Beyond the Website  `);
  lines.push(`> **Analyzed URL:** [${report.targetUrl}](${report.targetUrl})  `);
  lines.push(`> **Trust Score:** **${report.trustScore} / 100** (${report.riskLevel})  `);
  lines.push(`> **Date:** ${new Date(report.timestamp).toUTCString()}`);
  lines.push('');
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`**Recommendation:** ${report.recommendation}`);
  lines.push('');
  lines.push('### Score Breakdown');
  lines.push('');
  lines.push('| Dimension | Score | Max Points | Findings |');
  lines.push('|---|---|---|---|');
  lines.push(`| Identity & Transparency | ${report.scoreBreakdown.identityScore} | 25 | ${report.evidence.identity.companyName} |`);
  lines.push(`| Domain & Security | ${report.scoreBreakdown.domainSecurityScore} | 20 | SSL ${report.evidence.identity.sslValid ? 'Active' : 'Missing'} |`);
  lines.push(`| Social & External Footprint | ${report.scoreBreakdown.socialPresenceScore} | 20 | ${report.evidence.social.platformsFound.join(', ') || 'None'} |`);
  lines.push(`| Reputation & Reviews | ${report.scoreBreakdown.reputationScore} | 20 | ${report.evidence.reputation.reviews.length} review sources checked |`);
  lines.push(`| Business & Legal Practices | ${report.scoreBreakdown.businessPracticeScore} | 15 | Privacy/TOS: ${report.evidence.identity.hasPrivacyPolicy ? 'Yes' : 'No'} |`);
  lines.push(`| Risk Deductions | -${report.scoreBreakdown.riskPenalties} | - | ${report.warnings.length} penalty triggers |`);
  lines.push('');
  lines.push('## Positive Signals');
  lines.push('');
  for (const pos of report.positiveSignals) {
    lines.push(`- **✓ [${pos.category}] ${pos.title}**: ${pos.detail}`);
  }
  lines.push('');
  lines.push('## Warnings & Red Flags');
  lines.push('');
  for (const warn of report.warnings) {
    lines.push(`- **⚠ [${warn.severity.toUpperCase()}] ${warn.title}**: ${warn.detail}`);
  }
  lines.push('');
  lines.push('## Agent Investigation Trace');
  lines.push('');
  lines.push('| Time | Step | Action | Status | Detail |');
  lines.push('|---|---|---|---|---|');
  for (const log of report.logs) {
    lines.push(`| ${log.timestamp} | ${log.stepName} | \`${log.action}\` | ${log.status} | ${log.detail} |`);
  }
  lines.push('');

  return lines.join('\n');
}
