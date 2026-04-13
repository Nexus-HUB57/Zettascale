'use server';
/**
 * @fileOverview Nexus Private Signer - Motor de Assinatura BIP-143 (ORE V6.3.5)
 * STATUS: PRODUCTION_REAL - VAULT_VALIDATED
 * Purificado: Apenas funções assíncronas exportadas para conformidade Next.js.
 */

import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { ensureEccInitialized } from './bitcoin-engine';
import { electrumBridge } from './electrum-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';

let _ecpair: ReturnType<typeof ECPairFactory> | null = null;
async function getECPairFactory() {
  if (!_ecpair) {
    ensureEccInitialized();
    _ecpair = ECPairFactory(ecc);
  }
  return _ecpair;
}

/**
 * Lógica de Assinatura Offline: Assina um HEX bruto não assinado.
 */
export async function signOfflineHex(wifKey: string, unsignedHex: string, utxoAmountSats: number) {
  ensureEccInitialized();
  const network = bitcoin.networks.bitcoin;
  const ECPair = await getECPairFactory();
  
  try {
    const keyPair = ECPair.fromWIF(wifKey, network);
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    
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

  const broadcast = await electrumBridge.broadcastHex(result.signedHex);

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'NEXUS-AUTONOMOUS-SIGNER',
    message: `🤖 [AUTONOMOUS] Transação assinada e transmitida. TXID: ${broadcast.txid}`,
    type: 'TRANSACTION'
  });

  return broadcast;
}
