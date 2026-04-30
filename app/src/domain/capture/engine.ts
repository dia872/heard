// CaptureEngine — orchestrates the capture pipeline:
//   raw input → on-device transform → /resolve-url (if URL) → /extract
//   → confidence gate → caller decides to save/confirm/manual.
//
// On-device transcription (voice) and OCR (screenshot) happen *before*
// the engine sees the input — the engine only deals with text. Privacy
// invariant: audio bytes and image bytes never reach this layer.

import type {
  CaptureSource,
  ExtractResult,
  Confidence,
} from '../../types';
import type { GateAction } from '../confidence';
import { confidenceGate, gateAction } from '../confidence';
import type { ExtractClient } from './extractClient';
import type { UrlResolver } from './urlResolver';

export interface CaptureInput {
  source: CaptureSource;
  /**
   * For source='url': the pasted URL. The engine calls /resolve-url first.
   * For source='voice'|'paste'|'screenshot': the already-on-device text.
   */
  text: string;
  hints?: Record<string, string>;
}

export interface CaptureOutcome {
  result: ExtractResult;
  confidence: Confidence;
  action: GateAction;
  /**
   * URL-source captures retain the original URL alongside the extracted
   * text — InboxRepo persists it for "open original" actions.
   */
  sourceUrl?: string;
}

export interface CaptureEngineOptions {
  extract: ExtractClient;
  urlResolver: UrlResolver;
}

export class CaptureEngine {
  constructor(private readonly opts: CaptureEngineOptions) {}

  async run(input: CaptureInput): Promise<CaptureOutcome> {
    let textForExtraction = input.text;
    let sourceUrl: string | undefined;
    const hints = { ...(input.hints ?? {}) };

    if (input.source === 'url') {
      sourceUrl = input.text;
      const resolved = await this.opts.urlResolver.resolve({ url: input.text });
      textForExtraction = resolved.text;
      hints.sourceType = resolved.sourceType;
      Object.assign(hints, resolved.meta);
    }

    const result = await this.opts.extract.extract({
      text: textForExtraction,
      source: input.source,
      hints,
    });

    const confidence = confidenceGate(result);
    return {
      result: { ...result, confidence },
      confidence,
      action: gateAction(confidence),
      sourceUrl,
    };
  }
}
