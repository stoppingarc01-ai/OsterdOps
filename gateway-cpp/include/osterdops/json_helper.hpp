#pragma once

#include <string>
#include <map>
#include <vector>
#include <sstream>
#include <iomanip>
#include <algorithm>

namespace osterdops {

/**
 * High-performance, zero-dependency JSON serialization & extraction helpers.
 */
class JsonHelper {
public:
    static std::string escape_string(const std::string& str) {
        std::ostringstream ss;
        for (char c : str) {
            switch (c) {
                case '"': ss << "\\\""; break;
                case '\\': ss << "\\\\"; break;
                case '\b': ss << "\\b"; break;
                case '\f': ss << "\\f"; break;
                case '\n': ss << "\\n"; break;
                case '\r': ss << "\\r"; break;
                case '\t': ss << "\\t"; break;
                default:
                    if (static_cast<unsigned char>(c) < 0x20) {
                        ss << "\\u" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(c);
                    } else {
                        ss << c;
                    }
            }
        }
        return ss.str();
    }

    static std::string extract_string(const std::string& json, const std::string& key) {
        std::string pattern = "\"" + key + "\"";
        size_t pos = json.find(pattern);
        if (pos == std::string::npos) return "";

        pos = json.find(':', pos);
        if (pos == std::string::npos) return "";

        pos = json.find('"', pos);
        if (pos == std::string::npos) return "";

        size_t start = pos + 1;
        size_t end = json.find('"', start);
        if (end == std::string::npos) return "";

        return json.substr(start, end - start);
    }

    static int64_t extract_int(const std::string& json, const std::string& key, int64_t default_val = 0) {
        std::string pattern = "\"" + key + "\"";
        size_t pos = json.find(pattern);
        if (pos == std::string::npos) return default_val;

        pos = json.find(':', pos);
        if (pos == std::string::npos) return default_val;

        pos = json.find_first_of("0123456789-", pos);
        if (pos == std::string::npos) return default_val;

        try {
            size_t idx = 0;
            return std::stoll(json.substr(pos), &idx);
        } catch (...) {
            return default_val;
        }
    }

    static double extract_double(const std::string& json, const std::string& key, double default_val = 0.0) {
        std::string pattern = "\"" + key + "\"";
        size_t pos = json.find(pattern);
        if (pos == std::string::npos) return default_val;

        pos = json.find(':', pos);
        if (pos == std::string::npos) return default_val;

        pos = json.find_first_of("0123456789-.", pos);
        if (pos == std::string::npos) return default_val;

        try {
            size_t idx = 0;
            return std::stod(json.substr(pos), &idx);
        } catch (...) {
            return default_val;
        }
    }

    static bool extract_bool(const std::string& json, const std::string& key, bool default_val = false) {
        std::string pattern = "\"" + key + "\"";
        size_t pos = json.find(pattern);
        if (pos == std::string::npos) return default_val;

        pos = json.find(':', pos);
        if (pos == std::string::npos) return default_val;

        size_t true_pos = json.find("true", pos);
        size_t false_pos = json.find("false", pos);
        size_t comma_pos = json.find_first_of(",}\n", pos);

        if (true_pos != std::string::npos && (comma_pos == std::string::npos || true_pos < comma_pos)) {
            return true;
        }
        if (false_pos != std::string::npos && (comma_pos == std::string::npos || false_pos < comma_pos)) {
            return false;
        }
        return default_val;
    }
};

} // namespace osterdops
