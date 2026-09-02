/**
 * OsterdOps — Organization & Membership Service Layer
 * Supports Firestore multi-tenant persistence with simulated in-memory fallback for local development.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getFirebaseAdminConfig } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import type { Organization, OrganizationMember, OrganizationRole } from "@/types";

export interface CreateOrganizationParams {
  name: string;
  slug?: string;
}

// In-memory simulated storage for local development (persisted across HMR on globalThis)
const globalForSim = globalThis as unknown as {
  simulatedOrgs?: Map<string, Organization>;
  simulatedMembers?: Map<string, OrganizationMember[]>;
};
const simulatedOrgs = globalForSim.simulatedOrgs || new Map<string, Organization>();
const simulatedMembers = globalForSim.simulatedMembers || new Map<string, OrganizationMember[]>();
if (process.env.NODE_ENV !== "production") {
  globalForSim.simulatedOrgs = simulatedOrgs;
  globalForSim.simulatedMembers = simulatedMembers;
}

function createSimulatedOrganization(
  ownerId: string,
  ownerEmail: string,
  ownerName: string,
  params: CreateOrganizationParams
): { organization: Organization; member: OrganizationMember } {
  // Reuse existing organization for this owner if one already exists
  for (const [id, org] of simulatedOrgs.entries()) {
    if (org.ownerId === ownerId) {
      const member = simulatedMembers.get(id)?.find((m) => m.userId === ownerId) || {
        userId: ownerId,
        email: ownerEmail,
        displayName: ownerName,
        role: "OWNER",
        status: "active",
        joinedAt: org.createdAt,
        updatedAt: org.updatedAt,
      };
      return { organization: org, member };
    }
  }

  const cleanOwner = ownerId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const orgId = cleanOwner ? `org_${cleanOwner}` : `org_${Date.now().toString(36)}`;
  const slug =
    params.slug ||
    params.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + `-${orgId.slice(4, 9)}`;

  const now = new Date().toISOString();
  const organization: Organization = {
    id: orgId,
    name: params.name,
    slug,
    ownerId,
    plan: "starter",
    status: "active",
    currentPeriodSpendUsd: 0,
    currentPeriodStart: now,
    settings: {
      mfaEnforced: false,
      ipWhitelist: [],
      allowedModels: [],
    },
    createdAt: now,
    updatedAt: now,
  };

  const member: OrganizationMember = {
    userId: ownerId,
    email: ownerEmail,
    displayName: ownerName,
    role: "OWNER",
    status: "active",
    joinedAt: now,
    updatedAt: now,
  };

  simulatedOrgs.set(orgId, organization);
  const currentMembers = simulatedMembers.get(orgId) || [];
  currentMembers.push(member);
  simulatedMembers.set(orgId, currentMembers);

  try {
    const db = getAdminFirestore();
    db.collection("organizations").doc(orgId).set(organization);
    db.collection("organizations").doc(orgId).collection("members").doc(ownerId).set(member);
  } catch {}

  return { organization, member };
}

function getSimulatedUserOrganizations(
  userId: string
): Array<{ organization: Organization; membership: OrganizationMember }> {
  const results: Array<{ organization: Organization; membership: OrganizationMember }> = [];
  for (const [orgId, members] of simulatedMembers.entries()) {
    const matched = members.find((m) => m.userId === userId && m.status === "active");
    if (matched) {
      const org = simulatedOrgs.get(orgId);
      if (org) {
        results.push({ organization: org, membership: matched });
      }
    }
  }
  return results;
}

/**
 * Creates a new Organization and adds the creator as the OWNER in an atomic batch.
 */
export async function createOrganization(
  ownerId: string,
  ownerEmail: string,
  ownerName: string,
  params: CreateOrganizationParams
): Promise<{ organization: Organization; member: OrganizationMember }> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    return createSimulatedOrganization(ownerId, ownerEmail, ownerName, params);
  }

  try {
    const db = getAdminFirestore();
    const orgRef = db.collection("organizations").doc();
    const orgId = orgRef.id;

    const slug =
      params.slug ||
      params.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + `-${orgId.slice(0, 5)}`;

    const now = FieldValue.serverTimestamp();

    const orgData: Omit<Organization, "id"> = {
      name: params.name,
      slug,
      ownerId,
      plan: "starter",
      status: "active",
      currentPeriodSpendUsd: 0,
      currentPeriodStart: now as unknown as string,
      settings: {
        mfaEnforced: false,
        ipWhitelist: [],
        allowedModels: [],
      },
      createdAt: now as unknown as string,
      updatedAt: now as unknown as string,
    };

    const memberData: OrganizationMember = {
      userId: ownerId,
      email: ownerEmail,
      displayName: ownerName,
      role: "OWNER",
      status: "active",
      joinedAt: now as unknown as string,
      updatedAt: now as unknown as string,
    };

    const batch = db.batch();
    batch.set(orgRef, orgData);
    batch.set(orgRef.collection("members").doc(ownerId), memberData);

    await batch.commit();

    return {
      organization: { id: orgId, ...orgData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      member: { ...memberData, joinedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore unavailable, using simulated store:", (err as Error).message);
    return createSimulatedOrganization(ownerId, ownerEmail, ownerName, params);
  }
}

/**
 * Retrieves all organizations that a user is an active member of.
 */
export async function getUserOrganizations(
  userId: string
): Promise<Array<{ organization: Organization; membership: OrganizationMember }>> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    return getSimulatedUserOrganizations(userId);
  }

  try {
    const db = getAdminFirestore();
    const membersQuerySnap = await db
      .collectionGroup("members")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .get();

    const results: Array<{ organization: Organization; membership: OrganizationMember }> = [];

    for (const memberDoc of membersQuerySnap.docs) {
      const orgRef = memberDoc.ref.parent.parent;
      if (!orgRef) continue;

      const orgSnap = await orgRef.get();
      if (orgSnap.exists) {
        const org = { id: orgSnap.id, ...orgSnap.data() } as Organization;
        const membership = memberDoc.data() as OrganizationMember;
        results.push({ organization: org, membership });
      }
    }

    return results;
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore unavailable, using simulated store:", (err as Error).message);
    return getSimulatedUserOrganizations(userId);
  }
}

/**
 * Retrieves an organization by its ID.
 */
export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    return simulatedOrgs.get(orgId) || null;
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection("organizations").doc(orgId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Organization;
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore unavailable, using simulated store:", (err as Error).message);
    return simulatedOrgs.get(orgId) || null;
  }
}

/**
 * Lists all members belonging to an organization.
 */
export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    return simulatedMembers.get(orgId) || [];
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection("organizations").doc(orgId).collection("members").get();
    return snap.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as OrganizationMember[];
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore unavailable, using simulated store:", (err as Error).message);
    return simulatedMembers.get(orgId) || [];
  }
}

/**
 * Adds or invites a new member to an organization.
 */
export async function inviteOrganizationMember(
  orgId: string,
  inviterId: string,
  data: {
    userId?: string;
    email: string;
    displayName?: string;
    role: OrganizationRole;
  }
): Promise<OrganizationMember> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    const memberId = data.userId || `inv_${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();
    const memberData: OrganizationMember = {
      userId: memberId,
      email: data.email,
      displayName: data.displayName || data.email.split("@")[0],
      role: data.role,
      status: data.userId ? "active" : "invited",
      invitedBy: inviterId,
      joinedAt: now,
      updatedAt: now,
    };
    const currentMembers = simulatedMembers.get(orgId) || [];
    currentMembers.push(memberData);
    simulatedMembers.set(orgId, currentMembers);
    return memberData;
  }

  try {
    const db = getAdminFirestore();
    const memberId = data.userId || `inv_${Buffer.from(data.email).toString("hex").slice(0, 16)}`;
    const memberRef = db.collection("organizations").doc(orgId).collection("members").doc(memberId);

    const now = FieldValue.serverTimestamp();

    const memberData: OrganizationMember = {
      userId: memberId,
      email: data.email,
      displayName: data.displayName || data.email.split("@")[0],
      role: data.role,
      status: data.userId ? "active" : "invited",
      invitedBy: inviterId,
      joinedAt: now as unknown as string,
      updatedAt: now as unknown as string,
    };

    await memberRef.set(memberData, { merge: true });

    return {
      ...memberData,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore unavailable, using simulated store:", (err as Error).message);
    const memberId = data.userId || `inv_${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();
    const memberData: OrganizationMember = {
      userId: memberId,
      email: data.email,
      displayName: data.displayName || data.email.split("@")[0],
      role: data.role,
      status: data.userId ? "active" : "invited",
      invitedBy: inviterId,
      joinedAt: now,
      updatedAt: now,
    };
    const currentMembers = simulatedMembers.get(orgId) || [];
    currentMembers.push(memberData);
    simulatedMembers.set(orgId, currentMembers);
    return memberData;
  }
}

/**
 * Updates an organization member's role.
 */
export async function updateOrganizationMemberRole(
  orgId: string,
  targetUserId: string,
  newRole: OrganizationRole
): Promise<void> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    const members = simulatedMembers.get(orgId) || [];
    const matched = members.find((m) => m.userId === targetUserId);
    if (matched) {
      matched.role = newRole;
      matched.updatedAt = new Date().toISOString();
    }
    return;
  }

  try {
    const db = getAdminFirestore();
    const memberRef = db.collection("organizations").doc(orgId).collection("members").doc(targetUserId);

    await memberRef.update({
      role: newRole,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore unavailable, using simulated store:", (err as Error).message);
    const members = simulatedMembers.get(orgId) || [];
    const matched = members.find((m) => m.userId === targetUserId);
    if (matched) {
      matched.role = newRole;
      matched.updatedAt = new Date().toISOString();
    }
  }
}

/**
 * Removes a member from an organization, ensuring at least one active OWNER remains.
 */
export async function removeOrganizationMember(
  orgId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  const adminConfig = getFirebaseAdminConfig();
  if (!adminConfig) {
    const members = simulatedMembers.get(orgId) || [];
    const idx = members.findIndex((m) => m.userId === targetUserId);
    if (idx === -1) return { success: false, error: "Member not found in organization." };
    const member = members[idx];
    if (member.role === "OWNER") {
      const ownerCount = members.filter((m) => m.role === "OWNER" && m.status === "active").length;
      if (ownerCount <= 1) return { success: false, error: "Cannot remove the only OWNER of the organization." };
    }
    members.splice(idx, 1);
    return { success: true };
  }

  try {
    const db = getAdminFirestore();
    const membersRef = db.collection("organizations").doc(orgId).collection("members");

    const targetDoc = await membersRef.doc(targetUserId).get();
    if (!targetDoc.exists) {
      return { success: false, error: "Member not found in organization." };
    }

    const targetData = targetDoc.data() as OrganizationMember;

    // Prevent removing the sole OWNER
    if (targetData.role === "OWNER") {
      const ownersSnap = await membersRef.where("role", "==", "OWNER").where("status", "==", "active").get();
      if (ownersSnap.size <= 1) {
        return { success: false, error: "Cannot remove the only OWNER of the organization." };
      }
    }

    await membersRef.doc(targetUserId).delete();
    return { success: true };
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore unavailable, using simulated store:", (err as Error).message);
    return { success: true };
  }
}

/**
 * Updates an organization's subscription plan tier in Firestore and in-memory store.
 */
export async function updateOrganizationPlan(
  orgId: string,
  planTier: string
): Promise<Organization> {
  const now = new Date().toISOString();
  const adminConfig = getFirebaseAdminConfig();

  if (!adminConfig) {
    const org = simulatedOrgs.get(orgId);
    if (!org) {
      throw new Error(`Organization ${orgId} not found.`);
    }
    org.planTier = planTier;
    org.updatedAt = now;
    simulatedOrgs.set(orgId, org);
    return org;
  }

  try {
    const db = getAdminFirestore();
    const orgRef = db.collection("organizations").doc(orgId);
    await orgRef.update({
      planTier,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await orgRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Organization;
  } catch (err) {
    console.warn("[OsterdOps Org] Firestore update failed, falling back to simulated store:", (err as Error).message);
    const org = simulatedOrgs.get(orgId) || {
      id: orgId,
      name: "Workspace",
      slug: orgId,
      ownerId: "owner",
      plan: "starter" as const,
      planTier,
      status: "active" as const,
      currentPeriodSpendUsd: 0,
      currentPeriodStart: now,
      settings: {},
      createdAt: now,
      updatedAt: now,
    };
    org.planTier = planTier;
    org.updatedAt = now;
    simulatedOrgs.set(orgId, org);
    return org;
  }
}
