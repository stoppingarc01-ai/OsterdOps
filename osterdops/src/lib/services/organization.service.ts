/**
 * OsterdOps — Organization & Membership Service Layer
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Organization, OrganizationMember, OrganizationRole } from "@/types";

export interface CreateOrganizationParams {
  name: string;
  slug?: string;
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
}

/**
 * Retrieves all organizations that a user is an active member of.
 */
export async function getUserOrganizations(
  userId: string
): Promise<Array<{ organization: Organization; membership: OrganizationMember }>> {
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
}

/**
 * Retrieves an organization by its ID.
 */
export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const db = getAdminFirestore();
  const snap = await db.collection("organizations").doc(orgId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Organization;
}

/**
 * Lists all members belonging to an organization.
 */
export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const db = getAdminFirestore();
  const snap = await db.collection("organizations").doc(orgId).collection("members").get();
  return snap.docs.map((doc) => ({
    userId: doc.id,
    ...doc.data(),
  })) as OrganizationMember[];
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
}

/**
 * Updates an organization member's role.
 */
export async function updateOrganizationMemberRole(
  orgId: string,
  targetUserId: string,
  newRole: OrganizationRole
): Promise<void> {
  const db = getAdminFirestore();
  const memberRef = db.collection("organizations").doc(orgId).collection("members").doc(targetUserId);

  await memberRef.update({
    role: newRole,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Removes a member from an organization, ensuring at least one active OWNER remains.
 */
export async function removeOrganizationMember(
  orgId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
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
}
