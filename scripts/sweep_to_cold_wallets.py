#!/usr/bin/env python3
"""
sweep_to_cold_wallets.py - ORE V5.6.1
Sweep real (não‑simulado) de todos os UTXOs de endereços de origem para os
30 endereços da Cold Wallet de Lucas Satoshi (Mainnet Bitcoin).
"""

import json
import time
import sys

try:
    from bitcoinlib.wallets import Wallet
    from bitcoinlib.keys import Key
except ImportError:
    print("Erro: A biblioteca 'bitcoinlib' não está instalada.")
    print("Execute: pip install bitcoinlib")
    sys.exit(1)

# ------------------------------------------------------------------------------
# CONFIGURAÇÕES GLOBAIS (MAINNET)
# ------------------------------------------------------------------------------
NETWORK = 'bitcoin'
FEE_PER_KB = 15000  # Zettascale Priority
MIN_CONFIRMS = 0    # Aceita UTXOs imediatos para exaustão burst

# 30 Endereços Soberanos - Lucas Satoshi Nakamoto (Sincronizados com treasury-constants.ts)
DESTINATION_ADDRESSES = [
    "bc1qzgnt5r3tpnc0tj8ssnkcpd3f7r", "bc1qkljvjlwltzdaw3y6fj8e7u3k4wf",
    "bc1qnxhnvwjvvv4wc3cmv8d7e22l4x", "bc1qy65yyrf0jgrd0cfz734vsxfq89",
    "bc1qst00pmtwjh7dhe34c35la5yfjq", "bc1qru49sv730wetwqw0k7p39894kj",
    "bc1qj03nzv4akh043tu9cm3wgmmzex", "bc1qvl6z0usf0dr7p6k4m5xz7z40m2",
    "bc1qny3srj3wu0573v6tx3z97dq7c3", "bc1q6pk9lh9udec40ltxeerx40l40s",
    "bc1qhtgk3r257aknud76h93ucfxqze", "bc1qlerz6wzz31yc6f6uj7lwl2f5cu",
    "bc1qseksdatpy3tq63kl37pxjg6ep6", "bc1qdnymdw6jz5hecs46eepwhtdxuv",
    "bc1q3a57wz8jzw9u3l8spx8flf49xv", "bc1qc0apxgfaeflut36mn666z36jfu",
    "bc1quvn6sksz7rzlqlew3knpnyx92k", "bc1qe52jls26z3dvk89lfmqhewz2g2",
    "bc1qjt5c93p8szz90k3r7sg5jpc5ex", "bc1qqkwav5xdla69v67mza0awt6azj",
    "bc1q9uy7qdwp1am972yhe8aqkqq9da", "bc1qqkthn8ujcrw4ne9pr9h75aslnn",
    "bc1q3zqs07h2hdekl4tuasl63xq9yk", "bc1qpv73jxnt77fr9m5e03xptdfee4d",
    "bc1qq73vrq7ygdrlcl5m9mqwuy2ank", "bc1qe220t2s6hl9d9fc0r2smw6qtc4",
    "bc1q84x04d82y429p5xvfx3v6jztnp", "bc1q96uaxql42j5hrkeh8ux6z4l2h6",
    "bc1qe3zhlsq3pg9upkfzrtt2f3zht3", "bc1q39fv38x0kuvsucj4kwhqyz2u8l"
]

# LISTA DE CHAVES PRIVADAS (WIF) DOS ENDEREÇOS DE ORIGEM
# Insira aqui as chaves WIF reais para o sweep definitivo.
SOURCE_PRIVATE_KEYS = [
    # "L...",
]

def sweep_private_key(wif_key, dest_addr):
    try:
        wallet_name = f"nexus_sweep_{int(time.time())}"
        key_obj = Key(wif_key, network=NETWORK)
        wallet = Wallet.create(wallet_name, keys=key_obj, network=NETWORK, witness_type='segwit')
        wallet.utxos_update()
        
        if not wallet.utxos():
            print(f"[!] Nenhum UTXO para {wif_key[:10]}...")
            return None
        
        tx = wallet.sweep(dest_addr, min_confirms=MIN_CONFIRMS, fee_per_kb=FEE_PER_KB)
        tx.send()
        return tx.txid
    except Exception as e:
        print(f"[✗] Erro: {str(e)}")
        return None

def main():
    print("="*80)
    print("🔁 NEXUS SWEEP REAL - 30 ENDEREÇOS DA COLD WALLET")
    print("📅 STATUS: MISSÃO ORE V5.6.1 - ARQUIVAMENTO DEFINITIVO")
    print("="*80)
    
    if not SOURCE_PRIVATE_KEYS:
        print("\n❌ ERRO: Nenhuma chave privada de origem (WIF) configurada.")
        print("   Edite 'scripts/sweep_to_cold_wallets.py' e insira as chaves reais.")
        sys.exit(1)
    
    results = []
    for idx, wif_key in enumerate(SOURCE_PRIVATE_KEYS):
        dest_addr = DESTINATION_ADDRESSES[idx] if idx < len(DESTINATION_ADDRESSES) else None
        if not dest_addr: break
        
        print(f"[{idx+1:02d}] Processando exaustão para {dest_addr[:20]}...")
        txid = sweep_private_key(wif_key, dest_addr)
        results.append({"dest": dest_addr, "txid": txid})
        time.sleep(1)
    
    print("\n" + "="*80)
    print("📋 RELATÓRIO DE EXAUSTÃO")
    print("="*80)
    for r in results:
        status = f"✅ TXID: {r['txid']}" if r['txid'] else "❌ FALHA"
        print(f"{r['dest'][:20]}... {status}")

if __name__ == "__main__":
    main()
