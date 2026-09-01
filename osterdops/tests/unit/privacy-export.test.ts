/**
 * OsterdOps — Phase 15: Privacy Data Export Unit Tests
 */

import { generatePrivacyExport } from "@/lib/security/privacy-export.service";

export async function testPrivacyExport() {
  const orgId = "org_exp_unit_test";
  const actorId = "usr_admin_1";

  const manifest = await generatePrivacyExport(orgId, actorId);

  if (!manifest.exportId || !manifest.checksum || manifest.organizationId !== orgId) {
    throw new Error("Privacy export manifest structure invalid.");
  }
  if (!manifest.data.organization || !Array.isArray(manifest.categories)) {
    throw new Error("Privacy export data fields missing.");
  }

  // Ensure zero secrets in exported data
  const serialized = JSON.stringify(manifest.data);
  const forbiddenSubstrings = ["sk-proj", "sk_live", "whsec_", "prompt", "Bearer"];
  for (const str of forbiddenSubstrings) {
    if (serialized.includes(str)) {
      throw new Error(`Privacy export contains forbidden secret or prompt string '${str}'.`);
    }
  }
}

export async function runPrivacyExportTests() {
  await testPrivacyExport();
}
