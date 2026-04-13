import os, time, requests, random
from nexus_core import NexusRealSigner

ORIGIN = "bc1qzqnt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r"
TARGETS = [
    "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
    "bc1q9uy7qdwplam4ztdq2h5cj2m972yhe8aqkqq9da"
]

def run_task():
    key = os.getenv('NEXUS_VAULT_KEY')
    if not key: return print("❌ NEXUS_VAULT_KEY não encontrada.")
    
    signer = NexusRealSigner(key)
    start_time = time.time()
    
    # Roda por 10 min
    while time.time() - start_time < 600:
        try:
            # URL CORRIGIDA PARA RESOLUÇÃO DE DNS
            res = requests.get(f"https://mempool.space{ORIGIN}").json()
            stats = res.get('chain_stats', {})
            balance = stats.get('funded_txo_sum', 0) - stats.get('spent_txo_sum', 0)
            
            if balance < 10000000: break

            target = random.choice(TARGETS)
            # URL CORRIGIDA PARA BUSCA DE UTXO
            utxos_req = requests.get(f"https://mempool.space{ORIGIN}/utxo")
            utxos = utxos_req.json()
            
            if not utxos: 
                time.sleep(30)
                continue
            
            utxo = utxos[0]
            tx_hex = signer.build_signed_p2wpkh(utxo['txid'], utxo['vout'], utxo['value'], target, 10000000)
            
            push = requests.post("https://mempool.space", data=tx_hex)
            print(f"🚀 Worker Nexus: 0.1 BTC -> {target} | Status: {push.status_code}")
            
        except Exception as e:
            print(f"⚠️ Alerta no ciclo: {e}")
        
        time.sleep(60)

if __name__ == "__main__":
    run_task()

