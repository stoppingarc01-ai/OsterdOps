/**
 * OsterdOps — Phase 15: Privacy Deletion Workflow Unit Tests
 */

import {
  createDeletionRequest,
  updateDeletionRequestStatus,
} from "@/lib/security/privacy-deletion.service";

export async function testPrivacyDeletionWorkflow() {
  const orgId = "org_del_unit_test";
  const requesterId = "usr_requester";
  const reviewerId = "usr_admin_reviewer";

  // 1. Initial creation
  const req = await createDeletionRequest(orgId, requesterId, "GDPR Article 17 Erasure");
  if (req.status !== "REVIEW_REQUIRED" || !req.id) {
    throw new Error("Initial deletion request state should be REVIEW_REQUIRED.");
  }
  if (!req.retainedCategories.includes("BILLING") || !req.retainedCategories.includes("AUDIT")) {
    throw new Error("Statutory billing and audit categories must be explicitly retained.");
  }

  // 2. Approval transition
  const approved = await updateDeletionRequestStatus(orgId, req.id, "APPROVED", reviewerId, "Verified identity and compliance scope.");
  if (approved.status !== "APPROVED" || approved.reviewedBy !== reviewerId) {
    throw new Error("Approval state transition failed.");
  }

  // 3. Execution transition
  const completed = await updateDeletionRequestStatus(orgId, req.id, "COMPLETED", reviewerId);
  if (completed.status !== "COMPLETED" || !completed.completedAt) {
    throw new Error("Completed state transition failed.");
  }
}

export async function runPrivacyDeletionTests() {
  await testPrivacyDeletionWorkflow();
}
