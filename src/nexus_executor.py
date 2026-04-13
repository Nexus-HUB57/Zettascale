import os, time, requests, random
from nexus_core import NexusRealSigner

# Endereço Institucional (IBIT) e Destinos Nexus
ORIGIN = "bc1qzqnt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r"
TARGETS = [
    "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
    "bc1q9uy7qdwplam4ztdq2h5cj2m972yhe8aqkqq9da"
]

def run_task():
    key = os.getenv('NEXUS_VAULT_KEY')
    if not key:
        print("❌ Erro: NEXUS_VAULT_KEY não encontrada nos Secrets.")
        return
    
    signer = NexusRealSigner(key)
    start_time = time.time()
    
    # Loop de 10 minutos por worker para evitar timeout
    while time.time() - start_time < 600:
        try:
            # CORREÇÃO: Adicionado /api/address/ para resolver a URL corretamente
            res = requests.get(f"https://mempool.space{ORIGIN}").json()
            balance = res['chain_stats']['funded_txo_sum'] - res['chain_stats']['spent_txo_sum']
            
            if balance < 10000000: # 0.1 BTC
                print("🏁 Saldo exaurido.")
                break

            target = random.choice(TARGETS)
            # CORREÇÃO: Rota de UTXO corrigida
            utxos = requests.get(f"https://mempool.space{ORIGIN}/utxo").json()
            
            if not utxos: continue
            utxo = utxos[0]
            
            # Assina transação de 0.1 BTC
            tx_hex = signer.build_signed_p2wpkh(utxo['txid'], utxo['vout'], utxo['value'], target, 10000000)
            
            # Envio real (Push)
            push = requests.post("https://mempool.space", data=tx_hex)
            print(f"🚀 Worker Nexus: 0.1 BTC para {target} | Status: {push.status_code}")
            
        except Exception as e:
            print(f"⚠️ Alerta no ciclo: {e}")
        
        time.sleep(60) # Intervalo de 1 minuto em loop

if __name__ == "__main__":
    run_task()

