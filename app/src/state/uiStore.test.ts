import { useUiStore } from './uiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    // Reset to initial state between tests.
    useUiStore.setState({
      showCapture: false,
      captureStep: null,
      activeMood: null,
      signupCtx: null,
      signInPromptedThisSession: false,
    });
  });

  describe('capture flow', () => {
    it('captureStep is null by default', () => {
      expect(useUiStore.getState().captureStep).toBeNull();
      expect(useUiStore.getState().showCapture).toBe(false);
    });

    it('setShowCapture(true) lands on the menu step', () => {
      useUiStore.getState().setShowCapture(true);
      expect(useUiStore.getState().showCapture).toBe(true);
      expect(useUiStore.getState().captureStep).toBe('menu');
    });

    it('closeCapture resets both flag and step', () => {
      useUiStore.getState().setShowCapture(true);
      useUiStore.getState().setCaptureStep('voice');
      useUiStore.getState().closeCapture();
      expect(useUiStore.getState().showCapture).toBe(false);
      expect(useUiStore.getState().captureStep).toBeNull();
    });

    it('setCaptureStep can advance to a specific step', () => {
      useUiStore.getState().setShowCapture(true);
      useUiStore.getState().setCaptureStep('url');
      expect(useUiStore.getState().captureStep).toBe('url');
    });
  });

  describe('mood', () => {
    it('activeMood persists until cleared', () => {
      useUiStore.getState().setActiveMood('ugly-cry');
      expect(useUiStore.getState().activeMood).toBe('ugly-cry');
      useUiStore.getState().setActiveMood(null);
      expect(useUiStore.getState().activeMood).toBeNull();
    });
  });

  describe('signup-explore modal', () => {
    it('open and close round-trip', () => {
      useUiStore.getState().openSignup({ streamerId: 'netflix', itemId: 102 });
      expect(useUiStore.getState().signupCtx).toEqual({ streamerId: 'netflix', itemId: 102 });
      useUiStore.getState().closeSignup();
      expect(useUiStore.getState().signupCtx).toBeNull();
    });
  });

  describe('sign-in soft-gate', () => {
    it('starts unprompted, can be marked, can be reset', () => {
      expect(useUiStore.getState().signInPromptedThisSession).toBe(false);
      useUiStore.getState().markSignInPrompted();
      expect(useUiStore.getState().signInPromptedThisSession).toBe(true);
      useUiStore.getState().resetSignInPrompt();
      expect(useUiStore.getState().signInPromptedThisSession).toBe(false);
    });
  });
});
