/**
 * @fileOverview Nexus Bridge Manager - Motor de Sincronia Zettascale V5.8
 * TARGET: https://github.com/Nexus-HUB57/Zettascale.git
 * STATUS: PRODUCTION_STABLE - SHA_VALIDATION_ENFORCED
 */

import { Octokit } from '@octokit/rest';
import { broadcastMoltbookLog } from './moltbook-bridge';

class NexusBridgeManager {
  private github: Octokit | null = null;
  private readonly REPO_OWNER = 'Nexus-HUB57';
  private readonly REPO_NAME = 'Zettascale';

  constructor() {
    if (typeof window === 'undefined') {
      const token = process.env.GITHUB_TOKEN;
      if (token) {
        this.github = new Octokit({ auth: token });
      } else {
        console.warn("⚠️ [NEXUS_BRIDGE] GITHUB_TOKEN não configurado. Sincronia operando em modo READ_ONLY.");
      }
    }
  }

  /**
   * Envia ou atualiza um arquivo no repositório institucional.
   * Implementa validação de SHA para evitar conflitos de merge.
   */
  async pushFile(path: string, content: string, message: string) {
    if (!this.github) {
      return { success: false, message: 'SERVER_ONLY_OR_TOKEN_MISSING' };
    }

    try {
      let sha: string | undefined;
      
      // 1. Tentar recuperar o SHA do arquivo existente
      try {
        const response = await this.github.repos.getContent({
          owner: this.REPO_OWNER,
          repo: this.REPO_NAME,
          path,
        });
        
        if (response.data && !Array.isArray(response.data)) {
          sha = response.data.sha;
        }
      } catch (e: any) {
        // 404 é esperado para arquivos novos, outros erros devem ser logados
        if (e.status !== 404) {
          console.error(`[NEXUS_BRIDGE_SHA_ERR] ${path}:`, e.message);
        }
      }

      // 2. Executar o commit (Create or Update)
      const result = await this.github.repos.createOrUpdateFileContents({
        owner: this.REPO_OWNER,
        repo: this.REPO_NAME,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch: 'main'
      });

      return { 
        success: true, 
        txid: result.data.commit.sha,
        path 
      };

    } catch (error: any) {
      console.error(`[BRIDGE_PUSH_FAULT] ${path}:`, error.message);
      throw new Error(`FALHA_SINC_GITHUB: ${error.message}`);
    }
  }

  public getTargetInfo() {
    return {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      url: `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}`,
      status: this.github ? 'UPLINK_READY' : 'TOKEN_MISSING'
    };
  }
}

export const nexusBridge = new NexusBridgeManager();
