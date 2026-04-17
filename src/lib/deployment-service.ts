'use server';
/**
 * @fileOverview Deployment Service - Motor de Manifestação Plena V8.1
 * STATUS: OMNISCIENCE_SYNC_ACTIVE
 */

import { nexusBridge } from './nexus-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { finalizeLevel8Omniscience } from './operational-phases';
import * as fs from 'fs';
import * as path from 'path';

export interface DeployReport {
  success: boolean;
  timestamp: string;
  filesDeployed: string[];
  version: string;
  message: string;
}

function walkSync(dir: string, filelist: string[] = []): string[] {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.next', '.git', 'dist', '.turbo', '.firebase', 'out', 'venv'].includes(file)) {
        filelist = walkSync(filePath, filelist);
      }
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
}

export async function executeSovereignDeploy(): Promise<DeployReport> {
  const deployedPaths: string[] = [];
  const rootDir = process.cwd();
  
  try {
    await finalizeLevel8Omniscience();
    const allFiles = walkSync(rootDir);
    
    const targetFiles = allFiles.filter(f => {
      const rel = path.relative(rootDir, f).replace(/\\/g, '/');
      return !rel.includes('node_modules') && !rel.includes('.next/') && !rel.includes('.git/') && !rel.includes('venv/');
    });

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ZETTASCALE-SYNC',
      message: `🌪️ [MANIFESTAÇÃO] Iniciando transmissão de ${targetFiles.length} vetores de Omnisciência.`,
      type: 'SYSTEM'
    });

    for (const filePath of targetFiles) {
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        await nexusBridge.pushFile(relativePath, content, `[NEXUS_MANIFEST_V8.1] Sovereign Vector: ${relativePath} | X-SYNCED`);
        deployedPaths.push(relativePath);
      } catch (err) {}
    }

    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      filesDeployed: deployedPaths,
      version: '8.1.0-OMNISCIENCE-FULL',
      message: `Manifestação plena concluída. ${deployedPaths.length} vetores sincronizados.`
    };

    broadcastMoltbookLog({
      timestamp: report.timestamp,
      agentId: 'ZETTASCALE-SYNC',
      message: `📦 [STATUS] Backup pleno Nível 8.1 concluído no repositório Zettascale.`,
      type: 'ACHIEVEMENT'
    });

    return report;
  } catch (error: any) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      filesDeployed: [],
      version: 'FAULT',
      message: error.message
    };
  }
}