#include "osterdops/gateway_server.hpp"
#include <iostream>
#include <csignal>
#include <cstdlib>

static osterdops::GatewayServer* g_server = nullptr;

void handle_signal(int signal) {
    if (g_server) {
        std::cout << "\n[OsterdOps C++ Gateway] Received signal " << signal << ", shutting down gracefully...\n";
        g_server->stop();
    }
    std::exit(0);
}

void print_banner() {
    std::cout << R"(
================================================================================
   ____       _               _  ___             ____       _                         
  / __ \     | |             | |/ _ \           / ___|     | |                        
 | |  | | ___| |_ ___ _ __ __| | | | |_ __  ___| |    _ __ | |_ __ _ _____      ____ _
 | |  | |/ __| __/ _ \ '__/ _` | | | | '_ \/ __| |   | '_ \| __/ _` |_  \ \ /\ / / _` |
 | |__| |\__ \ ||  __/ | | (_| | |_| | |_) \__ \ |___| |_) | || (_| |/ / \ V  V / (_| |
  \____/ |___/\__\___|_|  \__,_|\___/| .__/|___/\____| .__/ \__\__,_/___|  \_/\_/ \__,_|
                                     | |             | |                              
                                     |_|             |_|                              
================================================================================
   OsterdOps AI Gateway — High-Performance C++ Microservice
   Sub-millisecond routing | Nanodollar Cost Engine | Hard Budget Caps | SSE Streaming
================================================================================
)" << std::endl;
}

int main(int argc, char* argv[]) {
    print_banner();

    osterdops::ServerConfig config;
    config.port = 8080;
    config.thread_pool_size = 8;
    config.valid_api_keys.insert("osterdops_live_demo_key");
    config.valid_api_keys.insert("sk-osterdops-default");

    // Command-line flag parsing
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--port" && i + 1 < argc) {
            config.port = std::stoi(argv[++i]);
        } else if (arg == "--threads" && i + 1 < argc) {
            config.thread_pool_size = std::stoi(argv[++i]);
        } else if (arg == "--key" && i + 1 < argc) {
            config.valid_api_keys.insert(argv[++i]);
        } else if (arg == "--help" || arg == "-h") {
            std::cout << "Usage: osterdops_gateway [options]\n"
                      << "Options:\n"
                      << "  --port <number>     Listening port (default: 8080)\n"
                      << "  --threads <number>  Worker threads (default: 8)\n"
                      << "  --key <api_key>     Register an allowed OsterdOps API key\n"
                      << "  --help, -h          Show help message\n";
            return 0;
        }
    }

    std::signal(SIGINT, handle_signal);
    std::signal(SIGTERM, handle_signal);

    osterdops::GatewayServer server(config);
    g_server = &server;

    std::cout << "[Config] Port: " << config.port << "\n"
              << "[Config] Default API Keys: 'osterdops_live_demo_key', 'sk-osterdops-default'\n"
              << "[Ready] Forwarding AI completion requests with full governance...\n\n";

    if (!server.start()) {
        std::cerr << "[Error] Gateway server terminated with errors.\n";
        return 1;
    }

    return 0;
}
