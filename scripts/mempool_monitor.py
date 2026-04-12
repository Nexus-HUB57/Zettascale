#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ORE V5.7.2 - Monitor de Mempool & Broadcast Automático (Mainnet)
Este script monitora as taxas de prioridade e dispara transações HEX quando o alvo é atingido.
"""

import requests
import time
import sys

# ============================================================================
# CONFIGURAÇÕES SOBERANAS
# ============================================================================
LIMITE_TAXA = 20  # sat/vB (Taxa alvo para transmissão na Mainnet)
API_FEES = "https://mempool.space/api/v1/fees/recommended"
API_BROADCAST = "https://mempool.space/api/tx"

# Insira aqui as transações assinadas (HEX) prontas para a Mainnet
HEX_TRANSACOES = [
    # "01000000...", 
]

def check_mempool_and_broadcast():
    try:
        print(f"--- Iniciando Monitoramento Mempool: {time.ctime()} ---")
        
        # 1. Consulta taxas recomendadas
        response = requests.get(API_FEES, timeout=15)
        response.raise_for_status()
        fees = response.json()
        
        # hourFee representa a taxa para confirmação em ~1 hora (prioridade média/baixa)
        current_priority_fee = fees['hourFee'] 
        
        print(f"Taxa Atual (Hour): {current_priority_fee} sat/vB")
        print(f"Taxa Alvo (Limit): {LIMITE_TAXA} sat/vB")

        if current_priority_fee <= LIMITE_TAXA:
            if not HEX_TRANSACOES:
                print("⚠️ Nenhuma transação HEX configurada no script.")
                return

            print(f"🚀 Condição atingida! Iniciando transmissão de {len(HEX_TRANSACOES)} TXs...")
            for hex_data in HEX_TRANSACOES:
                # Transmite o HEX para a rede Bitcoin Mainnet
                broadcast_resp = requests.post(API_BROADCAST, data=hex_data, timeout=30)
                if broadcast_resp.status_code == 200:
                    print(f"✅ SUCESSO! TXID: {broadcast_resp.text}")
                else:
                    print(f"❌ ERRO ao transmitir: {broadcast_resp.status_code} - {broadcast_resp.text}")
        else:
            print("⏳ Taxas acima do limite. Abortando broadcast para economia de capital.")

    except Exception as e:
        print(f"🚨 FALHA CRÍTICA no monitor: {e}")

if __name__ == "__main__":
    check_mempool_and_broadcast()
