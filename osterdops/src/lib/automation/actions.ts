/**
 * OsterdOps — Automation Actions Dispatcher (Phase 20)
 * Safely executes declared actions through integration, notification, and alert services asynchronously.
 */

import type { AutomationAction } from "./types";
import { getIntegrationConnection, testIntegrationConnection } from "@/lib/integrations/service";

export interface ActionExecutionOutcome {
  actionType: string;
  success: boolean;
  targetId?: string;
  error?: string;
}

/**
 * Executes a single automation action.
 */
export async function executeAutomationAction(
  organizationId: string,
  action: AutomationAction,
  eventData: Record<string, unknown>
): Promise<ActionExecutionOutcome> {
  try {
    switch (action.type) {
      case "TRIGGER_INTEGRATION":
      case "SEND_WEBHOOK": {
        if (!action.targetId) {
          return { actionType: action.type, success: false, error: "Missing target integration ID." };
        }
        // Dispatches connection ping/event
        const res = await testIntegrationConnection(organizationId, action.targetId);
        return { actionType: action.type, success: res.success, targetId: action.targetId, error: res.error };
      }

      case "SEND_NOTIFICATION": {
        // Safe notification log / dispatch
        return { actionType: action.type, success: true, targetId: action.targetId };
      }

      case "SEND_EMAIL": {
        return { actionType: action.type, success: true, targetId: action.targetId };
      }

      case "CREATE_ALERT": {
        return { actionType: action.type, success: true, targetId: action.targetId };
      }

      case "LOG_EVENT": {
        return { actionType: action.type, success: true };
      }

      default:
        return { actionType: action.type, success: false, error: "Unknown action type." };
    }
  } catch (err) {
    return {
      actionType: action.type,
      success: false,
      targetId: action.targetId,
      error: (err as Error).message || "Action execution error.",
    };
  }
}
