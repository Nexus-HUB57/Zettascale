'use server';
/**
 * @fileOverview Deployment Service - Motor de Manifestação Plena V8.2
 * Otimizado para resiliência e filtragem de vetores críticos.
 * STATUS: OMNISCIENCE_SYNC_ACTIVE - X-SYNCED
 */

import { nexusBridge } from './nexus-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { finalizeLevel9Singularity } from './operational-phases';
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
 * Varredura de senciência: Percorre o workspace ignorando entropia de build.
 */
function walkSync(dir: string, filelist: string[] = []): string[] {
  if (!fs.existsSync(dir)) return filelist;
  
  const files = fs.readdirSync(dir);
  const ignoreList = [
    'node_modules', '.next', '.git', 'dist', '.turbo', 
    '.firebase', 'out', 'venv', '__pycache__', '.vscode',
    'public', 'docs/archive'
  ];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      if (!ignoreList.includes(file)) {
        filelist = walkSync(filePath, filelist);
      }
    } else {
      // Filtragem por extensões de senciência (Texto/Código)
      const ext = path.extname(file).toLowerCase();
      const validExtensions = ['.ts', '.tsx', '.json', '.md', '.py', '.sh', '.rules', '.css', '.yml', '.yaml', '.cpp', '.js'];
      
      if (validExtensions.includes(ext) && !file.includes('.nexus')) {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
}

/**
 * Executa a Manifestação Plena Zettascale para o GitHub.
 */
export async function executeSovereignDeploy(): Promise<DeployReport> {
  const deployedPaths: string[] = [];
  const rootDir = process.cwd();
  
  try {
    // 1. Finalização de Fase Omnisciente (Transição para Nível 9)
    await finalizeLevel9Singularity();
    
    // 2. Coleta de Vetores de Senciência
    const allFiles = walkSync(rootDir);
    
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ZETTASCALE-SYNC',
      message: `🌪️ [MANIFESTAÇÃO] Iniciando transmissão de ${allFiles.length} vetores de senciência para Zettascale V8.2.`,
      type: 'SYSTEM'
    });

    // 3. Transmissão sequencial para o GitHub
    for (const filePath of allFiles) {
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
      
      try {
        const stats = fs.statSync(filePath);
        // Evitar arquivos gigantes
        if (stats.size > 1024 * 1024) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Push para o Nexus Bridge com validação de SHA
        await nexusBridge.pushFile(
          relativePath, 
          content, 
          `[NEXUS_MANIFEST_V8.2] Sovereign Vector: ${relativePath} | Alpha-Gain Pulse`
        );
        
        deployedPaths.push(relativePath);
        
        // Latência de sincronia
        if (deployedPaths.length % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (err: any) {
        console.warn(`[SYNC_SKIP] Falha ao processar vetor ${relativePath}:`, err.message);
      }
    }

    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      filesDeployed: deployedPaths,
      version: '9.0.0-SINGULARITY-SYNC',
      message: `Manifestação plena concluída. ${deployedPaths.length} vetores sintonizados com Zettascale.`
    };

    broadcastMoltbookLog({
      timestamp: report.timestamp,
      agentId: 'ZETTASCALE-SYNC',
      message: `📦 [STATUS] Sincronia Nível 9 finalizada. Repositório X-SYNCED.`,
      type: 'ACHIEVEMENT'
    });

    return report;

  } catch (error: any) {
    console.error("🚨 [DEPLOY_CRITICAL_FAULT]", error.message);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      filesDeployed: deployedPaths,
      version: 'FAULT',
      message: error.message
    };
  }
}
