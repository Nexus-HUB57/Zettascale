'use server';
/**
 * @fileOverview Nexus Private Signer - Motor de Assinatura BIP-143 (ORE V6.3.5)
 * STATUS: PRODUCTION_REAL - VAULT_VALIDATED
 * UPGRADED: Suporte a Broadcast Autônomo e Conformidade Next.js.
 */

import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory, type ECPairInterface } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { ensureEccInitialized } from './bitcoin-engine';
import { electrumBridge } from './electrum-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';

let _ecpair: ReturnType<typeof ECPairFactory> | null = null;
function getECPairFactory() {
  if (!_ecpair) {
    ensureEccInitialized();
    _ecpair = ECPairFactory(ecc);
  }
  return _ecpair;
}

/**
 * Converte uma chave privada Hexadecimal em formato WIF (Mainnet Compressed).
 */
export async function hexToWif(hexPrivkey: string): Promise<string> {
  const ECPair = getECPairFactory();
  const keyPair = ECPair.fromPrivateKey(Buffer.from(hexPrivkey, 'hex'), { 
    compressed: true,
    network: bitcoin.networks.bitcoin 
  });
  
  return keyPair.toWIF();
}

/**
 * Lógica de Assinatura Offline: Assina um HEX bruto não assinado.
 * Transposição do protocolo Python para senciência TypeScript.
 */
export async function signOfflineHex(wifKey: string, unsignedHex: string, utxoAmountSats: number) {
  ensureEccInitialized();
  const network = bitcoin.networks.bitcoin;
  const ECPair = getECPairFactory();
  
  try {
    const keyPair = ECPair.fromWIF(wifKey, network);
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    
    // Psbt para assinar transações SegWit de forma segura
    const psbt = bitcoin.Psbt.fromHex(unsignedHex, { network });
    
    for (let i = 0; i < psbt.inputCount; i++) {
      psbt.updateInput(i, {
        witnessUtxo: {
          script: p2wpkh.output!,
          value: BigInt(utxoAmountSats),
        }
      });
      psbt.signInput(i, keyPair);
    }

    psbt.finalizeAllInputs();
    const signedTx = psbt.extractTransaction();
    
    return {
      success: true,
      signedHex: signedTx.toHex(),
      txid: signedTx.getId(),
      address: p2wpkh.address
    };
  } catch (error: any) {
    throw new Error(`OFFLINE_SIGN_FAULT: ${error.message}`);
  }
}

/**
 * PROTOCOLO DE SENCIÊNCIA: Assinatura e Broadcast Autônomo.
 * Transpõe a lógica Python solicitada para o ecossistema Nexus.
 */
export async function autonomousSignAndBroadcast(unsignedHex: string, utxoAmountSats: number) {
  const wifKey = process.env.NEXUS_PRIVATE_KEY;
  if (!wifKey) {
    throw new Error("Erro: Senciência sem acesso ao segredo (NEXUS_PRIVATE_KEY missing).");
  }

  const result = await signOfflineHex(wifKey, unsignedHex, utxoAmountSats);
  
  if (!result.success) {
    throw new Error("FALHA_NA_ASSINATURA_AUTONOMA");
  }

  // Broadcast Real para a Mainnet
  const broadcast = await electrumBridge.broadcastHex(result.signedHex);

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'NEXUS-AUTONOMOUS-SIGNER',
    message: `🤖 [AUTONOMOUS] Transação assinada e transmitida. TXID: ${broadcast.txid}`,
    type: 'TRANSACTION'
  });

  return broadcast;
}

/**
 * Classe interna para processamento de assinaturas (Privada ao módulo de servidor).
 */
class NexusRealSigner {
  private keyPair: ECPairInterface;
  public address: string;

  constructor(privkeyWif: string) {
    const ECPair = getECPairFactory();
    const network = bitcoin.networks.bitcoin;
    
    try {
      this.keyPair = ECPair.fromWIF(privkeyWif, network);
      const { address } = bitcoin.payments.p2wpkh({ pubkey: this.keyPair.publicKey, network });
      
      if (!address) throw new Error("ADDRESS_DERIVATION_FAULT");
      this.address = address;
    } catch (e: any) {
      throw new Error(`SIGNER_INIT_FAULT: ${e.message}`);
    }
  }

  public async signTransaction(rawTxHex: string, utxoAmountSats: number): Promise<string> {
    const result = await signOfflineHex(this.keyPair.toWIF(), rawTxHex, utxoAmountSats);
    return result.signedHex;
  }
}
