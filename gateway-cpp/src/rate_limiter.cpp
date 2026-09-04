#include "osterdops/rate_limiter.hpp"
#include <algorithm>

namespace osterdops {

SlidingWindowRateLimiter::SlidingWindowRateLimiter(int64_t default_limit, int64_t window_ms)
    : default_limit_(default_limit), default_window_ms_(window_ms) {}

void SlidingWindowRateLimiter::set_default_limit(int64_t limit, int64_t window_ms) {
    std::lock_guard<std::mutex> lock(mutex_);
    default_limit_ = limit;
    default_window_ms_ = window_ms;
}

RateLimitResult SlidingWindowRateLimiter::check_and_consume(const std::string& key) {
    return check_and_consume(key, default_limit_, default_window_ms_);
}

RateLimitResult SlidingWindowRateLimiter::check_and_consume(
    const std::string& key,
    int64_t limit,
    int64_t window_ms
) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto now = Clock::now();
    auto window_duration = std::chrono::milliseconds(window_ms);
    auto cutoff = now - window_duration;

    auto& timestamps = request_windows_[key];

    // Remove expired entries
    while (!timestamps.empty() && timestamps.front() <= cutoff) {
        timestamps.pop_front();
    }

    RateLimitResult result;
    result.limit = limit;

    if (static_cast<int64_t>(timestamps.size()) >= limit) {
        result.allowed = false;
        result.remaining = 0;
        auto oldest = timestamps.front();
        auto reset_dur = std::chrono::duration_cast<std::chrono::milliseconds>((oldest + window_duration) - now);
        result.reset_ms = std::max<int64_t>(1, reset_dur.count());
        return result;
    }

    // Record this request
    timestamps.push_back(now);
    result.allowed = true;
    result.remaining = std::max<int64_t>(0, limit - static_cast<int64_t>(timestamps.size()));
    auto oldest = timestamps.front();
    auto reset_dur = std::chrono::duration_cast<std::chrono::milliseconds>((oldest + window_duration) - now);
    result.reset_ms = std::max<int64_t>(1, reset_dur.count());

    return result;
}

} // namespace osterdops
