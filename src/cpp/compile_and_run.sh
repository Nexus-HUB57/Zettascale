#!/bin/bash
echo "=========================================="
echo "COMPILANDO ZETTASCALE EXHAUSTION CORE"
echo "=========================================="

sudo apt-get update
sudo apt-get install -y libcurl4-openssl-dev libssl-dev build-essential

g++ -std=c++17 \
    -O3 \
    -march=native \
    -pthread \
    -o zettascale_exhaustion \
    zettascale_exhaustion_core.cpp \
    -lcurl \
    -lssl \
    -lcrypto

echo "✅ Compilação concluída!"
./zettascale_exhaustion
