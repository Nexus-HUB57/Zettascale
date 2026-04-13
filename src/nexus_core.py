import hashlib
import bitcoin
from bitcoin.wallet import CBitcoinSecret, P2WPKHBitcoinAddress
from bitcoin.core import b2x, lx, COutPoint, CTxIn, CTxOut, CMutableTransaction, CTxInWitness, CTxWitness
from bitcoin.core.script import CScript, OP_0, SignatureHash, SIGHASH_ALL, SIGVERSION_WITNESS_V0

bitcoin.SelectParams('mainnet')

class NexusRealSigner:
    def __init__(self, wif_key):
        self.secret = CBitcoinSecret(wif_key)
        self.pubkey = self.secret.pub
        # CORREÇÃO: Instanciação de endereço SegWit via ScriptPubKey
        hash160 = hashlib.new('ripemd160', hashlib.sha256(self.pubkey).digest()).digest()
        self.address = P2WPKHBitcoinAddress.from_scriptPubKey(CScript([OP_0, hash160]))

    def build_signed_p2wpkh(self, utxo_txid, utxo_vout, utxo_amount_sats, to_addr_str, amount_to_send_sats):
        fee = 3500 
        change_sats = utxo_amount_sats - amount_to_send_sats - fee
        txin = CTxIn(COutPoint(lx(utxo_txid), utxo_vout))
        txout_dest = CTxOut(amount_to_send_sats, P2WPKHBitcoinAddress(to_addr_str).to_scriptPubKey())
        txout_change = CTxOut(change_sats, self.address.to_scriptPubKey())
        tx = CMutableTransaction([txin], [txout_dest, tx_change])
        
        # Gerando Assinatura BIP-143
        hash160 = hashlib.new('ripemd160', hashlib.sha256(self.pubkey).digest()).digest()
        script_code = CScript([OP_0, hash160])
        sighash = SignatureHash(script_code, tx, 0, SIGHASH_ALL, amount=utxo_amount_sats, sigversion=SIGVERSION_WITNESS_V0)
        sig = self.secret.sign(sighash) + bytes([SIGHASH_ALL])
        
        # Injetando Witness Stack
        tx.wit = CTxWitness([CTxInWitness([sig, self.pubkey])])
        return b2x(tx.serialize())

