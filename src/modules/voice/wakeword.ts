/**
 * Wake-word module: PLACEHOLDER. NOT IMPLEMENTED in Phase 1.
 *
 * Why: Android 13 restricts microphone access from the background. Real
 * "Hey Jarvis" detection needs (a) an on-device keyword engine (e.g. Picovoice
 * Porcupine with a custom keyword) and (b) a foreground service with a visible
 * notification, which requires a native module / development build. That work
 * is planned for Phase 4. Until then the app uses the manual mic button.
 *
 * The interface below is what the rest of the app will depend on, so Phase 4
 * can drop in an implementation without touching the UI.
 */
export interface WakeWordEngine {
  readonly supported: boolean;
  start(onDetected: () => void): Promise<void>;
  stop(): Promise<void>;
}

export const wakeWordEngine: WakeWordEngine = {
  supported: false,
  async start() {
    throw new Error('Wake word is not implemented yet');
  },
  async stop() {
    /* nothing to stop */
  },
};
