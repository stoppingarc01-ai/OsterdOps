#pragma once

#include <string>
#include <unordered_map>
#include <deque>
#include <chrono>
#include <mutex>
#include <cstdint>

namespace osterdops {

struct RateLimitResult {
    bool allowed{true};
    int64_t remaining{0};
    int64_t reset_ms{0};
    int64_t limit{0};
};

class SlidingWindowRateLimiter {
public:
    explicit SlidingWindowRateLimiter(int64_t default_limit = 120, int64_t window_ms = 60000);

    RateLimitResult check_and_consume(const std::string& key);
    RateLimitResult check_and_consume(const std::string& key, int64_t limit, int64_t window_ms);

    void set_default_limit(int64_t limit, int64_t window_ms);

private:
    using Clock = std::chrono::steady_clock;
    using TimePoint = Clock::time_point;

    int64_t default_limit_;
    int64_t default_window_ms_;

    mutable std::mutex mutex_;
    std::unordered_map<std::string, std::deque<TimePoint>> request_windows_;
};

} // namespace osterdops
