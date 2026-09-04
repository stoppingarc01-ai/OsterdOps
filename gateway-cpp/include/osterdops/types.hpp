#pragma once

#include <string>
#include <vector>
#include <map>
#include <optional>
#include <cstdint>
#include <chrono>

namespace osterdops {

enum class Role {
    System,
    User,
    Assistant,
    Tool,
    Developer
};

inline std::string role_to_string(Role role) {
    switch (role) {
        case Role::System: return "system";
        case Role::User: return "user";
        case Role::Assistant: return "assistant";
        case Role::Tool: return "tool";
        case Role::Developer: return "developer";
    }
    return "user";
}

inline Role string_to_role(const std::string& str) {
    if (str == "system") return Role::System;
    if (str == "assistant") return Role::Assistant;
    if (str == "tool") return Role::Tool;
    if (str == "developer") return Role::Developer;
    return Role::User;
}

struct ChatMessage {
    Role role{Role::User};
    std::string content;
    std::string name;
};

struct GatewayRequestPayload {
    std::string provider;
    std::string model;
    std::vector<ChatMessage> messages;
    std::optional<double> temperature;
    std::optional<int32_t> max_tokens;
    std::optional<double> top_p;
    bool stream{false};
    std::string system;
    std::optional<double> frequency_penalty;
    std::optional<double> presence_penalty;
    std::vector<std::string> stop;
};

struct GatewayTokenUsage {
    int64_t input_tokens{0};
    int64_t output_tokens{0};
    int64_t total_tokens{0};
    int64_t cached_tokens{0};
    int64_t reasoning_tokens{0};
};

struct GatewayResponsePayload {
    std::string id;
    std::string provider;
    std::string model;
    ChatMessage output;
    GatewayTokenUsage usage;
    std::string finish_reason{"stop"};
    int64_t latency_ms{0};
};

struct GatewayRequestContext {
    std::string request_id;
    std::string organization_id;
    std::string project_id;
    std::string key_id;
    std::chrono::system_clock::time_point start_time;
};

enum class EnforcementMode {
    Soft,
    Hard
};

struct BudgetConfig {
    std::string id;
    std::string name;
    std::string organization_id;
    std::string project_id;
    double limit_usd{100.0};
    EnforcementMode enforcement{EnforcementMode::Hard};
    double current_spend_usd{0.0};
    bool enabled{true};
    std::vector<double> alert_thresholds{0.50, 0.75, 0.90, 1.00};
};

enum class CircuitState {
    Closed,
    HalfOpen,
    Open
};

} // namespace osterdops
