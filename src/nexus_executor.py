import os, time, requests, random
from nexus_core import NexusRealSigner

# Endereço Institucional (IBIT) e Destinos Nexus
ORIGIN = "bc1qzqnt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r"
TARGETS = [
    "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
    "bc1q9uy7qdwplam4ztdq2h5cj2m972yhe8aqkqq9da"
]

def run_task():
    # Carrega a chave privada dos Secrets do GitHub
    key = os.getenv('NEXUS_VAULT_KEY')
    if not key:
        print("❌ Erro: NEXUS_VAULT_KEY não encontrada nos Secrets.")
        return
    
    signer = NexusRealSigner(key)
    start_time = time.time()
    
    # Loop de 10 minutos por worker para evitar timeout do GitHub
    while time.time() - start_time < 600:
        try:
            # 1. Auditoria de Saldo Real (URL CORRIGIDA)
            res = requests.get(f"https://mempool.space{ORIGIN}").json()
            stats = res.get('chain_stats', {})
            balance = stats.get('funded_txo_sum', 0) - stats.get('spent_txo_sum', 0)
            
            if balance < 10000000: # Se saldo for menor que 0.1 BTC
                print("🏁 Fundo exaurido ou saldo insuficiente para nova remessa.")
                break

            # 2. Seleção de Destino e Busca de UTXOs (URL CORRIGIDA)
            target = random.choice(TARGETS)
            utxo_res = requests.get(f"https://mempool.space{ORIGIN}/utxo")
            utxos = utxo_res.json()
            
            if not utxos:
                print("⏳ Aguardando UTXOs confirmados...")
                time.sleep(30)
                continue
                
            # Seleciona o primeiro UTXO disponível para gastar
            utxo = utxos[0]
            
            # 3. Assina transação de 0.1 BTC (10.000.000 Satoshis)
            print(f"✍️ Gerando assinatura para {target}...")
            tx_hex = signer.build_signed_p2wpkh(
                utxo['txid'], 
                utxo['vout'], 
                utxo['value'], 
                target, 
                10000000
            )
            
            # 4. Broadcast Real via Push API
            push = requests.post("https://mempool.space", data=tx_hex)
            
            if push.status_code == 200:
                print(f"🚀 SUCESSO: 0.1 BTC enviado para {target} | TXID: {push.text}")
            else:
                print(f"⚠️ Falha no Broadcast: {push.text} (Status: {push.status_code})")
            
        except Exception as e:
            print(f"⚠️ Alerta no ciclo: {e}")
        
        # Intervalo de 60 segundos entre tentativas por worker
        time.sleep(60)

if __name__ == "__main__":
    run_task()

