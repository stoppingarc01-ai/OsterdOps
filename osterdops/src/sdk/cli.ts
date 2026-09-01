/**
 * OsterdOps Lightweight Developer CLI Foundation
 * Provides command-line developer utilities for querying projects, usage, costs, and diagnostics.
 */

import { OsterdOpsClient } from "./client";

export async function runCli(args: string[]): Promise<number> {
  const command = args[0] || "help";
  const subcommand = args[1];

  const client = new OsterdOpsClient();

  try {
    switch (command) {
      case "projects": {
        if (!subcommand || subcommand === "list") {
          const projects = await client.projects.list();
          console.log(`\nOsterdOps Projects (${projects.length}):`);
          console.log("------------------------------------------------------------");
          for (const p of projects) {
            console.log(`• ${p.name} (id: ${p.id}, slug: ${p.slug}, status: ${p.status})`);
          }
          console.log("");
          return 0;
        }
        break;
      }

      case "usage": {
        const usage = await client.usage.get();
        console.log("\nOsterdOps Usage Summary:");
        console.log("------------------------------------------------------------");
        console.log(`Total Requests: ${usage.totalRequests.toLocaleString()}`);
        console.log(`Total Tokens:   ${usage.totalTokens.toLocaleString()}`);
        console.log(`  - Input:      ${usage.inputTokens.toLocaleString()}`);
        console.log(`  - Output:     ${usage.outputTokens.toLocaleString()}`);
        console.log(`  - Cached:     ${usage.cachedTokens.toLocaleString()}`);
        console.log(`Total Cost:     $${(usage.totalCostUsd || 0).toFixed(4)} USD\n`);
        return 0;
      }

      case "costs": {
        const costs = await client.costs.get();
        console.log("\nOsterdOps Cost Breakdown:");
        console.log("------------------------------------------------------------");
        console.log(`Total Spend: $${(costs.totalCostUsd || 0).toFixed(4)} ${costs.currency}`);
        if (costs.breakdown && costs.breakdown.length > 0) {
          for (const item of costs.breakdown) {
            console.log(`  - ${item.provider} / ${item.model}: $${item.costUsd.toFixed(4)} (${item.requests} reqs)`);
          }
        }
        console.log("");
        return 0;
      }

      case "doctor": {
        console.log("\nRunning OsterdOps Developer Diagnostics...\n");
        const doc = await client.doctor();
        for (const [checkName, result] of Object.entries(doc.checks)) {
          const mark = result.pass ? "✔" : "✖";
          console.log(`${mark} ${checkName}: ${result.message}`);
        }
        console.log(doc.healthy ? "\n✔ System checks passed." : "\n✖ Some diagnostics failed.\n");
        return doc.healthy ? 0 : 1;
      }

      case "help":
      default: {
        console.log(`
OsterdOps Developer CLI

Usage:
  osterdops <command> [options]

Commands:
  projects [list]     List active organization projects
  usage               View aggregated usage and token metrics
  costs               View cost summaries and model spend
  doctor              Run developer diagnostics (API key, connectivity, budgets)
  help                Show help information

Environment:
  OSTERDOPS_API_KEY   Project API key (osk_live_...)
  OSTERDOPS_BASE_URL  Optional custom API endpoint
        `);
        return 0;
      }
    }
  } catch (err) {
    console.error(`\n✖ Error: ${(err as Error).message}\n`);
    return 1;
  }

  return 0;
}
