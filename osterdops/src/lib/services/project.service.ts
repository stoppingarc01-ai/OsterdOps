/**
 * OsterdOps — Project Management Service Layer
 * Multi-tenant project lifecycle management, slug enforcement, and audit logging.
 */

import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { recordAuditLog } from "./audit.service";
import { slugify } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";

export { slugify };

export interface CreateProjectParams {
  name: string;
  slug?: string;
  description?: string;
  spendLimitMonthly?: number;
}

export interface UpdateProjectParams {
  name?: string;
  slug?: string;
  description?: string;
  spendLimitMonthly?: number;
  status?: ProjectStatus;
}

/**
 * Creates a new Project under an Organization.
 * Validates slug uniqueness within the target organization.
 */
export async function createProject(
  orgId: string,
  actorId: string,
  params: CreateProjectParams
): Promise<Project> {
  const db = getAdminFirestore();
  const trimmedName = params.name.trim();
  const baseSlug = params.slug ? slugify(params.slug) : slugify(trimmedName);
  const slug = baseSlug || `project-${Date.now().toString().slice(-4)}`;

  // 1. Check for duplicate slug in this organization
  const duplicateQuery = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (!duplicateQuery.empty) {
    const error = new Error(`A project with slug '${slug}' already exists in this organization.`);
    (error as unknown as { code: string }).code = "DUPLICATE_SLUG";
    throw error;
  }

  const projectRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc();

  const projectId = projectRef.id;
  const now = FieldValue.serverTimestamp();

  const projectData: Omit<Project, "id"> = {
    organizationId: orgId,
    name: trimmedName,
    slug,
    description: params.description?.trim() || "",
    status: "ACTIVE",
    createdBy: actorId,
    spendLimitMonthly: params.spendLimitMonthly,
    currentMonthSpend: 0,
    totalRequests: 0,
    totalTokens: 0,
    createdAt: now as unknown as string,
    updatedAt: now as unknown as string,
  };

  await projectRef.set(projectData);

  // 2. Emit immutable audit log
  await recordAuditLog({
    organizationId: orgId,
    actorId,
    action: "PROJECT_CREATED",
    resourceType: "project",
    resourceId: projectId,
    details: {
      name: trimmedName,
      slug,
      spendLimitMonthly: params.spendLimitMonthly,
    },
  });

  return {
    id: projectId,
    ...projectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lists all projects belonging to an Organization.
 * Filters for active projects unless includeArchived is explicitly true.
 */
export async function listProjects(
  orgId: string,
  includeArchived = false
): Promise<Project[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .orderBy("createdAt", "desc")
    .get();

  const allProjects = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];

  if (includeArchived) {
    return allProjects;
  }

  // Filter for active status (case-tolerant)
  return allProjects.filter((p) => {
    const s = String(p.status).toUpperCase();
    return s === "ACTIVE" || s === "";
  });
}

/**
 * Retrieves a single project by ID within an organization.
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
 * Finds a project by ID across allowed organizations (for caller authorization).
 */
export async function findProjectInAllowedOrgs(
  projectId: string,
  allowedOrgIds: string[]
): Promise<{ project: Project; orgId: string } | null> {
  const db = getAdminFirestore();

  for (const orgId of allowedOrgIds) {
    const snap = await db
      .collection("organizations")
      .doc(orgId)
      .collection("projects")
      .doc(projectId)
      .get();

    if (snap.exists) {
      return { project: { id: snap.id, ...snap.data() } as Project, orgId };
    }
  }

  return null;
}

/**
 * Retrieves a project by slug within an organization.
 */
export async function getProjectBySlug(
  orgId: string,
  slug: string
): Promise<Project | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Project;
}

/**
 * Updates a project's details, enforcing slug uniqueness if slug is modified.
 */
export async function updateProject(
  orgId: string,
  projectId: string,
  actorId: string,
  updates: UpdateProjectParams
): Promise<Project | null> {
  const db = getAdminFirestore();
  const projectRef = db
    .collection("organizations")
    .doc(orgId)
    .collection("projects")
    .doc(projectId);

  const existingSnap = await projectRef.get();
  if (!existingSnap.exists) return null;

  const existingData = existingSnap.data() as Project;
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (typeof updates.name === "string" && updates.name.trim()) {
    payload.name = updates.name.trim();
  }

  if (typeof updates.description === "string") {
    payload.description = updates.description.trim();
  }

  if (updates.slug && updates.slug.trim()) {
    const newSlug = slugify(updates.slug);
    if (newSlug !== existingData.slug) {
      // Check for collision with another project in the same organization
      const duplicateQuery = await db
        .collection("organizations")
        .doc(orgId)
        .collection("projects")
        .where("slug", "==", newSlug)
        .limit(1)
        .get();

      if (!duplicateQuery.empty && duplicateQuery.docs[0].id !== projectId) {
        const error = new Error(`A project with slug '${newSlug}' already exists in this organization.`);
        (error as unknown as { code: string }).code = "DUPLICATE_SLUG";
        throw error;
      }
      payload.slug = newSlug;
    }
  }

  if (updates.spendLimitMonthly !== undefined) {
    payload.spendLimitMonthly = updates.spendLimitMonthly;
  }

  if (updates.status) {
    const normalizedStatus = String(updates.status).toUpperCase();
    if (normalizedStatus === "ACTIVE" || normalizedStatus === "ARCHIVED") {
      payload.status = normalizedStatus;
    }
  }

  await projectRef.update(payload);

  // Emit audit log
  const isArchiving = payload.status === "ARCHIVED" && String(existingData.status).toUpperCase() !== "ARCHIVED";
  await recordAuditLog({
    organizationId: orgId,
    actorId,
    action: isArchiving ? "PROJECT_ARCHIVED" : "PROJECT_UPDATED",
    resourceType: "project",
    resourceId: projectId,
    details: {
      updates: payload,
    },
  });

  const updatedSnap = await projectRef.get();
  return { id: updatedSnap.id, ...updatedSnap.data() } as Project;
}

/**
 * Soft-archives a project.
 */
export async function archiveProject(
  orgId: string,
  projectId: string,
  actorId: string
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
    status: "ARCHIVED",
    updatedAt: FieldValue.serverTimestamp(),
  });

  await recordAuditLog({
    organizationId: orgId,
    actorId,
    action: "PROJECT_ARCHIVED",
    resourceType: "project",
    resourceId: projectId,
  });

  return true;
}
