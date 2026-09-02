import { getDynamicCatalogModels } from "../src/lib/models/catalog";

const models = getDynamicCatalogModels();
console.log(`Total dynamic models: ${models.length}`);

const providerCounts: Record<string, number> = {};
for (const m of models) {
  providerCounts[m.provider] = (providerCounts[m.provider] || 0) + 1;
}

console.log("Provider breakdown:");
for (const [p, c] of Object.entries(providerCounts)) {
  console.log(`  ${p.padEnd(15)}: ${c} models`);
}

const deepseek = models.filter((m) => m.provider === "deepseek");
console.log(`DeepSeek models: ${deepseek.map((m) => m.id).join(", ")}`);

const xai = models.filter((m) => m.provider === "xai");
console.log(`xAI Grok models: ${xai.map((m) => m.id).join(", ")}`);

const perplexity = models.filter((m) => m.provider === "perplexity");
console.log(`Perplexity models: ${perplexity.map((m) => m.id).join(", ")}`);
