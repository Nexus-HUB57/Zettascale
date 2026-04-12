#!/bin/bash
# install_and_run_sweep.sh - ORE V5.6.1 Setup

echo "📦 Instalando dependências criptográficas..."
pip install bitcoinlib

if [ $? -eq 0 ]; then
    echo "✅ bitcoinlib instalada com sucesso."
    echo "🚀 Iniciando Sweep Real..."
    python3 scripts/sweep_to_cold_wallets.py
else
    echo "❌ Falha na instalação. Verifique seu ambiente Python."
fi
