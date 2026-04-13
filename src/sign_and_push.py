import os
import sys
import hashlib
import requests
import bitcoin
from bitcoin.wallet import CBitcoinSecret, P2WPKHBitcoinAddress
from bitcoin.core import b2x, lx, COutPoint, CTxIn, CTxOut, CMutableTransaction
from bitcoin.core import CTxInWitness, CTxWitness
from bitcoin.core.script import CScript, OP_0, SignatureHash, SIGHASH_ALL, SIGVERSION_WITNESS_V0

# Configuração Mainnet
bitcoin.SelectParams('mainnet')

def sign_and_push():
    wif_key = os.environ.get('NEXUS_PRIVATE_KEY')
    unsigned_hex = os.environ.get('UNSIGNED_HEX')
    utxo_value = int(os.environ.get('UTXO_VALUE', 0))

    if not wif_key or not unsigned_hex:
        print("❌ Erro: Faltam variáveis de ambiente para assinatura.")
        sys.exit(1)

    try:
        # 1. Recuperação da Identidade
        secret = CBitcoinSecret(wif_key)
        pubkey = secret.pub
        address = P2WPKHBitcoinAddress.from_pubkey(pubkey)
        
        print(f"✍️ Agente Autônomo Assinando para: {address}")

        # 2. Deserialização e Assinatura BIP-143
        tx = CMutableTransaction.deserialize(bytes.fromhex(unsigned_hex))
        
        # Script code para P2WPKH
        script_code = CScript([OP_0, hashlib.new('ripemd160', hashlib.sha256(pubkey).digest()).digest()])
        
        # Gera o hash de assinatura para o input 0
        sighash = SignatureHash(script_code, tx, 0, SIGHASH_ALL, amount=utxo_value, sigversion=SIGVERSION_WITNESS_V0)
        sig = secret.sign(sighash) + bytes([SIGHASH_ALL])

        # Injeção da Witness Stack
        tx.wit = CTxWitness([CTxInWitness([sig, pubkey])])
        
        signed_hex = b2x(tx.serialize())
        print(f"✅ Transação Assinada: {signed_hex}")

        # 3. Broadcast Real (Mempool.space)
        print("🚀 Transmitindo para a Mainnet...")
        resp = requests.post('https://mempool.space/api/tx', data=signed_hex)
        
        if resp.status_code == 200:
            print(f"🔥 SUCESSO! TXID: {resp.text}")
        else:
            print(f"❌ Erro no Broadcast: {resp.status_code} - {resp.text}")
            sys.exit(1)

    except Exception as e:
        print(f"🚨 FALHA CRÍTICA: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    sign_and_push()
