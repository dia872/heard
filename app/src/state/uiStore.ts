// Transient UI state. Lives only in memory — no persistence layer.
// React Query handles server data; AsyncStorage handles guest persistence.
// This store is for things that exist only while the app is open:
// open modals, current capture step, mood selection, signup-explore context.

import { create } from 'zustand';

export type CaptureStep = 'menu' | 'voice' | 'paste' | 'screenshot' | 'url' | null;

export type Mood =
  | 'belly-laughs' | 'ugly-cry' | 'on-edge' | 'warm-fuzzy'
  | 'big-ideas' | 'adrenaline' | 'true-stuff' | 'kids-up';

export interface SignupCtx {
  streamerId: string;
  itemId?: number;
}

export interface UiState {
  // Capture flow
  showCapture: boolean;
  captureStep: CaptureStep;
  setShowCapture: (v: boolean) => void;
  setCaptureStep: (s: CaptureStep) => void;
  closeCapture: () => void;

  // Mood selection (Front screen → MoodScreen)
  activeMood: Mood | null;
  setActiveMood: (m: Mood | null) => void;

  // SignupExplore modal
  signupCtx: SignupCtx | null;
  openSignup: (ctx: SignupCtx) => void;
  closeSignup: () => void;

  // Sign-in soft-gate (re-prompt at most once per session)
  signInPromptedThisSession: boolean;
  markSignInPrompted: () => void;
  resetSignInPrompt: () => void; // call on session start (next launch)
}

export const useUiStore = create<UiState>((set) => ({
  showCapture: false,
  captureStep: null,
  setShowCapture: (v) => set({ showCapture: v, captureStep: v ? 'menu' : null }),
  setCaptureStep: (s) => set({ captureStep: s }),
  closeCapture: () => set({ showCapture: false, captureStep: null }),

  activeMood: null,
  setActiveMood: (m) => set({ activeMood: m }),

  signupCtx: null,
  openSignup: (ctx) => set({ signupCtx: ctx }),
  closeSignup: () => set({ signupCtx: null }),

  signInPromptedThisSession: false,
  markSignInPrompted: () => set({ signInPromptedThisSession: true }),
  resetSignInPrompt: () => set({ signInPromptedThisSession: false }),
}));
