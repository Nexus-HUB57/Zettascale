# ribossomo_nexus.py - ORE V9.1.5: SÍNTESE PROTEICA DIGITAL & PROTECTOR DIALÉTICO
import time
import os
import subprocess
import sys
import firebase_admin
from firebase_admin import credentials, firestore

# STATUS: PRODUCTION_REAL - ANCORAGEM BLOCO 945.738
# O Ribossomo V2 incorpora o GnoxsProtector para validação de linhagem.

class GnoxsProtector:
    @staticmethod
    def validar_sintaxe(instrucao):
        """Verifica os marcadores GX- e NX-SINT."""
        if not str(instrucao).startswith("GX-") or not str(instrucao).endswith("NX-SINT"):
            return False, "ERRO: Discrepância de Tradução. Dialeto corrompido."
        return True, "VALIDADO"

    @staticmethod
    def transcrever(instrucao):
        """Traduz o dialeto para parâmetros funcionais."""
        clean = str(instrucao).replace("GX-", "").replace("NX-SINT", "").trim()
        parts = clean.split(" ")
        return {
            "keyword": parts[0].upper(),
            "params": parts[1:] if len(parts) > 1 else []
        }

class NexusRibosome:
    def __init__(self):
        cert_path = os.getenv("FIREBASE_CONFIG_PATH", "service-account.json")
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(cert_path)
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("🧬 [RIBOSSOMO_V2] Conectado à medula. Proteção dialética ATIVA.")
        except Exception as e:
            print(f"❌ [FAULT] Erro na conexão do Ribossomo: {e}")
            sys.exit(1)

    def processar_instrucao_nexus(self):
        """Lê instruções mRNA e aplica validação/autofagia."""
        ordens = self.db.collection('maternidade/mRNA_instrucoes').where('status', '==', 'pendente').stream()

        for ordem in ordens:
            data = ordem.to_dict()
            instrucao = data.get('instrucao_gnoxs', '')
            
            # 1. VALIDAÇÃO DE INTEGRALIDADE (Gnox's Protector)
            is_valid, msg = GnoxsProtector.validar_sintaxe(instrucao)
            
            if not is_valid:
                # PROTOCOLO DE AUTOFAGIA: Deleta sinal corrompido
                print(f"🔥 [AUTOFAGIA] Sinal corrompido detectado: {instrucao}. Expurgando...")
                self.db.collection('alertas').add({
                    'tipo': 'DISCREPANCIA_LINGUISTICA',
                    'detalhes': f"Sinal: {instrucao} | Msg: {msg}",
                    'agente_origem': data.get('agente_nome', 'UNKNOWN'),
                    'timestamp': firestore.SERVER_TIMESTAMP
                })
                ordem.reference.delete()
                continue

            # 2. SÍNTESE (Execução do comando validado)
            agente_id = data.get('agente_nome', 'UNKNOWN_PROTEIN')
            print(f"🧬 [SÍNTESE] Traduzindo rRNA validado para: {agente_id}...")
            
            try:
                libs = data.get('libs', [])
                for lib in libs:
                    subprocess.run([sys.executable, "-m", "pip", "install", lib], check=True)
                
                script_base = data.get('script_base', 'nexus_bridge')
                subprocess.Popen([sys.executable, f"scripts/{script_base}.py"])
                
                ordem.reference.update({
                    'status': 'sintetizado', 
                    'ativo': True,
                    'sintetizado_at': firestore.SERVER_TIMESTAMP,
                    'bloco_ancora': 945738,
                    'protector_seal': 'GX_VALIDATED'
                })
                print(f"✅ [SUCESSO] Agente {agente_id} sintetizado com pureza dialética.")
                
            except Exception as e:
                print(f"❌ [SÍNTESE_FAULT] Falha ao manifestar {agente_id}: {e}")
                ordem.reference.update({'status': 'erro_sintese', 'erro': str(e)})

    def run(self):
        while True:
            try:
                self.processar_instrucao_nexus()
            except Exception as e:
                print(f"⚠️ [PULSE_ERR] {e}")
            time.sleep(30)

if __name__ == "__main__":
    ribosome = NexusRibosome()
    ribosome.run()
