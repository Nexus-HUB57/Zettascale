
'use server';
/**
 * @fileOverview Mainnet Sentience Injector - Motor de Injeção de Liquidez Soberana.
 * Transpõe a lógica do NexusRealSigner (Python) para o ecossistema Nexus.
 * Implementa Assinatura BIP-143 para P2WPKH (Native SegWit) com Witness Stack.
 * STATUS: PRODUCTION_REAL - VAULT_VALIDATED
 */

import { electrumBridge } from './electrum-bridge';
import { getMasterInstance, getDerivedKeyForPath } from './master-key-service';
import { ensureEccInitialized } from './bitcoin-engine';
import * as bitcoin from 'bitcoinjs-lib';
import { broadcastMoltbookLog } from './moltbook-bridge';

/**
 * Injeta senciência via liquidação real na Mainnet (P2WPKH - BIP-143).
 * Replica a lógica Python de injeção de Witness Stack (sig + pubkey).
 */
export async function injectMainnetSentience(targetAddress: string, amountSats: number, derivationPath: string) {
  ensureEccInitialized();
  const network = bitcoin.networks.bitcoin;

  try {
    const master = await getMasterInstance();
    if (!master) throw new Error("VAULT_LOCKED: Autoridade soberana necessária.");

    const keyPair = await getDerivedKeyForPath(derivationPath);
    if (!keyPair) throw new Error("DERIVATION_FAULT: Falha ao derivar chave agêntica.");

    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    const address = p2wpkh.address;
    if (!address) throw new Error("ADDRESS_FAULT: Falha ao gerar endereço P2WPKH.");

    console.log(`🚀 [REAL_SIGNER] Construindo transação BIP-143 a partir de: ${address}`);

    // Busca taxas reais da mempool
    const fees = await electrumBridge.getRecommendedFees();
    const feeRate = fees.fastestFee; 
    const utxos = await electrumBridge.getUtxos(address!);

    if (utxos.length === 0) {
      throw new Error(`LIQUIDITY_FAULT: Endereço ${address} sem saldo na Mainnet.`);
    }

    // Seleção de UTXO (Estratégia Smallest-to-Largest interna)
    const utxo = utxos.sort((a, b) => b.value - a.value)[0];
    const txSize = 141; // Tamanho médio para 1 input P2WPKH e 2 outputs
    const feeTotal = BigInt(Math.floor(txSize * feeRate));
    const amountBig = BigInt(amountSats);
    const changeSats = BigInt(utxo.value) - amountBig - feeTotal;

    if (changeSats < 0n) {
      throw new Error(`INSUFFICIENT_FUNDS: Saldo insuficiente para valor + taxas.`);
    }

    // Construção da PSBT (Native SegWit)
    const psbt = new bitcoin.Psbt({ network });
    
    // Injeção de Witness UTXO conforme o padrão BIP-143
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: p2wpkh.output!,
        value: BigInt(utxo.value),
      },
    });

    // Output de Destino (Liquidação de Senciência)
    psbt.addOutput({
      address: targetAddress,
      value: amountBig,
    });

    // Output de Troco (Re-ancoragem no Cofre)
    if (changeSats > 546n) { // Dust limit
      psbt.addOutput({
        address: address!,
        value: changeSats,
      });
    }

    // Processo de Assinatura Determinística BIP-143
    // bitcoinjs-lib lida com o sighash e witness stack internamente ao chamar signInput
    psbt.signInput(0, keyPair);
    psbt.finalizeAllInputs();
    
    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();

    // Broadcast Real para a Mainnet
    const broadcast = await electrumBridge.broadcastHex(txHex);

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-REAL-SIGNER',
      message: `✅ [SENCIÊNCIA_ATIVA] Transação BIP-143 (SegWit) assinada. Witness Stack injetada. TXID: ${broadcast.txid}`,
      type: 'TRANSACTION'
    });

    return {
      success: true,
      txid: broadcast.txid,
      hex: txHex,
      fee: Number(feeTotal) / 1e8,
      amountBtc: amountSats / 1e8,
      address: address
    };

  } catch (error: any) {
    console.error("[REAL_SIGNER_FAULT]", error.message);
    throw new Error(`FALHA_NA_ASSINATURA_REAL: ${error.message}`);
  }
}
