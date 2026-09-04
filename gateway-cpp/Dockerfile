# ==============================================================================
# OsterdOps C++ AI Gateway — Multi-stage Lightweight Dockerfile
# ==============================================================================
FROM alpine:3.19 AS builder

RUN apk add --no-cache \
    build-base \
    cmake \
    git \
    linux-headers

WORKDIR /app
COPY . .

RUN mkdir -p build && cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release .. && \
    make -j$(nproc)

# ==============================================================================
# Production Runtime Stage
# ==============================================================================
FROM alpine:3.19 AS runner

RUN apk add --no-cache libstdc++ libgcc

WORKDIR /app
COPY --from=builder /app/build/osterdops_gateway /app/osterdops_gateway
COPY --from=builder /app/config /app/config

EXPOSE 8080

ENTRYPOINT ["/app/osterdops_gateway"]
CMD ["--port", "8080", "--threads", "8"]
