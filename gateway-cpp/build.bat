@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   OsterdOps C++ Gateway — Windows Build Script
echo ===================================================

where cl.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [Info] Found MSVC Compiler (cl.exe). Building with MSVC...
    if not exist build mkdir build
    cd build
    cmake .. -G "Visual Studio 17 2022" -A x64
    cmake --build . --config Release
    echo [Success] Binary compiled at build\Release\osterdops_gateway.exe
    cd ..
    goto :eof
)

where g++.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [Info] Found MinGW GCC Compiler (g++.exe). Building with g++...
    if not exist build mkdir build
    cd build
    g++ -std=c++17 -O3 -I../include ../src/*.cpp -lws2_32 -lpthread -o osterdops_gateway.exe
    if %errorlevel% equ 0 (
        echo [Success] Binary compiled at build\osterdops_gateway.exe
    ) else (
        echo [Error] Build failed.
    )
    cd ..
    goto :eof
)

where docker.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [Info] MSVC/GCC not in PATH. Building containerized with Docker...
    docker build -t osterdops-gateway-cpp .
    echo [Success] Docker image built: osterdops-gateway-cpp
    echo Run with: docker run -p 8080:8080 osterdops-gateway-cpp
    goto :eof
)

echo [Warning] No local C++ compiler (MSVC / MinGW) or Docker found in PATH.
echo To compile locally, please install Visual Studio (C++ Desktop Development) or MinGW-w64.
