#include "osterdops/cost_engine.hpp"
#include <cmath>
#include <algorithm>

namespace osterdops {

static constexpr int64_t NANODOLLARS_PER_USD = 1000000000LL;

CostEngine& CostEngine::instance() {
    static CostEngine instance;
    return instance;
}

CostEngine::CostEngine() {
    populate_default_registry();
}

int64_t CostEngine::compute_nanodollars(int64_t tokens, double price_per_million_usd) {
    if (tokens <= 0 || price_per_million_usd <= 0.0) return 0;
    int64_t nano_rate = static_cast<int64_t>(std::round(price_per_million_usd * 1000.0));
    return tokens * nano_rate;
}

double CostEngine::nanodollars_to_usd(int64_t nanodollars) {
    return static_cast<double>(nanodollars) / static_cast<double>(NANODOLLARS_PER_USD);
}

void CostEngine::register_model(const ModelPricing& pricing) {
    std::lock_guard<std::mutex> lock(mutex_);
    registry_[pricing.model] = pricing;
}

std::optional<ModelPricing> CostEngine::get_pricing(const std::string& model, const std::string& /*provider*/) const {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = registry_.find(model);
    if (it != registry_.end()) {
        return it->second;
    }
    // Prefix lookup if version suffix exists (e.g. gpt-4o-2024-08-06 -> gpt-4o)
    for (const auto& [registered_model, pricing] : registry_) {
        if (model.rfind(registered_model, 0) == 0) {
            return pricing;
        }
    }
    return std::nullopt;
}

CostResult CostEngine::calculate_cost(
    const std::string& model,
    const std::string& provider,
    int64_t input_tokens,
    int64_t output_tokens,
    int64_t cached_tokens,
    int64_t reasoning_tokens
) const {
    CostResult result;
    result.model = model;
    result.provider = provider;

    auto pricing_opt = get_pricing(model, provider);
    if (!pricing_opt.has_value()) {
        result.pricing_known = false;
        return result;
    }

    result.pricing_known = true;
    const auto& pricing = pricing_opt.value();
    if (result.provider.empty()) {
        result.provider = pricing.provider;
    }

    int64_t safe_input = std::max<int64_t>(0, input_tokens);
    int64_t safe_output = std::max<int64_t>(0, output_tokens);
    int64_t safe_cached = std::clamp<int64_t>(cached_tokens, 0, safe_input);
    int64_t regular_input = safe_input - safe_cached;
    int64_t safe_reasoning = std::max<int64_t>(0, reasoning_tokens);

    // 1. Regular Input Cost
    int64_t regular_input_nano = compute_nanodollars(regular_input, pricing.input_per_million_usd);
    result.input_cost_usd = nanodollars_to_usd(regular_input_nano);

    // 2. Output Cost
    int64_t output_nano = compute_nanodollars(safe_output, pricing.output_per_million_usd);
    result.output_cost_usd = nanodollars_to_usd(output_nano);

    // 3. Cached Input Cost & Savings
    if (safe_cached > 0) {
        double cached_rate = pricing.cached_input_per_million_usd > 0.0
            ? pricing.cached_input_per_million_usd
            : pricing.input_per_million_usd * 0.5; // fallback 50% discount

        int64_t cached_nano = compute_nanodollars(safe_cached, cached_rate);
        int64_t uncashed_nano = compute_nanodollars(safe_cached, pricing.input_per_million_usd);
        result.cached_savings_usd = nanodollars_to_usd(uncashed_nano - cached_nano);
        result.input_cost_usd += nanodollars_to_usd(cached_nano);
    }

    // 4. Reasoning Token Cost (if tracked separately)
    if (safe_reasoning > 0 && pricing.reasoning_per_million_usd > 0.0) {
        int64_t reasoning_nano = compute_nanodollars(safe_reasoning, pricing.reasoning_per_million_usd);
        result.reasoning_cost_usd = nanodollars_to_usd(reasoning_nano);
    }

    result.total_cost_usd = result.input_cost_usd + result.output_cost_usd + result.reasoning_cost_usd;
    return result;
}

void CostEngine::populate_default_registry() {
    // OpenAI Models
    registry_["gpt-4o"] = {"openai", "gpt-4o", 2.50, 10.00, 1.25, 0.0, 128000, true};
    registry_["gpt-4o-mini"] = {"openai", "gpt-4o-mini", 0.15, 0.60, 0.075, 0.0, 128000, true};
    registry_["o1"] = {"openai", "o1", 15.00, 60.00, 7.50, 60.00, 200000, true};
    registry_["o3-mini"] = {"openai", "o3-mini", 1.10, 4.40, 0.55, 4.40, 200000, true};

    // Anthropic Models
    registry_["claude-3-5-sonnet-20241022"] = {"anthropic", "claude-3-5-sonnet-20241022", 3.00, 15.00, 0.30, 0.0, 200000, true};
    registry_["claude-3-5-sonnet"] = {"anthropic", "claude-3-5-sonnet", 3.00, 15.00, 0.30, 0.0, 200000, true};
    registry_["claude-3-5-haiku-20241022"] = {"anthropic", "claude-3-5-haiku-20241022", 0.80, 4.00, 0.08, 0.0, 200000, true};
    registry_["claude-3-5-haiku"] = {"anthropic", "claude-3-5-haiku", 0.80, 4.00, 0.08, 0.0, 200000, true};

    // Google Gemini Models
    registry_["gemini-1.5-pro"] = {"gemini", "gemini-1.5-pro", 1.25, 5.00, 0.3125, 0.0, 2000000, true};
    registry_["gemini-1.5-flash"] = {"gemini", "gemini-1.5-flash", 0.075, 0.30, 0.01875, 0.0, 1000000, true};
    registry_["gemini-2.0-flash-exp"] = {"gemini", "gemini-2.0-flash-exp", 0.10, 0.40, 0.025, 0.0, 1048576, true};

    // DeepSeek & Open Source
    registry_["deepseek-chat"] = {"deepseek", "deepseek-chat", 0.14, 0.28, 0.014, 0.0, 64000, true};
    registry_["deepseek-reasoner"] = {"deepseek", "deepseek-reasoner", 0.55, 2.19, 0.14, 2.19, 64000, true};
    registry_["llama-3.3-70b-versatile"] = {"meta", "llama-3.3-70b-versatile", 0.59, 0.79, 0.0, 0.0, 128000, true};
    registry_["mistral-large-latest"] = {"mistral", "mistral-large-latest", 2.00, 6.00, 0.0, 0.0, 128000, true};
}

} // namespace osterdops
