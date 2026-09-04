#include "osterdops/circuit_breaker.hpp"

namespace osterdops {

CircuitBreaker::CircuitBreaker(const CircuitBreakerConfig& config)
    : config_(config) {}

bool CircuitBreaker::allow_request(const std::string& provider) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto& p = providers_[provider];
    auto now = std::chrono::steady_clock::now();

    switch (p.state) {
        case CircuitState::Closed:
            return true;

        case CircuitState::Open: {
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - p.last_state_change).count();
            if (elapsed >= config_.reset_timeout_ms) {
                // Trip into half-open to probe recovery
                p.state = CircuitState::HalfOpen;
                p.half_open_successes = 0;
                p.last_state_change = now;
                return true;
            }
            return false;
        }

        case CircuitState::HalfOpen:
            // Allow canary traffic through
            return true;
    }
    return true;
}

void CircuitBreaker::record_success(const std::string& provider) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto& p = providers_[provider];
    auto now = std::chrono::steady_clock::now();

    if (p.state == CircuitState::HalfOpen) {
        p.half_open_successes++;
        if (p.half_open_successes >= config_.half_open_success_threshold) {
            p.state = CircuitState::Closed;
            p.consecutive_failures = 0;
            p.half_open_successes = 0;
            p.last_state_change = now;
        }
    } else if (p.state == CircuitState::Closed) {
        p.consecutive_failures = 0;
    }
}

void CircuitBreaker::record_failure(const std::string& provider) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto& p = providers_[provider];
    auto now = std::chrono::steady_clock::now();

    if (p.state == CircuitState::HalfOpen) {
        // Quick fail back to Open
        p.state = CircuitState::Open;
        p.last_state_change = now;
        p.half_open_successes = 0;
    } else if (p.state == CircuitState::Closed) {
        p.consecutive_failures++;
        if (p.consecutive_failures >= config_.failure_threshold) {
            p.state = CircuitState::Open;
            p.last_state_change = now;
        }
    }
}

CircuitState CircuitBreaker::get_state(const std::string& provider) const {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = providers_.find(provider);
    if (it == providers_.end()) return CircuitState::Closed;
    return it->second.state;
}

std::string CircuitBreaker::get_state_string(const std::string& provider) const {
    switch (get_state(provider)) {
        case CircuitState::Closed: return "CLOSED";
        case CircuitState::HalfOpen: return "HALF_OPEN";
        case CircuitState::Open: return "OPEN";
    }
    return "CLOSED";
}

} // namespace osterdops
