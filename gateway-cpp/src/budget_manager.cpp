#include "osterdops/budget_manager.hpp"
#include <sstream>
#include <iomanip>

namespace osterdops {

BudgetManager& BudgetManager::instance() {
    static BudgetManager instance;
    return instance;
}

void BudgetManager::set_budget(const BudgetConfig& budget) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (!budget.project_id.empty()) {
        project_budgets_[budget.project_id] = budget;
    }
    if (!budget.organization_id.empty()) {
        org_budgets_[budget.organization_id] = budget;
    }
}

std::optional<BudgetConfig> BudgetManager::get_budget(const std::string& project_id) const {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = project_budgets_.find(project_id);
    if (it != project_budgets_.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::vector<BudgetConfig> BudgetManager::get_all_budgets() const {
    std::lock_guard<std::mutex> lock(mutex_);
    std::vector<BudgetConfig> result;
    result.reserve(project_budgets_.size() + org_budgets_.size());
    for (const auto& [_, b] : project_budgets_) {
        result.push_back(b);
    }
    return result;
}

BudgetPreflightResult BudgetManager::check_preflight(
    const std::string& organization_id,
    const std::string& project_id
) const {
    std::lock_guard<std::mutex> lock(mutex_);
    BudgetPreflightResult result;

    // First check project budget
    auto proj_it = project_budgets_.find(project_id);
    if (proj_it != project_budgets_.end() && proj_it->second.enabled) {
        const auto& b = proj_it->second;
        result.current_spend_usd = b.current_spend_usd;
        result.limit_usd = b.limit_usd;
        result.enforcement = b.enforcement;

        if (b.current_spend_usd >= b.limit_usd) {
            if (b.enforcement == EnforcementMode::Hard) {
                result.allowed = false;
                result.hard_limit_exceeded = true;
                std::ostringstream ss;
                ss << "Hard budget limit exceeded for project " << project_id
                   << ": current spend $" << std::fixed << std::setprecision(4) << b.current_spend_usd
                   << " exceeds limit of $" << std::fixed << std::setprecision(2) << b.limit_usd;
                result.reason = ss.str();
                return result;
            }
        }
    }

    // Then check organization budget
    auto org_it = org_budgets_.find(organization_id);
    if (org_it != org_budgets_.end() && org_it->second.enabled) {
        const auto& b = org_it->second;
        if (b.current_spend_usd >= b.limit_usd) {
            if (b.enforcement == EnforcementMode::Hard) {
                result.allowed = false;
                result.hard_limit_exceeded = true;
                std::ostringstream ss;
                ss << "Hard budget limit exceeded for organization " << organization_id
                   << ": current spend $" << std::fixed << std::setprecision(4) << b.current_spend_usd
                   << " exceeds limit of $" << std::fixed << std::setprecision(2) << b.limit_usd;
                result.reason = ss.str();
                return result;
            }
        }
    }

    result.allowed = true;
    return result;
}

std::vector<BudgetAlert> BudgetManager::record_spend(
    const std::string& organization_id,
    const std::string& project_id,
    double spend_usd
) {
    if (spend_usd <= 0.0) return {};

    std::lock_guard<std::mutex> lock(mutex_);
    std::vector<BudgetAlert> alerts;

    auto update_and_alert = [&](BudgetConfig& b) {
        double prev_spend = b.current_spend_usd;
        b.current_spend_usd += spend_usd;

        if (b.limit_usd <= 0.0) return;

        double prev_ratio = prev_spend / b.limit_usd;
        double new_ratio = b.current_spend_usd / b.limit_usd;

        for (double t : b.alert_thresholds) {
            if (prev_ratio < t && new_ratio >= t) {
                alerts.push_back({
                    b.id,
                    b.name,
                    t,
                    b.current_spend_usd,
                    b.limit_usd
                });
            }
        }
    };

    auto proj_it = project_budgets_.find(project_id);
    if (proj_it != project_budgets_.end()) {
        update_and_alert(proj_it->second);
    }

    auto org_it = org_budgets_.find(organization_id);
    if (org_it != org_budgets_.end()) {
        update_and_alert(org_it->second);
    }

    return alerts;
}

void BudgetManager::reset_spend(const std::string& budget_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    for (auto& [_, b] : project_budgets_) {
        if (b.id == budget_id) {
            b.current_spend_usd = 0.0;
        }
    }
    for (auto& [_, b] : org_budgets_) {
        if (b.id == budget_id) {
            b.current_spend_usd = 0.0;
        }
    }
}

} // namespace osterdops
