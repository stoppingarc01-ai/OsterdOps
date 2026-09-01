/**
 * OsterdOps — Notification Emitter Service
 * Dispatches internal notification events (in_app) and provides hooks for future webhooks/email.
 */

import type { NotificationPayload } from "./types";

export type NotificationListener = (payload: NotificationPayload) => void | Promise<void>;

const listeners: Set<NotificationListener> = new Set();

/**
 * Registers a notification listener.
 */
export function subscribeToNotifications(listener: NotificationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Emits a notification event to registered handlers.
 */
export async function emitNotification(payload: NotificationPayload): Promise<void> {
  const promises: Array<Promise<void> | void> = [];
  for (const listener of listeners) {
    try {
      promises.push(listener(payload));
    } catch (err) {
      console.error("[Notification Emitter] Listener execution failed:", err);
    }
  }
  await Promise.allSettled(promises);
}
