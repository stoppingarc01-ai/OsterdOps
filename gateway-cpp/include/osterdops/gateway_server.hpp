#pragma once

#include "types.hpp"
#include "cost_engine.hpp"
#include "budget_manager.hpp"
#include "rate_limiter.hpp"
#include "circuit_breaker.hpp"
#include "upstream_client.hpp"
#include "telemetry.hpp"
#include <string>
#include <memory>
#include <atomic>
#include <unordered_set>

namespace osterdops {

struct ServerConfig {
    std::string host{"0.0.0.0"};
    int32_t port{8080};
    int32_t thread_pool_size{8};
    std::string config_file_path;
    bool enable_mock_fallback{true};
    std::unordered_set<std::string> valid_api_keys{"osterdops_live_demo_key", "sk-osterdops-default"};
};

class GatewayServer {
public:
    explicit GatewayServer(const ServerConfig& config = ServerConfig{});
    ~GatewayServer();

    bool start();
    void stop();
    bool is_running() const { return running_; }

    void add_api_key(const std::string& key);

private:
    ServerConfig config_;
    std::atomic<bool> running_{false};

    SlidingWindowRateLimiter rate_limiter_;
    CircuitBreaker circuit_breaker_;
    UpstreamClient upstream_client_;

    // PIMPL idiom to avoid leaking httplib header into the public interface
    struct Impl;
    std::unique_ptr<Impl> pimpl_;
};

} // namespace osterdops
