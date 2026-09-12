/**
 * TrustLens Fault-Tolerant Recovery Engine
 *
 * Implements automated self-healing mechanisms for real-world web investigations:
 * - Cookie consent & promo overlay dismissal
 * - Layout shift & stale element recovery
 * - Timeout mitigation with progressive retries
 * - Browser-to-HTTP fallback on severe anti-bot or network blocks
 */

import type { IPage } from '../types.js';
import { webFetch } from '../fetch/client.js';

export interface RecoveryAction {
  timestamp: string;
  type: 'popup_dismissal' | 'timeout_retry' | 'stale_element' | 'http_fallback';
  target: string;
  explanation: string;
  succeeded: boolean;
}

const COMMON_POPUP_SELECTORS = [
  // Cookie consent buttons
  'button#onetrust-accept-btn-handler',
  'button#accept-cookie-notification',
  'button:has-text("Accept All")',
  'button:has-text("Accept all")',
  'button:has-text("Accept Cookies")',
  'button:has-text("I Agree")',
  'button:has-text("Agree")',
  'button:has-text("Allow all")',
  // Close / Dismiss buttons on modal overlays
  '[aria-label="Close"]',
  '[aria-label="close"]',
  'button.close',
  'button.modal-close',
  'div.modal-close',
  '.popup-close',
  '.overlay-close',
  'button:has-text("Dismiss")',
  'button:has-text("No thanks")',
  'button:has-text("Maybe later")',
];

export class RecoveryEngine {
  private actions: RecoveryAction[] = [];

  getRecordedActions(): RecoveryAction[] {
    return [...this.actions];
  }

  getActionSummaries(): string[] {
    return this.actions.map(a => `[Recovery: ${a.type}] ${a.explanation}`);
  }

  /**
   * Automatically detect and close intrusive popups, banners, and overlays.
   */
  async dismissBlockingPopups(page: IPage): Promise<boolean> {
    let dismissedAny = false;

    // First try DOM-level evaluation to dismiss without throwing
    try {
      const dismissed = await page.evaluate(`
        (() => {
          let count = 0;
          // Look for prominent dialogs or fixed overlays
          const selectors = [
            '#onetrust-banner-sdk',
            '.cookie-banner',
            '.modal.show',
            '[role="dialog"]',
            '.promo-popup',
            '.newsletter-modal'
          ];
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
              const closeBtn = el.querySelector('button, [aria-label*="close" i], .close');
              if (closeBtn && typeof closeBtn.click === 'function') {
                closeBtn.click();
                count++;
              } else {
                el.remove();
                count++;
              }
            }
          }
          return count;
        })()
      `);

      if (typeof dismissed === 'number' && dismissed > 0) {
        dismissedAny = true;
        this.record({
          type: 'popup_dismissal',
          target: 'DOM Overlay / Cookie Banner',
          explanation: `Automatically removed ${dismissed} intrusive modal overlay(s) from viewport.`,
          succeeded: true,
        });
      }
    } catch {
      // Non-fatal
    }

    // Next, attempt clicks on common button selectors
    for (const selector of COMMON_POPUP_SELECTORS) {
      try {
        const hasElement = await page.evaluate(`Boolean(document.querySelector('${selector.replace(/'/g, "\\'")}'))`);
        if (hasElement) {
          await page.click(selector).catch(() => {});
          dismissedAny = true;
          this.record({
            type: 'popup_dismissal',
            target: selector,
            explanation: `Dismissed blocking dialog via selector: ${selector}`,
            succeeded: true,
          });
          break;
        }
      } catch {
        // Continue checking other candidates
      }
    }

    return dismissedAny;
  }

  /**
   * Safely navigate with progressive timeout fallback.
   */
  async resilientGoto(page: IPage, url: string, timeoutMs: number = 15000): Promise<{ ok: boolean; error?: string }> {
    try {
      await page.goto(url, { waitUntil: 'load', settleMs: 500 });
      await this.dismissBlockingPopups(page);
      return { ok: true };
    } catch (err: any) {
      this.record({
        type: 'timeout_retry',
        target: url,
        explanation: `Initial navigation timed out or encountered resistance (${err?.message || 'unknown'}). Retrying with 'none' wait state...`,
        succeeded: false,
      });

      try {
        // Fallback: commit only, don't wait for all subresources
        await page.goto(url, { waitUntil: 'none', settleMs: 1000 });
        await this.dismissBlockingPopups(page);
        this.record({
          type: 'timeout_retry',
          target: url,
          explanation: 'Secondary navigation completed successfully in commit mode.',
          succeeded: true,
        });
        return { ok: true };
      } catch (retryErr: any) {
        return { ok: false, error: retryErr?.message || String(retryErr) };
      }
    }
  }

  /**
   * Resilient fallback to HTTP fetch client when page loading is blocked or crashed.
   */
  async fetchFallbackHtml(url: string): Promise<string | null> {
    try {
      this.record({
        type: 'http_fallback',
        target: url,
        explanation: 'Engaging Webcmd fallback HTTP fetch engine to bypass browser blocking...',
        succeeded: true,
      });

      const result = await webFetch({
        url,
        timeoutSeconds: 15,
        maxChars: 100_000,
        allowPrivate: false,
        raw: true,
      });

      return result.content || null;
    } catch (err: any) {
      this.record({
        type: 'http_fallback',
        target: url,
        explanation: `Fallback HTTP fetch failed: ${err?.message || 'Network error'}`,
        succeeded: false,
      });
      return null;
    }
  }

  private record(action: Omit<RecoveryAction, 'timestamp'>) {
    this.actions.push({
      ...action,
      timestamp: new Date().toISOString(),
    });
  }
}
