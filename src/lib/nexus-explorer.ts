/**
 * @fileOverview Nexus Explorer - Motor de Validação Criptográfica (Double SHA-256)
 * Implementa reconstrução de Raiz Merkle e integridade de blocos conforme padrão Bitcoin.
 * Utiliza crypto-js para compatibilidade universal (Client/Server).
 * STATUS: PRODUCTION_STABLE
 */

import CryptoJS from 'crypto-js';

export class NexusExplorer {
  /**
   * Gera um hash SHA-256 duplo (padrão Bitcoin).
   */
  public static calculateHash(data: string): string {
    const firstHash = CryptoJS.SHA256(data);
    return CryptoJS.SHA256(firstHash).toString(CryptoJS.enc.Hex);
  }

  /**
   * Reconstrói a Raiz Merkle a partir de uma lista de TXIDs.
   */
  public static getMerkleRoot(txids: string[]): string | null {
    const layers = this.getMerkleLayers(txids);
    return layers.length > 0 ? layers[layers.length - 1][0] : null;
  }

  /**
   * Extrai todas as camadas da árvore Merkle para visualização.
   */
  public static getMerkleLayers(txids: string[]): string[][] {
    if (!txids || txids.length === 0) return [];
    
    let currentLayer = txids.map(id => this.calculateHash(id));
    const allLayers = [currentLayer];

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = (i + 1 < currentLayer.length) ? currentLayer[i + 1] : left;
        nextLayer.push(this.calculateHash(left + right));
      }
      currentLayer = nextLayer;
      allLayers.push(currentLayer);
    }
    return allLayers;
  }

  /**
   * Verifica a inclusão de um TXID em uma Raiz Merkle usando o caminho de prova.
   */
  public static verifyInclusion(
    txid: string, 
    merkleRoot: string, 
    proofPath: { neighbor: string, direction: 'left' | 'right' }[]
  ): boolean {
    let currentHash = txid;
    
    for (const { neighbor, direction } of proofPath) {
      const combined = direction === 'left' ? neighbor + currentHash : currentHash + neighbor;
      currentHash = this.calculateHash(combined);
    }
    
    return currentHash === merkleRoot;
  }

  /**
   * Valida a integridade de um bloco Nexus.
   */
  public static validateBlock(block: {
    index: number;
    transactions: string[];
    merkle_root: string;
    prev_hash: string;
    timestamp: string;
    hash: string;
  }): boolean {
    const calculatedMerkle = this.getMerkleRoot(block.transactions);
    const isMerkleValid = calculatedMerkle === block.merkle_root;
    
    const blockHeader = `${block.prev_hash}${block.merkle_root}${block.timestamp}`;
    const calculatedBlockHash = this.calculateHash(blockHeader);
    const isHashValid = calculatedBlockHash === block.hash;

    return isMerkleValid && isHashValid;
  }
}
