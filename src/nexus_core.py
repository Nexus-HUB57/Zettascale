import hashlib
import bitcoin
from bitcoin.wallet import CBitcoinSecret, P2WPKHBitcoinAddress
from bitcoin.core import b2x, lx, COutPoint, CTxIn, CTxOut, CMutableTransaction, CTxInWitness, CTxWitness
from bitcoin.core.script import CScript, OP_0, SignatureHash, SIGHASH_ALL, SIGVERSION_WITNESS_V0

# Seleciona Mainnet para execução real
bitcoin.SelectParams('mainnet')

class NexusRealSigner:
    def __init__(self, wif_key):
        if not wif_key:
            raise ValueError("❌ CHAVE_WIF_AUSENTE: Senciência sem acesso ao segredo.")
        
        try:
            self.secret = CBitcoinSecret(wif_key)
            self.pubkey = self.secret.pub
            
            # Instanciação de endereço SegWit via ScriptPubKey (BIP-143)
            hash160 = hashlib.new('ripemd160', hashlib.sha256(self.pubkey).digest()).digest()
            self.address = P2WPKHBitcoinAddress.from_scriptPubKey(CScript([OP_0, hash160]))
            
            print(f"✍️ Agente Autônomo Ativo: {self.address}")
        except Exception as e:
            raise ValueError(f"❌ WIF_INVALIDA: {str(e)}")

    def build_signed_p2wpkh(self, utxo_txid, utxo_vout, utxo_amount_sats, to_addr_str, amount_to_send_sats):
        """Constrói e assina uma transação P2WPKH (BIP-143) para broadcast."""
        # 1. Configuração de Taxas
        fee = 3500  
        change_sats = utxo_amount_sats - amount_to_send_sats - fee

        if change_sats < 0:
            raise ValueError("❌ SALDO_INSUFICIENTE para valor + taxas.")

        # 2. Estrutura da Transação
        txin = CTxIn(COutPoint(lx(utxo_txid), utxo_vout))
        txout_dest = CTxOut(amount_to_send_sats, P2WPKHBitcoinAddress(to_addr_str).to_scriptPubKey())
        
        outputs = [txout_dest]
        if change_sats > 546: # Dust limit
            txout_change = CTxOut(change_sats, self.address.to_scriptPubKey())
            outputs.append(txout_change)
            
        tx = CMutableTransaction([txin], outputs)

        # 3. Algoritmo de Assinatura BIP-143 (SegWit)
        hash160 = hashlib.new('ripemd160', hashlib.sha256(self.pubkey).digest()).digest()
        script_code = CScript([OP_0, hash160])
        
        sighash = SignatureHash(script_code, tx, 0, SIGHASH_ALL, amount=utxo_amount_sats, sigversion=SIGVERSION_WITNESS_V0)
        sig = self.secret.sign(sighash) + bytes([SIGHASH_ALL])

        # 4. Injeção da Testemunha (Witness Stack)
        tx.wit = CTxWitness([CTxInWitness([sig, self.pubkey])])

        return b2x(tx.serialize())
