/**
 * TrustLens Webcmd CLI Command Surface
 *
 * Exposes `webcmd trustlens` commands directly through Webcmd's native registry.
 */

import { cli, Strategy, type CommandArgs } from '../registry.js';
import { TrustLensInvestigator } from './investigator.js';
import { formatReportTerminal, formatReportMarkdown } from './report.js';
import { startTrustLensServer } from './server.js';
import { DEMO_SCENARIOS, buildScenarioReport } from './scenarios.js';

export const trustLensInvestigateCommand = cli({
  site: 'trustlens',
  name: 'investigate',
  access: 'read',
  strategy: Strategy.PUBLIC,
  browser: false,
  clientOwned: true,
  description: 'Autonomously investigate a website, job posting, e-commerce store, or scholarship for legitimacy and scam signals.',
  defaultFormat: 'table',
  example: 'webcmd trustlens investigate https://example.com --visible -f table',
  args: [
    { name: 'url', type: 'string', required: true, positional: true, help: 'Target URL to investigate' },
    { name: 'category', type: 'string', default: 'auto', help: 'Investigation category: auto, job_internship, ecommerce, startup_service, scholarship' },
    { name: 'visible', type: 'boolean', default: false, help: 'Launch an observable, visible browser window during investigation' },
  ],
  func: async (kwargs: CommandArgs) => {
    const url = String(kwargs.url);
    const category = String(kwargs.category || 'auto') as any;
    const visibleBrowser = kwargs.visible === true;

    const investigator = new TrustLensInvestigator({ category, visibleBrowser });
    const report = await investigator.investigate(url);

    // Return report object; table formatter in Webcmd will render or custom render
    return report;
  },
  renderMarkdown: data => {
    if (data && typeof data === 'object' && 'trustScore' in data) {
      return formatReportMarkdown(data as any);
    }
    return undefined;
  },
});

export const trustLensServeCommand = cli({
  site: 'trustlens',
  name: 'serve',
  access: 'read',
  strategy: Strategy.PUBLIC,
  browser: false,
  clientOwned: true,
  description: 'Launch the interactive TrustLens Web Investigation Dashboard on localhost.',
  example: 'webcmd trustlens serve --port 3000',
  args: [
    { name: 'port', type: 'int', default: 3000, help: 'Local HTTP port to bind dashboard' },
  ],
  func: async (kwargs: CommandArgs) => {
    const port = Number(kwargs.port ?? 3000);
    const { url } = await startTrustLensServer(port);
    console.log(`\n================================================================`);
    console.log(`  🔍 TrustLens Dashboard is running at: \x1b[36m${url}\x1b[0m`);
    console.log(`  Open this URL in your browser to test live investigations!`);
    console.log(`================================================================\n`);
    return { status: 'running', url, port };
  },
});

export const trustLensDemoCommand = cli({
  site: 'trustlens',
  name: 'demo',
  access: 'read',
  strategy: Strategy.PUBLIC,
  browser: false,
  clientOwned: true,
  description: 'Run automated demo scenarios for hackathon evaluation.',
  example: 'webcmd trustlens demo',
  args: [],
  func: async () => {
    console.log('\n================================================================');
    console.log('   RUNNING TRUSTLENS DEMO SUITE (4 HACKATHON SCENARIOS)');
    console.log('================================================================\n');

    const results = [];
    for (const scenario of DEMO_SCENARIOS) {
      console.log(`Testing: ${scenario.name} (${scenario.url})...`);
      const report = buildScenarioReport(scenario.id);
      console.log(`  Result: Trust Score = ${report.trustScore}/100 [${report.riskLevel}]`);
      console.log(`  Top Signal: ${report.positiveSignals[0]?.title || 'None'}`);
      console.log(`  Top Warning: ${report.warnings[0]?.title || 'None'}`);
      console.log('');
      results.push({
        scenario: scenario.name,
        targetProfile: scenario.targetProfile,
        trustScore: report.trustScore,
        riskLevel: report.riskLevel,
        recommendation: report.recommendation,
      });
    }

    return results;
  },
});

import { Command } from 'commander';
import { registerCommandToProgram } from '../commanderAdapter.js';
import { configureRootCommandSurface } from '../root-command-surface.js';
import { applyUnknownOptionContract } from '../command-surface.js';
import { handleProgramParseError } from '../cli-error-report.js';

export async function runTrustLensCommand(argv: string[]): Promise<void> {
  const program = configureRootCommandSurface(new Command('webcmd'))
    .option('--workspace <id>', 'Hosted workspace id/slug for the request');
  const trustlens = program.command('trustlens').description('TrustLens — See Beyond the Website | AI Web Investigator');
  registerCommandToProgram(trustlens, trustLensInvestigateCommand);
  registerCommandToProgram(trustlens, trustLensServeCommand);
  registerCommandToProgram(trustlens, trustLensDemoCommand);
  applyUnknownOptionContract(program);
  try {
    await program.parseAsync(argv, { from: 'user' });
  } catch (err) {
    handleProgramParseError(err);
  }
}
