#pragma once

#include "types.hpp"
#include <string>
#include <vector>
#include <deque>
#include <mutex>
#include <chrono>
#include <cstdint>

namespace osterdops {

struct TelemetryRecord {
    std::string request_id;
    std::string organization_id;
    std::string project_id;
    std::string key_id;
    std::string provider;
    std::string model;
    int32_t http_status{200};
    int64_t duration_ms{0};
    GatewayTokenUsage usage;
    double cost_usd{0.0};
    bool cached{false};
    std::string status{"success"};
    std::string error_code;
    std::string timestamp;
};

struct GatewayMetrics {
    uint64_t total_requests{0};
    uint64_t successful_requests{0};
    uint64_t failed_requests{0};
    uint64_t rate_limited_requests{0};
    uint64_t budget_blocked_requests{0};
    uint64_t total_input_tokens{0};
    uint64_t total_output_tokens{0};
    uint64_t total_cached_tokens{0};
    double total_spend_usd{0.0};
    double total_savings_usd{0.0};
    double avg_latency_ms{0.0};
};

class TelemetryCollector {
public:
    static TelemetryCollector& instance();

    void record(const TelemetryRecord& record);
    GatewayMetrics get_metrics() const;
    std::vector<TelemetryRecord> get_recent_records(size_t limit = 50) const;

private:
    TelemetryCollector() = default;
    mutable std::mutex mutex_;
    GatewayMetrics metrics_;
    std::deque<TelemetryRecord> recent_records_;
    static constexpr size_t MAX_RECENT_RECORDS = 1000;
};

} // namespace osterdops
