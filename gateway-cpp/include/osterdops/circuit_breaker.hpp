#pragma once

#include "types.hpp"
#include <string>
#include <unordered_map>
#include <chrono>
#include <mutex>
#include <cstdint>

namespace osterdops {

struct CircuitBreakerConfig {
    int32_t failure_threshold{5};
    int64_t reset_timeout_ms{30000}; // 30s open timeout
    int32_t half_open_success_threshold{2};
};

class CircuitBreaker {
public:
    explicit CircuitBreaker(const CircuitBreakerConfig& config = CircuitBreakerConfig{});

    bool allow_request(const std::string& provider);
    void record_success(const std::string& provider);
    void record_failure(const std::string& provider);
    CircuitState get_state(const std::string& provider) const;
    std::string get_state_string(const std::string& provider) const;

private:
    struct ProviderState {
        CircuitState state{CircuitState::Closed};
        int32_t consecutive_failures{0};
        int32_t half_open_successes{0};
        std::chrono::steady_clock::time_point last_state_change;
    };

    CircuitBreakerConfig config_;
    mutable std::mutex mutex_;
    std::unordered_map<std::string, ProviderState> providers_;
};

} // namespace osterdops
