cmake_minimum_required(VERSION 3.16)
project(osterdops_gateway_cpp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Optimization flags
if(MSVC)
    add_compile_options(/W4 /O2 /EHsc /utf-8)
else()
    add_compile_options(-Wall -Wextra -O3 -pthread)
endif()

include_directories(include)

file(GLOB_RECURSE SOURCES "src/*.cpp")

add_executable(osterdops_gateway ${SOURCES})

# Windows socket library linking
if(WIN32)
    target_link_libraries(osterdops_gateway PRIVATE ws2_32)
endif()

# Threading support
find_package(Threads REQUIRED)
target_link_libraries(osterdops_gateway PRIVATE Threads::Threads)

# Installation targets
install(TARGETS osterdops_gateway DESTINATION bin)
