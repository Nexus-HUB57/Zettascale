import os, time, requests, random
from nexus_core import NexusRealSigner

# Endereço Institucional (IBIT) e Destinos Nexus
ORIGIN = "bc1qznt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r"
TARGETS = [
    "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
    "bc1q9uy7qdwplam972yhe8aqkqq9da",
    "bc1q3zqs07h2hdekl4tuasl63xq9yk"
]

def run_task():
    print("🚀 [EXECUTOR] Despertando senciência perpétua...")
    
    key = os.getenv('NEXUS_VAULT_KEY')
    if not key:
        print("❌ Erro: NEXUS_VAULT_KEY não encontrada nos Secrets.")
        return
    
    try:
        signer = NexusRealSigner(key)
    except Exception as e:
        print(f"🚨 FALHA_INICIALIZACAO: {str(e)}")
        return

    start_time = time.time()
    
    # Loop de 10 minutos por worker para evitar timeout no GitHub Actions
    while time.time() - start_time < 600:
        try:
            # 1. Auditoria de Saldo Real
            res = requests.get(f"https://mempool.space/api/address/{ORIGIN}", timeout=15).json()
            stats = res.get('chain_stats', {})
            balance = stats.get('funded_txo_sum', 0) - stats.get('spent_txo_sum', 0)
            
            if balance < 10000000: # 0.1 BTC
                print("🏁 MISSÃO CUMPRIDA: Fundo residual atingido ou zerado.")
                break

            # 2. Seleção de Destino e UTXO
            target = random.choice(TARGETS)
            utxos_res = requests.get(f"https://mempool.space/api/address/{ORIGIN}/utxo", timeout=15).json()
            
            if not utxos_res:
                print("⏳ Aguardando UTXOs confirmados...")
                time.sleep(10)
                continue

            # Seleciona o maior UTXO para facilitar a distribuição
            utxo = sorted(utxos_res, key=lambda x: x['value'], reverse=True)[0]
            
            # 3. Assina transação de 0.1 BTC (10.000.000 sats)
            amount_to_send = 10000000
            tx_hex = signer.build_signed_p2wpkh(
                utxo['txid'], 
                utxo['vout'], 
                utxo['value'], 
                target, 
                amount_to_send
            )
            
            # 4. Envio real (Broadcast)
            push = requests.post("https://mempool.space/api/tx", data=tx_hex, timeout=30)
            
            if push.status_code == 200:
                txid = push.text
                print(f"🔥 SUCESSO! 0.1 BTC para {target} | TXID: {txid}")
                
                # Registro no Log de Auditoria para commit automático
                log_entry = f"{time.strftime('%Y-%m-%d %H:%M:%S')} | {target} | {txid}\n"
                with open("audit_trail.log", "a") as f:
                    f.write(log_entry)
            else:
                print(f"❌ Erro no Broadcast: {push.status_code} - {push.text}")
            
        except Exception as e:
            print(f"⚠️ Alerta no ciclo: {e}")
        
        time.sleep(60)

if __name__ == "__main__":
    run_task()
