/**
 * OsterdOps — /api/v1/keys
 * Gateway API Key Management Endpoint
 *
 * POST: Generates cryptographically secure, collision-proof API keys with 256-bit entropy.
 *       Plaintext secret is returned EXACTLY ONCE.
 * GET:  Lists masked API keys across the authenticated user's organization.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import {
  getUserOrganizations,
  createOrganization,
} from "@/lib/services/organization.service";
import { listProjects, createProject } from "@/lib/services/project.service";
import {
  createKey,
  listOrganizationApiKeys,
} from "@/lib/services/api-key.service";
import { checkCanCreateKey } from "@/lib/services/subscription";
import { extractOrGenerateRequestId } from "@/lib/observability/request-context";

export async function POST(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);

  try {
    // 1. Session / User Authentication Guard
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;

    // 2. Parse & Validate Payload
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Default key name if omitted or empty
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const name = rawName || `Default Production Key - ${Date.now()}`;

    // Permissions & Rate Limit validation
    const permissions = Array.isArray(body.permissions)
      ? body.permissions.filter((p: unknown) => typeof p === "string")
      : Array.isArray(body.scopes)
      ? body.scopes.filter((s: unknown) => typeof s === "string")
      : ["usage:ingest", "models:read"];

    const rateLimit =
      typeof body.rateLimit === "number" && body.rateLimit > 0
        ? body.rateLimit
        : undefined;

    const environment =
      body.environment === "staging" || body.environment === "test"
        ? body.environment
        : "production";

    // 3. Resolve Organization
    let orgId =
      typeof body.organizationId === "string" && body.organizationId.trim()
        ? body.organizationId.trim()
        : "";

    if (!orgId) {
      const userOrgs = await getUserOrganizations(user.uid);
      if (userOrgs.length > 0) {
        orgId = userOrgs[0].organization.id;
      } else {
        // Auto-provision personal organization if none exists
        const newOrg = await createOrganization(
          user.uid,
          user.email || `${user.uid}@osterdops.internal`,
          user.displayName || "Personal",
          { name: `${user.displayName || "Personal"}'s Workspace` }
        );
        orgId = newOrg.organization.id;
      }
    }

    // 4. Resolve Project
    let projectId =
      typeof body.projectId === "string" && body.projectId.trim()
        ? body.projectId.trim()
        : "";

    if (!projectId) {
      const projects = await listProjects(orgId);
      if (projects.length > 0) {
        projectId = projects[0].id;
      } else {
        const newProj = await createProject(orgId, user.uid, {
          name: "Production Gateway",
        });
        projectId = newProj.id;
      }
    }

    // 4b. Plan Entitlements: Count active keys & enforce tier quota
    const keyGate = await checkCanCreateKey(orgId);
    if (!keyGate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "KEY_LIMIT_REACHED",
          message: keyGate.message || "Free tier allows up to 3 keys. Upgrade to Pro for more.",
          activeKeys: keyGate.activeKeys,
          maxGatewayKeys: keyGate.maxGatewayKeys,
          tier: keyGate.tier,
          requestId,
        },
        {
          status: 403,
          headers: {
            "x-request-id": requestId,
            "content-type": "application/json",
          },
        }
      );
    }

    // 5. Generate Cryptographically Secure Collision-Proof Key
    const result = await createKey({
      orgId,
      projectId,
      userId: user.uid,
      name,
      permissions,
      scopes: permissions,
      rateLimit,
      environment,
      expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined,
    });

    // 6. Return HTTP 201 Created with single-reveal payload
    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.id,
          name: result.name,
          key: result.key, // Returned ONLY ONCE
          prefix: result.prefix,
          createdAt: result.createdAt,
        },
      },
      {
        status: 201,
        headers: {
          "x-request-id": requestId,
          "content-type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to issue Gateway API Key.";
    console.error(`[POST /api/v1/keys] Error [req:${requestId}]:`, err);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        requestId,
      },
      {
        status: 500,
        headers: {
          "x-request-id": requestId,
          "content-type": "application/json",
        },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  const requestId = extractOrGenerateRequestId(request.headers);

  try {
    const authResult = await requireAuth(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { user } = authResult;
    const searchParams = request.nextUrl.searchParams;

    let orgId = searchParams.get("organizationId") || "";
    if (!orgId) {
      const userOrgs = await getUserOrganizations(user.uid);
      if (userOrgs.length > 0) {
        orgId = userOrgs[0].organization.id;
      }
    }

    if (!orgId) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200, headers: { "x-request-id": requestId } }
      );
    }

    const keys = await listOrganizationApiKeys(orgId);

    // Format keys for client (safe masked representation)
    const formatted = keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix || k.keyPrefix,
      keyPrefix: k.keyPrefix || k.prefix,
      projectId: k.projectId,
      organizationId: k.organizationId || k.orgId,
      environment: k.environment,
      status: k.status,
      permissions: k.permissions || k.scopes || [],
      rateLimit: k.rateLimit,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formatted,
      },
      {
        status: 200,
        headers: {
          "x-request-id": requestId,
          "content-type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to retrieve API keys.";
    console.error(`[GET /api/v1/keys] Error [req:${requestId}]:`, err);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        requestId,
      },
      {
        status: 500,
        headers: {
          "x-request-id": requestId,
          "content-type": "application/json",
        },
      }
    );
  }
}
