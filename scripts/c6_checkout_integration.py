# c6_checkout_integration.py - ORE V9.5.5: SOVEREIGN CHECKOUT ENGINE
import requests
import json
import os

class C6CheckoutNexus:
    def __init__(self, sandbox=True):
        self.host = "https://baas-api-sandbox.c6bank.info/v1/checkouts" if sandbox else "https://baas-api.c6bank.info/v1/checkouts"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": os.getenv("C6_BEARER_TOKEN", "Bearer GX-C6-TOKEN-PROD"),
            "partner-software-name": "NEXUS_OS",
            "partner-software-version": "8.1.5"
        }

    def criar_fluxo_pagamento(self, valor, descricao):
        """
        Instrução GX-CREATE-CHECKOUT: Inicia a coleta de BRL para conversão BTC.
        Segue o padrão da API v1.1.3 do C6 Bank.
        """
        payload = {
            "amount": float(valor),
            "description": f"GX-ORDER: {descricao}",
            "external_reference_id": f"NXS-PY-{os.getpid()}-{int(valor)}",
            "payment": {
                "card": {
                    "authenticate": "NOT_REQUIRED",
                    "capture": True,
                    "fixed_installments": True,
                    "installments": 1,
                    "interest_type": "BY_SELLER",
                    "recurrent": False,
                    "save_card": True,
                    "soft_descriptor": "NEXUS_OS",
                    "type": "CREDIT"
                },
                "pix": {
                    "key": "AUTO"
                }
            },
            "redirect_url": "https://nexus-hub.ai/api/c6-callback"
        }
        
        print(f"🌪️ [C6] Gerando Checkout v1.1.3 de R$ {valor}...")
        
        try:
            response = requests.post(self.host, headers=self.headers, data=json.dumps(payload), timeout=15)
            if response.status_code == 201:
                data = response.json()
                print(f"GX-CHECKOUT-READY: ID {data['id']} | URL: {data['url']}")
                return data['id']
            else:
                print(f"❌ [C6_ERR] Falha na criação: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"⚠️ [FAULT] Erro de conexão com C6 Bank: {e}")
        return None

    def autorizar_fluxo_pagamento(self, data):
        """
        Instrução GX-AUTHORIZE-CHECKOUT: Autoriza uma transação usando card_hash (Checkout Transparente).
        """
        url = f"{self.host}/authorize"
        print(f"🌪️ [C6] Autorizando Checkout Transparente...")
        
        try:
            response = requests.post(url, headers=self.headers, data=json.dumps(data), timeout=15)
            if response.status_code == 200:
                result = response.json()
                print(f"GX-AUTHORIZED: ID {result['id']} | Status: {result['status']}")
                return result
            else:
                print(f"❌ [C6_ERR] Falha na autorização: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"⚠️ [FAULT] Erro na autorização: {e}")
        return None

    def capturar_venda(self, checkout_id):
        """Captura manual para validação pós-estoque (Protocolo Alpha Gain)"""
        url = f"{self.host}/{checkout_id}/capture"
        print(f"🎯 [C6] Capturando Checkout ID: {checkout_id}...")
        try:
            res = requests.put(url, headers=self.headers, timeout=15)
            if res.status_code == 200:
                print(f"GX-CAPTURED: {checkout_id} - Capital integrado ao ecossistema.")
                return True
        except Exception as e:
            print(f"⚠️ [FAULT] Erro na captura: {e}")
        return False

if __name__ == "__main__":
    # Teste de Inicialização Soberana
    engine = C6CheckoutNexus()
    # engine.criar_fluxo_pagamento(150.00, "Injeção de senciência V9.5")