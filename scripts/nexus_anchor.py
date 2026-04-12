
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ORE V6.2.0 - Nexus State Anchor (OP_RETURN)
Imortaliza o hash do estado da Nexus na Mainnet Bitcoin.
Uso: python3 scripts/nexus_anchor.py
"""

import json
import os
import time
from hashlib import sha256
from bitcoinrpc.authproxy import AuthServiceProxy

# Configuração via Variáveis de Ambiente (PRODUÇÃO REAL)
RPC_USER = os.getenv("BTC_RPC_USER", "nexus_sovereign")
RPC_PASS = os.getenv("BTC_RPC_PASS", "benjamin_alpha_2026")
RPC_HOST = os.getenv("BTC_RPC_HOST", "127.0.0.1")
RPC_PORT = os.getenv("BTC_RPC_PORT", "8332")

class NexusAnchor:
    def __init__(self):
        self.rpc_url = f"http://{RPC_USER}:{RPC_PASS}@{RPC_HOST}:{RPC_PORT}"
        self.ledger_file = "docs/nexus_ledger.json"
        
        try:
            self.btc_rpc = AuthServiceProxy(self.rpc_url)
            # Verifica conexão
            self.btc_rpc.getblockchaininfo()
            print(f"✅ [ANCHOR] Conexão RPC estável com Bitcoin Core.")
        except Exception as e:
            print(f"❌ [FAULT] Falha na conexão RPC: {e}")
            self.btc_rpc = None

    def create_state_root(self, last_blocks_count=10):
        """Gera o hash do estado atual baseado no ledger persistente."""
        if not os.path.exists(self.ledger_file):
            return "0"*64
            
        with open(self.ledger_file, 'r') as f:
            chain = json.load(f)
            
        last_blocks = chain[-last_blocks_count:] if len(chain) > 0 else []
        state_string = json.dumps(last_blocks, sort_keys=True)
        return sha256(state_string.encode()).hexdigest()

    def anchor_to_bitcoin(self, nexus_state_hash):
        """Grava o Hash da Nexus na Mainnet via OP_RETURN."""
        if not self.btc_rpc:
            return "ERROR: RPC_OFFLINE"

        print(f"⚓ [SYNC] Preparando ancoragem do hash: {nexus_state_hash}")
        
        # Prefixo identificador para a Nexus (NXS) em Hexadecimal: 4e5853
        prefix = "4e5853" 
        data_hex = prefix + nexus_state_hash
        
        try:
            # 1. Cria a transação bruta com OP_RETURN
            raw_tx = self.btc_rpc.createrawtransaction([], {"data": data_hex})
            
            # 2. Fundeia a transação (taxas baseadas na mempool)
            funded_tx = self.btc_rpc.fundrawtransaction(raw_tx)
            
            # 3. Assina a transação
            signed_tx = self.btc_rpc.signrawtransactionwithwallet(funded_tx['hex'])
            
            # 4. Broadcast
            txid = self.btc_rpc.sendrawtransaction(signed_tx['hex'])
            
            return txid
            
        except Exception as e:
            return f"FAILED: {str(e)}"

if __name__ == "__main__":
    anchor_engine = NexusAnchor()
    state_hash = anchor_engine.create_state_root(10)
    
    if state_hash != "0"*64:
        result = anchor_engine.anchor_to_bitcoin(state_hash)
        print(f"📡 [RESULTADO]: {result}")
    else:
        print("⚠️ [SKIP] Ledger vazio. Nada para ancorar.")
