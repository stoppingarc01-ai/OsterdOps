/**
 * OsterdOps — Project Management Service Layer
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Project, ProjectStatus } from "@/types";

export interface CreateProjectParams {
  name: string;
  description?: string;
  spendLimitMonthly?: number;
}

export interface UpdateProjectParams {
  name?: string;
  description?: string;
  spendLimitMonthly?: number;
  status?: ProjectStatus;
}

/**
 * Creates a new Project under an Organization.
 */
export async function createProject(
  orgId: string,
  params: CreateProjectParams
): Promise<Project> {
  const db = getAdminFirestore();
  const projectRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc();

  const projectId = projectRef.id;
  const now = FieldValue.serverTimestamp();

  const projectData: Omit<Project, "id"> = {
    organizationId: orgId,
    name: params.name,
    description: params.description || "",
    status: "active",
    spendLimitMonthly: params.spendLimitMonthly,
    currentMonthSpend: 0,
    totalRequests: 0,
    totalTokens: 0,
    createdAt: now as unknown as string,
    updatedAt: now as unknown as string,
  };

  await projectRef.set(projectData);

  return {
    id: projectId,
    ...projectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lists all projects belonging to an Organization.
 */
export async function listProjects(
  orgId: string,
  includeArchived = false
): Promise<Project[]> {
  const db = getAdminFirestore();
  let query = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .orderBy("createdAt", "desc");

  if (!includeArchived) {
    query = query.where("status", "==", "active") as typeof query;
  }

  const snap = await query.get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
}

/**
 * Retrieves a single project by ID.
 */
export async function getProjectById(
  orgId: string,
  projectId: string
): Promise<Project | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId)
    .get();

  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

/**
 * Updates a project's details.
 */
export async function updateProject(
  orgId: string,
  projectId: string,
  updates: UpdateProjectParams
): Promise<Project | null> {
  const db = getAdminFirestore();
  const projectRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId);

  const snap = await projectRef.get();
  if (!snap.exists) return null;

  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (typeof updates.name === "string" && updates.name.trim()) {
    payload.name = updates.name.trim();
  }
  if (typeof updates.description === "string") {
    payload.description = updates.description.trim();
  }
  if (updates.spendLimitMonthly !== undefined) {
    payload.spendLimitMonthly = updates.spendLimitMonthly;
  }
  if (updates.status) {
    payload.status = updates.status;
  }

  await projectRef.update(payload);

  const updatedSnap = await projectRef.get();
  return { id: updatedSnap.id, ...updatedSnap.data() } as Project;
}

/**
 * Soft-archives a project.
 */
export async function archiveProject(
  orgId: string,
  projectId: string
): Promise<boolean> {
  const db = getAdminFirestore();
  const projectRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId);

  const snap = await projectRef.get();
  if (!snap.exists) return false;

  await projectRef.update({
    status: "archived",
    updatedAt: FieldValue.serverTimestamp(),
  });

  return true;
}
