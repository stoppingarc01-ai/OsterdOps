#include "osterdops/gateway_server.hpp"
#include "osterdops/json_helper.hpp"
#include "osterdops/cost_engine.hpp"
#include "osterdops/budget_manager.hpp"
#include "osterdops/telemetry.hpp"
#include "osterdops/rate_limiter.hpp"
#include "osterdops/circuit_breaker.hpp"

#include <iostream>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <thread>
#include <vector>
#include <algorithm>
#include <cstring>

#ifdef _WIN32
  #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
  #endif
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #pragma comment(lib, "ws2_32.lib")
  using socket_t = SOCKET;
  #define IS_VALID_SOCKET(s) ((s) != INVALID_SOCKET)
  #define CLOSE_SOCKET(s) closesocket(s)
#else
  #include <sys/types.h>
  #include <sys/socket.h>
  #include <netinet/in.h>
  #include <arpa/inet.h>
  #include <unistd.h>
  using socket_t = int;
  #define IS_VALID_SOCKET(s) ((s) >= 0)
  #define CLOSE_SOCKET(s) close(s)
#endif

namespace osterdops {

struct HttpRequest {
    std::string method;
    std::string path;
    std::map<std::string, std::string> headers;
    std::string body;

    std::string get_header(const std::string& key) const {
        for (const auto& [k, v] : headers) {
            std::string lower_k = k;
            std::transform(lower_k.begin(), lower_k.end(), lower_k.begin(), ::tolower);
            std::string lower_key = key;
            std::transform(lower_key.begin(), lower_key.end(), lower_key.begin(), ::tolower);
            if (lower_k == lower_key) return v;
        }
        return "";
    }
};

struct HttpResponse {
    int status_code{200};
    std::string status_message{"OK"};
    std::map<std::string, std::string> headers;
    std::string body;

    void set_header(const std::string& k, const std::string& v) {
        headers[k] = v;
    }

    std::string to_http_string() const {
        std::ostringstream ss;
        ss << "HTTP/1.1 " << status_code << " " << status_message << "\r\n";
        for (const auto& [k, v] : headers) {
            ss << k << ": " << v << "\r\n";
        }
        ss << "Content-Length: " << body.size() << "\r\n";
        ss << "Connection: close\r\n";
        ss << "\r\n";
        ss << body;
        return ss.str();
    }
};

struct GatewayServer::Impl {
    ServerConfig config;
    socket_t server_socket{static_cast<socket_t>(-1)};
    std::vector<std::thread> worker_threads;

    static HttpRequest parse_request(const std::string& raw) {
        HttpRequest req;
        std::istringstream stream(raw);
        std::string request_line;
        if (!std::getline(stream, request_line)) return req;

        // Strip \r
        if (!request_line.empty() && request_line.back() == '\r') {
            request_line.pop_back();
        }

        std::istringstream line_stream(request_line);
        line_stream >> req.method >> req.path;

        std::string header_line;
        size_t content_length = 0;
        while (std::getline(stream, header_line) && header_line != "\r" && !header_line.empty()) {
            if (header_line.back() == '\r') header_line.pop_back();
            size_t colon = header_line.find(':');
            if (colon != std::string::npos) {
                std::string k = header_line.substr(0, colon);
                std::string v = header_line.substr(colon + 1);
                // trim leading spaces
                size_t first = v.find_first_not_of(" \t");
                if (first != std::string::npos) v = v.substr(first);
                req.headers[k] = v;

                std::string lower_k = k;
                std::transform(lower_k.begin(), lower_k.end(), lower_k.begin(), ::tolower);
                if (lower_k == "content-length") {
                    try { content_length = std::stoul(v); } catch (...) {}
                }
            }
        }

        size_t header_end = raw.find("\r\n\r\n");
        if (header_end != std::string::npos) {
            req.body = raw.substr(header_end + 4);
            if (content_length > 0 && req.body.size() > content_length) {
                req.body = req.body.substr(0, content_length);
            }
        }

        return req;
    }
};

GatewayServer::GatewayServer(const ServerConfig& config)
    : config_(config),
      rate_limiter_(120, 60000),
      circuit_breaker_(),
      upstream_client_(),
      pimpl_(std::make_unique<Impl>()) {
    pimpl_->config = config;

    // Seed default sample budget ($50.00 hard limit)
    BudgetConfig default_proj_budget;
    default_proj_budget.id = "bgt_default_proj";
    default_proj_budget.name = "Engineering Default Budget";
    default_proj_budget.project_id = "proj_default";
    default_proj_budget.organization_id = "org_default";
    default_proj_budget.limit_usd = 50.00;
    default_proj_budget.enforcement = EnforcementMode::Hard;
    default_proj_budget.current_spend_usd = 0.00;
    default_proj_budget.enabled = true;
    default_proj_budget.alert_thresholds = {0.50, 0.75, 0.90, 1.00};
    BudgetManager::instance().set_budget(default_proj_budget);
}

GatewayServer::~GatewayServer() {
    stop();
}

void GatewayServer::add_api_key(const std::string& key) {
    config_.valid_api_keys.insert(key);
}

bool GatewayServer::start() {
#ifdef _WIN32
    WSADATA wsa_data;
    if (WSAStartup(MAKEWORD(2, 2), &wsa_data) != 0) {
        std::cerr << "[GatewayServer] Failed to initialize Winsock.\n";
        return false;
    }
#endif

    socket_t server_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (!IS_VALID_SOCKET(server_sock)) {
        std::cerr << "[GatewayServer] Failed to create socket.\n";
        return false;
    }

    int opt = 1;
#ifdef _WIN32
    setsockopt(server_sock, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
#else
    setsockopt(server_sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
#endif

    sockaddr_in server_addr{};
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(static_cast<uint16_t>(config_.port));

    if (bind(server_sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        std::cerr << "[GatewayServer] Failed to bind to port " << config_.port << "\n";
        CLOSE_SOCKET(server_sock);
        return false;
    }

    if (listen(server_sock, 128) < 0) {
        std::cerr << "[GatewayServer] Failed to listen on socket.\n";
        CLOSE_SOCKET(server_sock);
        return false;
    }

    pimpl_->server_socket = server_sock;
    running_ = true;

    std::cout << "[OsterdOps C++ Gateway] Server listening on http://"
              << config_.host << ":" << config_.port << "\n"
              << "[OsterdOps C++ Gateway] Worker threads: " << config_.thread_pool_size << "\n";

    // Main accept loop
    while (running_) {
        sockaddr_in client_addr{};
        socklen_t client_len = sizeof(client_addr);
        socket_t client_sock = accept(server_sock, (struct sockaddr*)&client_addr, &client_len);

        if (!IS_VALID_SOCKET(client_sock)) {
            if (!running_) break;
            continue;
        }

        // Handle connection in detached thread for low-latency concurrency
        std::thread([this, client_sock]() {
            char buffer[8192];
            int bytes_read = recv(client_sock, buffer, sizeof(buffer) - 1, 0);
            if (bytes_read > 0) {
                buffer[bytes_read] = '\0';
                HttpRequest req = Impl::parse_request(std::string(buffer, bytes_read));
                HttpResponse res;

                // Set Standard CORS Headers
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Authorization, Content-Type, x-osterdops-api-key, x-project-id, x-organization-id");

                if (req.method == "OPTIONS") {
                    res.status_code = 204;
                    res.status_message = "No Content";
                } else if (req.path == "/api/v1/health" || req.path == "/health") {
                    res.status_code = 200;
                    res.status_message = "OK";
                    res.set_header("Content-Type", "application/json");
                    res.body = "{\"status\":\"healthy\",\"service\":\"osterdops-gateway-cpp\",\"version\":\"1.0.0\"}";
                } else if (req.path == "/api/v1/ready") {
                    res.status_code = 200;
                    res.status_message = "OK";
                    res.set_header("Content-Type", "application/json");
                    res.body = "{\"ready\":true,\"active_providers\":[\"openai\",\"anthropic\",\"gemini\",\"deepseek\",\"ollama\"]}";
                } else if (req.path == "/api/v1/metrics" && req.method == "GET") {
                    auto m = TelemetryCollector::instance().get_metrics();
                    std::ostringstream ss;
                    ss << "{\n"
                       << "  \"total_requests\": " << m.total_requests << ",\n"
                       << "  \"successful_requests\": " << m.successful_requests << ",\n"
                       << "  \"failed_requests\": " << m.failed_requests << ",\n"
                       << "  \"rate_limited_requests\": " << m.rate_limited_requests << ",\n"
                       << "  \"budget_blocked_requests\": " << m.budget_blocked_requests << ",\n"
                       << "  \"total_input_tokens\": " << m.total_input_tokens << ",\n"
                       << "  \"total_output_tokens\": " << m.total_output_tokens << ",\n"
                       << "  \"total_cached_tokens\": " << m.total_cached_tokens << ",\n"
                       << "  \"total_spend_usd\": " << std::fixed << std::setprecision(6) << m.total_spend_usd << ",\n"
                       << "  \"total_savings_usd\": " << std::fixed << std::setprecision(6) << m.total_savings_usd << ",\n"
                       << "  \"avg_latency_ms\": " << std::fixed << std::setprecision(2) << m.avg_latency_ms << "\n"
                       << "}";
                    res.status_code = 200;
                    res.set_header("Content-Type", "application/json");
                    res.body = ss.str();
                } else if (req.path == "/api/v1/budgets" && req.method == "GET") {
                    auto budgets = BudgetManager::instance().get_all_budgets();
                    std::ostringstream ss;
                    ss << "[\n";
                    for (size_t i = 0; i < budgets.size(); ++i) {
                        const auto& b = budgets[i];
                        ss << "  {\n"
                           << "    \"id\": \"" << b.id << "\",\n"
                           << "    \"name\": \"" << b.name << "\",\n"
                           << "    \"project_id\": \"" << b.project_id << "\",\n"
                           << "    \"organization_id\": \"" << b.organization_id << "\",\n"
                           << "    \"limit_usd\": " << b.limit_usd << ",\n"
                           << "    \"current_spend_usd\": " << b.current_spend_usd << ",\n"
                           << "    \"enforcement\": \"" << (b.enforcement == EnforcementMode::Hard ? "HARD" : "SOFT") << "\",\n"
                           << "    \"enabled\": " << (b.enabled ? "true" : "false") << "\n"
                           << "  }" << (i + 1 < budgets.size() ? "," : "") << "\n";
                    }
                    ss << "]";
                    res.status_code = 200;
                    res.set_header("Content-Type", "application/json");
                    res.body = ss.str();
                } else if (req.path == "/api/v1/gateway/chat/completions" && req.method == "POST") {
                    auto start_tp = std::chrono::steady_clock::now();
                    std::string req_id = "gw_cpp_" + std::to_string(std::chrono::system_clock::now().time_since_epoch().count());
                    res.set_header("x-osterdops-request-id", req_id);

                    // 1. Authenticate API Key
                    std::string auth_header = req.get_header("authorization");
                    std::string api_key = req.get_header("x-osterdops-api-key");
                    if (api_key.empty() && auth_header.rfind("Bearer ", 0) == 0) {
                        api_key = auth_header.substr(7);
                    }

                    if (api_key.empty() || config_.valid_api_keys.find(api_key) == config_.valid_api_keys.end()) {
                        res.status_code = 401;
                        res.status_message = "Unauthorized";
                        res.set_header("Content-Type", "application/json");
                        res.body = "{\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid or missing OsterdOps API key.\"}}";

                        TelemetryRecord rec;
                        rec.request_id = req_id;
                        rec.http_status = 401;
                        rec.status = "error";
                        rec.error_code = "UNAUTHORIZED";
                        TelemetryCollector::instance().record(rec);

                        std::string resp_str = res.to_http_string();
                        send(client_sock, resp_str.c_str(), static_cast<int>(resp_str.size()), 0);
                        CLOSE_SOCKET(client_sock);
                        return;
                    }

                    // 2. Multi-tenant Context
                    std::string proj_id = req.get_header("x-project-id");
                    if (proj_id.empty()) proj_id = "proj_default";
                    std::string org_id = req.get_header("x-organization-id");
                    if (org_id.empty()) org_id = "org_default";

                    // 3. Sliding-window Rate Limiting
                    auto rl = rate_limiter_.check_and_consume(api_key);
                    res.set_header("x-ratelimit-remaining", std::to_string(rl.remaining));
                    res.set_header("x-ratelimit-reset", std::to_string(rl.reset_ms));

                    if (!rl.allowed) {
                        res.status_code = 429;
                        res.status_message = "Too Many Requests";
                        res.set_header("Content-Type", "application/json");
                        res.body = "{\"error\":{\"code\":\"RATE_LIMITED\",\"message\":\"Rate limit exceeded. Too many requests.\"}}";

                        TelemetryRecord rec;
                        rec.request_id = req_id;
                        rec.http_status = 429;
                        rec.status = "error";
                        rec.error_code = "RATE_LIMITED";
                        TelemetryCollector::instance().record(rec);

                        std::string resp_str = res.to_http_string();
                        send(client_sock, resp_str.c_str(), static_cast<int>(resp_str.size()), 0);
                        CLOSE_SOCKET(client_sock);
                        return;
                    }

                    // 4. Hard Budget Preflight Check
                    auto budget_chk = BudgetManager::instance().check_preflight(org_id, proj_id);
                    if (!budget_chk.allowed) {
                        res.status_code = 429;
                        res.status_message = "Too Many Requests";
                        res.set_header("Content-Type", "application/json");
                        res.body = "{\"error\":{\"code\":\"BUDGET_EXCEEDED\",\"message\":\"" +
                                   JsonHelper::escape_string(budget_chk.reason) + "\"}}";

                        TelemetryRecord rec;
                        rec.request_id = req_id;
                        rec.project_id = proj_id;
                        rec.organization_id = org_id;
                        rec.http_status = 429;
                        rec.status = "error";
                        rec.error_code = "BUDGET_EXCEEDED";
                        TelemetryCollector::instance().record(rec);

                        std::string resp_str = res.to_http_string();
                        send(client_sock, resp_str.c_str(), static_cast<int>(resp_str.size()), 0);
                        CLOSE_SOCKET(client_sock);
                        return;
                    }

                    // 5. Parse Model & Provider
                    std::string model = JsonHelper::extract_string(req.body, "model");
                    if (model.empty()) model = "gpt-4o";

                    std::string provider = JsonHelper::extract_string(req.body, "provider");
                    if (provider.empty()) {
                        provider = UpstreamClient::resolve_provider(model);
                    }

                    bool stream = JsonHelper::extract_bool(req.body, "stream", false);

                    // 6. Circuit Breaker Evaluation
                    if (!circuit_breaker_.allow_request(provider)) {
                        res.status_code = 503;
                        res.status_message = "Service Unavailable";
                        res.set_header("Content-Type", "application/json");
                        res.body = "{\"error\":{\"code\":\"CIRCUIT_BREAKER_OPEN\",\"message\":\"Provider circuit breaker is open for " + provider + "\"}}";

                        std::string resp_str = res.to_http_string();
                        send(client_sock, resp_str.c_str(), static_cast<int>(resp_str.size()), 0);
                        CLOSE_SOCKET(client_sock);
                        return;
                    }

                    // 7. Dispatch Upstream
                    if (stream) {
                        std::string sse_header = "HTTP/1.1 200 OK\r\n"
                                                 "Content-Type: text/event-stream\r\n"
                                                 "Cache-Control: no-cache\r\n"
                                                 "Connection: keep-alive\r\n"
                                                 "Access-Control-Allow-Origin: *\r\n"
                                                 "x-osterdops-request-id: " + req_id + "\r\n\r\n";
                        send(client_sock, sse_header.c_str(), static_cast<int>(sse_header.size()), 0);

                        upstream_client_.execute_chat_stream(provider, model, req.body, [client_sock](const std::string& chunk) {
                            send(client_sock, chunk.c_str(), static_cast<int>(chunk.size()), 0);
                        });

                        CLOSE_SOCKET(client_sock);
                        return;
                    } else {
                        auto upstream_res = upstream_client_.execute_chat(provider, model, req.body);
                        circuit_breaker_.record_success(provider);

                        // 8. Cost Calculation & Spend Tracking
                        int64_t prompt_tokens = JsonHelper::extract_int(upstream_res.body, "prompt_tokens", 25);
                        int64_t comp_tokens = JsonHelper::extract_int(upstream_res.body, "completion_tokens", 35);
                        auto cost = CostEngine::instance().calculate_cost(model, provider, prompt_tokens, comp_tokens);

                        // 9. Record Spend
                        BudgetManager::instance().record_spend(org_id, proj_id, cost.total_cost_usd);

                        auto end_tp = std::chrono::steady_clock::now();
                        int64_t latency = std::chrono::duration_cast<std::chrono::milliseconds>(end_tp - start_tp).count();

                        // 10. Record Telemetry
                        TelemetryRecord rec;
                        rec.request_id = req_id;
                        rec.organization_id = org_id;
                        rec.project_id = proj_id;
                        rec.key_id = api_key;
                        rec.provider = provider;
                        rec.model = model;
                        rec.http_status = 200;
                        rec.duration_ms = latency;
                        rec.usage.input_tokens = prompt_tokens;
                        rec.usage.output_tokens = comp_tokens;
                        rec.usage.total_tokens = prompt_tokens + comp_tokens;
                        rec.cost_usd = cost.total_cost_usd;
                        rec.status = "success";
                        TelemetryCollector::instance().record(rec);

                        res.status_code = 200;
                        res.set_header("Content-Type", "application/json");
                        res.set_header("x-osterdops-latency-ms", std::to_string(latency));

                        std::ostringstream cost_ss;
                        cost_ss << std::fixed << std::setprecision(6) << cost.total_cost_usd;
                        res.set_header("x-osterdops-cost-usd", cost_ss.str());

                        res.body = upstream_res.body;
                    }
                } else {
                    res.status_code = 404;
                    res.status_message = "Not Found";
                    res.set_header("Content-Type", "application/json");
                    res.body = "{\"error\":{\"code\":\"NOT_FOUND\",\"message\":\"Endpoint does not exist.\"}}";
                }

                std::string resp_str = res.to_http_string();
                send(client_sock, resp_str.c_str(), static_cast<int>(resp_str.size()), 0);
            }
            CLOSE_SOCKET(client_sock);
        }).detach();
    }

    return true;
}

void GatewayServer::stop() {
    running_ = false;
    if (pimpl_ && IS_VALID_SOCKET(pimpl_->server_socket)) {
        CLOSE_SOCKET(pimpl_->server_socket);
        pimpl_->server_socket = static_cast<socket_t>(-1);
    }
#ifdef _WIN32
    WSACleanup();
#endif
}

} // namespace osterdops
