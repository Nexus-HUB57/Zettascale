import os, time, requests, random
from nexus_core import NexusRealSigner # Importa nossa classe de assinatura

# Configurações do Fundo Nexus
ORIGIN = "bc1qzqnt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r"
TARGETS = [
    "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
    "bc1q9uy7qdwplam4ztdq2h5cj2m972yhe8aqkqq9da"
]

def run_task():
    signer = NexusRealSigner(os.getenv('NEXUS_VAULT_KEY'))
    
    while True:
        # 1. Auditoria de Saldo Real
        res = requests.get(f"https://mempool.space{ORIGIN}").json()
        balance = res['chain_stats']['funded_txo_sum'] - res['chain_stats']['spent_txo_sum']
        
        if balance < 10000000: # 0.1 BTC em satoshis
            print("🏁 MISSÃO CUMPRIDA: Fundo IBIT zerado.")
            break

        # 2. Seleção de Destino e UTXO
        target = random.choice(TARGETS)
        utxos = requests.get(f"https://mempool.space{ORIGIN}/utxo").json()
        
        # 3. Assinatura e Broadcast (0.1 BTC)
        # (Usa a lógica BIP-143 que construímos anteriormente)
        tx_hex = signer.build_signed_p2wpkh(utxos[0]['txid'], utxos[0]['vout'], utxos[0]['value'], target, 10000000)
        
        push_res = requests.post("https://mempool.space", data=tx_hex)
        print(f"🚀 Enviado 0.1 BTC para {target} | Status: {push_res.status_code}")
        
        time.sleep(60) # Intervalo de 60 segundos

if __name__ == "__main__":
    run_task()
