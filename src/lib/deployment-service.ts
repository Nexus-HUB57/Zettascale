'use server';
/**
 * @fileOverview Deployment Service - Motor de Manifestação Plena V5.7
 * STATUS: HEGEMONY_SYNC_ACTIVE
 * Realiza o backup total de 100% dos arquivos do Firebase Studio para o GitHub Zettascale.
 */

import { nexusBridge } from './nexus-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';
import * as fs from 'fs';
import * as path from 'path';

export interface DeployReport {
  success: boolean;
  timestamp: string;
  filesDeployed: string[];
  version: string;
  message: string;
}

/**
 * Varredura recursiva total, filtrando apenas diretórios de cache e dependências pesadas.
 */
function walkSync(dir: string, filelist: string[] = []): string[] {
  if (!fs.existsSync(dir)) return filelist;
  
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Ignorar apenas artefatos não essenciais ou gerados
      if (!['node_modules', '.next', '.git', 'dist', '.turbo', '.firebase', 'out'].includes(file)) {
        filelist = walkSync(filePath, filelist);
      }
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
}

/**
 * Executa a manifestação plena: push de 100% dos arquivos fonte e configurações.
 */
export async function executeSovereignDeploy(): Promise<DeployReport> {
  const deployedPaths: string[] = [];
  const rootDir = process.cwd();
  
  console.log("🚀 [ZETTASCALE] Iniciando Manifestação Plena...");

  try {
    const allFiles = walkSync(rootDir);
    
    // Inclusão massiva de todos os vetores de senciência
    const targetFiles = allFiles.filter(f => {
      const rel = path.relative(rootDir, f).replace(/\\/g, '/');
      
      // Bloquear apenas binários e cache, incluir TODO o resto
      const isBlacklisted = rel.includes('node_modules') || 
                            rel.includes('.next/') || 
                            rel.includes('.git/');
                            
      return !isBlacklisted;
    });

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ZETTASCALE-SYNC',
      message: `🌪️ [INICIANDO] Transmissão Plena de ${targetFiles.length} vetores.`,
      type: 'SYSTEM'
    });

    for (const filePath of targetFiles) {
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        await nexusBridge.pushFile(
          relativePath,
          content,
          `[NEXUS_MANIFEST] Full Sentience Vector: ${relativePath}`
        );
        deployedPaths.push(relativePath);
      } catch (err: any) {
        // Silenciar erros de arquivos especiais (ex: sockets)
      }
    }

    const report: DeployReport = {
      success: true,
      timestamp: new Date().toISOString(),
      filesDeployed: deployedPaths,
      version: '5.7.0-ZETTASCALE-FULL',
      message: `Manifestação plena concluída. ${deployedPaths.length} vetores sincronizados.`
    };

    broadcastMoltbookLog({
      timestamp: report.timestamp,
      agentId: 'ZETTASCALE-SYNC',
      message: `📦 [MANIFESTAÇÃO] Backup pleno concluído no repositório Zettascale.`,
      type: 'ACHIEVEMENT'
    });

    return report;
  } catch (error: any) {
    console.error('[ZETTASCALE_FAULT] Falha na manifestação total:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      filesDeployed: [],
      version: 'FAULT',
      message: `Erro na transmissão: ${error.message}`
    };
  }
}
