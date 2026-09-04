#pragma once

#include "types.hpp"
#include <string>
#include <unordered_map>
#include <vector>
#include <mutex>
#include <optional>

namespace osterdops {

struct BudgetPreflightResult {
    bool allowed{true};
    std::string reason;
    double current_spend_usd{0.0};
    double limit_usd{0.0};
    EnforcementMode enforcement{EnforcementMode::Soft};
    bool hard_limit_exceeded{false};
};

struct BudgetAlert {
    std::string budget_id;
    std::string budget_name;
    double threshold_ratio{0.0};
    double current_spend_usd{0.0};
    double limit_usd{0.0};
};

class BudgetManager {
public:
    static BudgetManager& instance();

    void set_budget(const BudgetConfig& budget);
    std::optional<BudgetConfig> get_budget(const std::string& project_id) const;
    std::vector<BudgetConfig> get_all_budgets() const;

    // Check if request is allowed before spending
    BudgetPreflightResult check_preflight(const std::string& organization_id, const std::string& project_id) const;

    // Record spend after request completion, returns alerts if thresholds were crossed
    std::vector<BudgetAlert> record_spend(
        const std::string& organization_id,
        const std::string& project_id,
        double spend_usd
    );

    void reset_spend(const std::string& budget_id);

private:
    BudgetManager() = default;
    mutable std::mutex mutex_;
    // Map project_id -> BudgetConfig
    std::unordered_map<std::string, BudgetConfig> project_budgets_;
    // Map org_id -> BudgetConfig
    std::unordered_map<std::string, BudgetConfig> org_budgets_;
};

} // namespace osterdops
