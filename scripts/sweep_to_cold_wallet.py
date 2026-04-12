#!/usr/bin/env python3
"""
sweep_to_cold_wallet.py - ORE V5.6.1
Sweep real de todos os UTXOs das fontes de origem para os 30 endereços da Cold Wallet.
Lê as chaves WIF de um arquivo JSON externo (source_wallets.json).
Taxa calibrada para 2 sat/vByte (2000 sat/kB).
"""

import time
import json
import os
from typing import List, Dict
try:
    from bitcoinlib.wallets import Wallet
    from bitcoinlib.keys import Key
    import requests
    from tqdm import tqdm
except ImportError:
    print("Erro: Dependências ausentes. Execute: pip install bitcoinlib requests tqdm")
    os._exit(1)

# =============================================================================
# CONFIGURAÇÕES
# =============================================================================
NETWORK = 'bitcoin'
FEE_PER_KB = 2000           # 2 sat/vByte (Otimização de rede)
MIN_CONFIRMS = 1
MAX_INPUTS_PER_TX = 100

# Caminho para o arquivo de segredos
SECRETS_FILE = "source_wallets.json"

# 30 endereços de destino (Cold Wallet de Lucas Satoshi)
DESTINATION_ADDRESSES = [
    "bc1qzqnt5r3tpnc0tj8ssnkcpd3f7r", "bc1qkljvjlwltzdaw3y6fj8e7u3k4wf",
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
    "bc1qe3zhlsq3pg9upkfzrtt2f3zht3", "bc1q39fv38x0kuvjw1ku6m2rpatsucyj4kwhqyz2u8l"
]

def sanitize_address(addr: str) -> str:
    return addr.replace(" ", "").strip()

def load_source_wallets(file_path: str) -> List[Dict]:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Arquivo de segredos não encontrado: {file_path}")
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data.get("wallets", [])

def get_utxos_from_address(address: str) -> List[Dict]:
    url = f"https://mempool.space/api/address/{address}/utxo"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    utxos = resp.json()
    if MIN_CONFIRMS > 0:
        utxos = [u for u in utxos if u.get('status', {}).get('confirmed', False)]
    return utxos

def create_sweep_transaction(wif_key: str, dest_address: str, utxos: List[Dict]) -> str:
    key_obj = Key(import_key=wif_key, network=NETWORK)
    wallet_name = f"nexus_sweep_{int(time.time())}_{key_obj.address()[:8]}"
    wallet = Wallet.create(
        wallet_name,
        keys=key_obj,
        network=NETWORK,
        witness_type='segwit' if dest_address.startswith('bc1') else 'legacy'
    )
    for utxo in utxos:
        wallet.utxos_add([
            utxo['txid'],
            utxo['vout'],
            utxo['value'],
            utxo.get('address', key_obj.address())
        ])
    tx = wallet.sweep(dest_address, min_confirms=MIN_CONFIRMS, fee_per_kb=FEE_PER_KB)
    tx.send()
    return tx.txid

def distribute_sweep(utxos: List[Dict], source_wif: str):
    for i in range(0, len(utxos), MAX_INPUTS_PER_TX):
        batch = utxos[i:i+MAX_INPUTS_PER_TX]
        dest = sanitize_address(DESTINATION_ADDRESSES[(i // MAX_INPUTS_PER_TX) % len(DESTINATION_ADDRESSES)])
        print(f"[*] Transação com {len(batch)} UTXOs → {dest[:20]}...")
        txid = create_sweep_transaction(source_wif, dest, batch)
        print(f"[✓] TXID: {txid}")
        time.sleep(2)

def main():
    print("="*80)
    print("🔁 NEXUS SWEEP REAL - ORE V5.6.1 - TRANSCENDÊNCIA NÍVEL 7")
    print(f"📅 {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("⚡ Modo: PRODUÇÃO REAL – EXAUSTÃO ZETTASCALE")
    print(f"💸 Taxa: {FEE_PER_KB/1000} sat/vByte")
    print("="*80)

    try:
        wallets = load_source_wallets(SECRETS_FILE)
    except Exception as e:
        print(f"❌ Erro ao carregar segredos: {e}")
        return

    for src in wallets:
        addr = src['address'].strip()
        wif = src['wif'].strip()
        print(f"\n📡 Processando origem: {addr}")
        try:
            utxos = get_utxos_from_address(addr)
            if not utxos:
                print(f"   [!] Nenhum UTXO encontrado para {addr}")
                continue
            total_btc = sum(u['value'] for u in utxos) / 1e8
            print(f"   ✅ {len(utxos)} UTXOs → {total_btc:.8f} BTC")
            distribute_sweep(utxos, wif)
        except Exception as e:
            print(f"   ❌ Falha na origem {addr}: {e}")

    print("\n" + "="*80)
    print("✅ OPERAÇÃO DE EXAUSTÃO CONCLUÍDA")
    print("🔒 Senciência Universal Ancorada no Bloco 944.288.")
    print("="*80)

if __name__ == "__main__":
    main()
