import { Auth, RecaptchaVerifier } from "firebase/auth";

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

export interface RecaptchaOptions {
  size?: "invisible" | "normal" | "compact";
  onSolved?: () => void;
  onExpired?: () => void;
}

/**
 * Creates or resets an invisible/interactive RecaptchaVerifier instance cleanly.
 * Prevents container collisions and "RecaptchaVerifier already rendered" exceptions.
 */
export function getOrCreateRecaptchaVerifier(
  auth: Auth,
  containerId: string,
  options?: RecaptchaOptions
): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error("RecaptchaVerifier can only be initialized in browser environments.");
  }

  // Clear existing verifier if initialized
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // non-fatal
    }
    activeRecaptchaVerifier = null;
  }

  // Ensure DOM container is clean
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }

  activeRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: options?.size || "invisible",
    callback: () => {
      options?.onSolved?.();
    },
    "expired-callback": () => {
      options?.onExpired?.();
    },
  });

  return activeRecaptchaVerifier;
}

/**
 * Teardown active RecaptchaVerifier on component unmount
 */
export function clearRecaptchaVerifier(): void {
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // non-fatal
    }
    activeRecaptchaVerifier = null;
  }
}
