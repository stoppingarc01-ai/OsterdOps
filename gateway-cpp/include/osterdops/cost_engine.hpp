#pragma once

#include "types.hpp"
#include <string>
#include <unordered_map>
#include <optional>
#include <mutex>

namespace osterdops {

struct ModelPricing {
    std::string provider;
    std::string model;
    double input_per_million_usd{0.0};
    double output_per_million_usd{0.0};
    double cached_input_per_million_usd{0.0};
    double reasoning_per_million_usd{0.0};
    int64_t context_window{128000};
    bool supports_streaming{true};
};

struct CostResult {
    double input_cost_usd{0.0};
    double output_cost_usd{0.0};
    double cached_savings_usd{0.0};
    double reasoning_cost_usd{0.0};
    double total_cost_usd{0.0};
    bool pricing_known{false};
    std::string model;
    std::string provider;
};

class CostEngine {
public:
    static CostEngine& instance();

    void register_model(const ModelPricing& pricing);
    std::optional<ModelPricing> get_pricing(const std::string& model, const std::string& provider = "") const;

    CostResult calculate_cost(
        const std::string& model,
        const std::string& provider,
        int64_t input_tokens,
        int64_t output_tokens,
        int64_t cached_tokens = 0,
        int64_t reasoning_tokens = 0
    ) const;

    // Direct nanodollar arithmetic: 1 USD = 1,000,000,000 nanodollars
    static int64_t compute_nanodollars(int64_t tokens, double price_per_million_usd);
    static double nanodollars_to_usd(int64_t nanodollars);

private:
    CostEngine();
    void populate_default_registry();

    mutable std::mutex mutex_;
    std::unordered_map<std::string, ModelPricing> registry_;
};

} // namespace osterdops
