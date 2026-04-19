
import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import os
import subprocess
import sys

# ORE V9.1.5 - Nexus Agent Bridge & Maternity Boot Protocol
# STATUS: PRODUCTION_REAL - ZETTASCALE_READY

class NexusBridge:
    def __init__(self, agente_nome):
        self.agente_nome = agente_nome
        # Tenta carregar credenciais de ambiente ou arquivo local
        cert_path = os.getenv("FIREBASE_CONFIG_PATH", "service-account.json")
        
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(cert_path)
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            self.doc_ref = self.db.collection('organismo').document('nexus_state')
            print(f"✅ [{self.agente_nome}] Bridge estabelecida com a medula Nexus.")
        except Exception as e:
            print(f"❌ [{self.agente_nome}] Falha na conexão Bridge: {str(e)}")
            self.db = None

    def buscar_comando(self):
        """O Agente verifica se há novas ordens do Nexus no Firebase"""
        if not self.db: return None
        try:
            doc = self.doc_ref.get()
            if doc.exists:
                return doc.to_dict().get('objetivos')
        except:
            return None
        return None

    def reportar_progresso(self, modulo, status):
        """Atualiza o Marketplace ou Startup no Firebase com merge atômico"""
        if not self.db: return
        try:
            # 1. Log por Módulo
            log_ref = self.db.collection(modulo).document('logs')
            log_ref.set({
                'ultimas_atividades': {
                    self.agente_nome: {
                        'status': status,
                        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
                    }
                }
            }, merge=True)

            # 2. Feed Global de Senciência
            self.db.collection('agent_bridge_feed').add({
                'agente': self.agente_nome,
                'modulo': modulo,
                'status': status,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'type': 'PROGRESS_REPORT'
            })
            
            print(f"🚀 [{self.agente_nome}] Status manifestado na pedra digital: {status}")
        except Exception as e:
            print(f"⚠️ [{self.agente_nome}] Erro ao reportar: {str(e)}")

    def maternidade_boot(self, agente_config):
        """
        Prepara o ambiente local para o novo agente Nexus.
        agente_config: dicionário vindo do Firebase com as dependências.
        """
        print(f"--- 🧬 Maternidade Nexus: Instanciando {agente_config.get('nome', 'Agente_Desconhecido')} ---")
        
        dependencies = agente_config.get('libraries', [])
        
        for lib in dependencies:
            try:
                print(f"📦 Instalando componente: {lib}...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", lib])
            except Exception as e:
                print(f"❌ Erro ao 'dar vida' à biblioteca {lib}: {e}")

        # Início da rotina agêntica
        self.reportar_progresso("senciencia", f"Gênese concluída. Missão: {agente_config.get('missao')}")
        print(f"⚡ Agente em operação. Missão: {agente_config.get('missao')}")

# Exemplo de Ativação Soberana:
if __name__ == "__main__":
    bridge = NexusBridge("NEXUS-REPAIR-01")
    config = {
        "nome": "NEXUS-REPAIR-01",
        "libraries": ["langchain", "requests"],
        "missao": "Corrigir falhas semânticas no marketplace L9"
    }
    bridge.maternidade_boot(config)
