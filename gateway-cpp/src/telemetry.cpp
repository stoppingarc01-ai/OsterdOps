#include "osterdops/telemetry.hpp"

namespace osterdops {

TelemetryCollector& TelemetryCollector::instance() {
    static TelemetryCollector instance;
    return instance;
}

void TelemetryCollector::record(const TelemetryRecord& record) {
    std::lock_guard<std::mutex> lock(mutex_);

    metrics_.total_requests++;
    if (record.status == "success") {
        metrics_.successful_requests++;
    } else {
        metrics_.failed_requests++;
        if (record.error_code == "RATE_LIMITED") {
            metrics_.rate_limited_requests++;
        } else if (record.error_code == "BUDGET_EXCEEDED") {
            metrics_.budget_blocked_requests++;
        }
    }

    metrics_.total_input_tokens += record.usage.input_tokens;
    metrics_.total_output_tokens += record.usage.output_tokens;
    metrics_.total_cached_tokens += record.usage.cached_tokens;
    metrics_.total_spend_usd += record.cost_usd;

    // Moving average for latency
    if (metrics_.total_requests == 1) {
        metrics_.avg_latency_ms = static_cast<double>(record.duration_ms);
    } else {
        metrics_.avg_latency_ms = (metrics_.avg_latency_ms * (metrics_.total_requests - 1) + record.duration_ms) / metrics_.total_requests;
    }

    recent_records_.push_back(record);
    if (recent_records_.size() > MAX_RECENT_RECORDS) {
        recent_records_.pop_front();
    }
}

GatewayMetrics TelemetryCollector::get_metrics() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return metrics_;
}

std::vector<TelemetryRecord> TelemetryCollector::get_recent_records(size_t limit) const {
    std::lock_guard<std::mutex> lock(mutex_);
    size_t count = std::min(limit, recent_records_.size());
    std::vector<TelemetryRecord> result;
    result.reserve(count);

    auto start_it = recent_records_.rbegin();
    for (size_t i = 0; i < count && start_it != recent_records_.rend(); ++i, ++start_it) {
        result.push_back(*start_it);
    }

    return result;
}

} // namespace osterdops
