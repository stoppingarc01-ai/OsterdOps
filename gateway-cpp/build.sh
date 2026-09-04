#!/usr/bin/env bash
set -e

echo "==================================================="
echo "   OsterdOps C++ Gateway — Linux/macOS Build"
echo "==================================================="

mkdir -p build
cd build

if command -v cmake >/dev/null 2>&1; then
    cmake -DCMAKE_BUILD_TYPE=Release ..
    make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
    echo "[Success] Binary compiled at build/osterdops_gateway"
    echo "Run with: ./build/osterdops_gateway --port 8080"
else
    g++ -std=c++17 -O3 -I../include ../src/*.cpp -lpthread -o osterdops_gateway
    echo "[Success] Direct compilation successful: build/osterdops_gateway"
fi
