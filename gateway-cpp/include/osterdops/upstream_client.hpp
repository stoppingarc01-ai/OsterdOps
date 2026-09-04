#pragma once

#include "types.hpp"
#include <string>
#include <map>
#include <vector>
#include <functional>

namespace osterdops {

struct UpstreamConfig {
    std::string name;
    std::string base_url;
    std::string api_key;
    int32_t timeout_ms{30000};
    int32_t max_retries{3};
};

struct UpstreamResult {
    bool success{false};
    int32_t status_code{0};
    std::string body;
    std::string error_message;
    int64_t latency_ms{0};
    int32_t attempts{1};
};

class UpstreamClient {
public:
    UpstreamClient();

    void set_provider_config(const std::string& provider, const UpstreamConfig& config);
    std::optional<UpstreamConfig> get_provider_config(const std::string& provider) const;

    // Execute chat completion request against upstream provider
    UpstreamResult execute_chat(
        const std::string& provider,
        const std::string& model,
        const std::string& request_json,
        const std::map<std::string, std::string>& custom_headers = {}
    );

    // Stream chunk callback type
    using StreamChunkCallback = std::function<void(const std::string& chunk)>;

    // Stream chat completion
    UpstreamResult execute_chat_stream(
        const std::string& provider,
        const std::string& model,
        const std::string& request_json,
        StreamChunkCallback chunk_callback,
        const std::map<std::string, std::string>& custom_headers = {}
    );

    // Resolve provider from model name
    static std::string resolve_provider(const std::string& model);

private:
    std::map<std::string, UpstreamConfig> providers_;
};

} // namespace osterdops
