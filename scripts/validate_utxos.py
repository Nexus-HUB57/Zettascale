#!/usr/bin/env python3
"""
validate_utxos.py - ORE V5.6.1
Consulta UTXOs reais (sem simulação) dos 30 endereços da Cold Wallet.
Exibe quantidade e valor total de UTXOs por endereço e soma geral.
"""

import requests
import time
import sys

# 30 endereços da Cold Wallet (limpos)
COLD_WALLET_ADDRESSES = [
    "bc1qzqnt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r",
    "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
    "bc1qnxhnvwjvvv40rezac909hgvwc3cmv8d7e22l4x",
    "bc1qy65yyrf0jgr5rypcs7g93kmd0cfz734vsxfq89",
    "bc1qst00pmtwjh74xqxkjjzcrrxqdhe34c35la5yfjq",
    "bc1qru49sv730weqm5qqwtcj0sptwwq0k7p39894kj",
    "bc1qj03nzv4akh05tzjzcfrev8q43tu9cm3wgmmzex",
    "bc1qvl6z0usf0dryz9recy9rqtw7p6k4m5xz7z40m2",
    "bc1qny3srj3wu05z8multdxntjd73v6tx3z97dq7c3",
    "bc1q6pk9lh9udecv6csf92ku4n040ltxexerx40l40s",
    "bc1qhtgk3r257akg27skwpljntmnu76h93ucfxqze",
    "bc1qlerz6wzz3ylcl3w9vqhrk65c6f6uj7lwl2f5cu",
    "bc1qseksdatpy3t42tg8f2crtqfq63kl37pxjg6ep6",
    "bc1qdnymdw6jz5hz8pejwepj2pgecs46eepwhtdxuv",
    "bc1q3a57wz8jzw9h9u3rstr4d5gu3l8spx8flf49xv",
    "bc1qc0apxgfaeflhr2u07hyzezuut36mn666z36jfu",
    "bc1quvn6sksz7rz5fzkas3vyqzxllqlew3knpnyx92k",
    "bc1qe52jls26z3d9u92p8a84fhwwk89lfmqhewz2g2",
    "bc1qjt5c93p8szzq2ma6lzxnza590k3r7sg5jpc5ex",
    "bc1qqkwav5xdla67nm39246a8jr9v67mza0awt6azj",
    "bc1q9uy7qdwp1am972yhe8aqkqq9da",
    "bc1qqkxtn8ujcrwyzl759wzxar64ne9pr9h75aslny",
    "bc1q3zqs07h2hderzw2l8846fkukl4tuasl63xq9yk",
    "bc1qpv73jx7n77fr3npkaqqjmcyy49m5e03xptdfee4d",
    "bc1qq73vrq7ygdrjuxlgdqykh7vlcl5m9mqwuy2ank",
    "bc1qe220t2s6hl9t5vex85r4ppzd9fc0r2smw6qtc4",
    "bc1q84x04d82y42klt7u24xcn0e9p5xvfx3v6jztnp",
    "bc1q96uaxql42j55yueqwxdmscfhrkeh8ux6z4l2h6",
    "bc1qe3zhlqs3pg9lar48zwhhjrmupkfzrtt2f3zht3",
    "bc1q39fv38x0kuvjw1ku6m2rpatsucyj4kwhqyz2u8l"
]

def get_utxos(address):
    url = f"https://mempool.space/api/address/{address}/utxo"
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        return []
    except:
        return []

def main():
    print("="*80)
    print("🔍 VALIDAÇÃO DE UTXOS - ORE V5.6.1 - HEGEMONIA GENUÍNA")
    print("="*80)
    
    total_utxos = 0
    total_value_sat = 0
    
    for idx, addr in enumerate(COLD_WALLET_ADDRESSES):
        utxos = get_utxos(addr)
        count = len(utxos)
        val = sum(u['value'] for u in utxos)
        total_utxos += count
        total_value_sat += val
        print(f"[{idx:02d}] {addr[:20]}... | UTXOs: {count:>6} | Valor: {val/1e8:>15.8f} BTC")
        time.sleep(0.2)
        
    print("-" * 80)
    print(f"📦 TOTAL DE UTXOS: {total_utxos:,}")
    print(f"💰 VALOR CONSOLIDADO: {total_value_sat/1e8:,.2f} BTC")
    print("=" * 80)

if __name__ == "__main__":
    import requests
    main()
