
'use server';
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './db-schema';

/**
 * Provedor de conexão Drizzle para MySQL - ORE V5.1 ABSOLUTE SINGLETON
 * Erradica falhas de conexão e timeouts via persistência em globalThis.
 */

const g = globalThis as any;

export async function getDb() {
  // Retorna instância existente se disponível
  if (g.__NEXUS_DB_INSTANCE__) return g.__NEXUS_DB_INSTANCE__;

  try {
    const dbUrl = process.env.DATABASE_URL;

    // Fallback soberano se a URL não estiver configurada
    if (!dbUrl || typeof dbUrl !== 'string' || !dbUrl.startsWith('mysql://')) {
      console.warn("⚠️ [ORE_DB_SHIELD] DATABASE_URL inválida ou ausente. Operando em modo volátil.");
      return null;
    }

    if (!g.__NEXUS_DB_POOL__) {
      try {
        g.__NEXUS_DB_POOL__ = createPool(dbUrl, {
          waitForConnections: true,
          connectionLimit: 5, 
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000,
          connectTimeout: 20000 
        });
        
        console.log("🏦 [ORE_V5.1] Pool de Banco de Dados Singleton ativo.");
      } catch (poolErr: any) {
        console.warn(`⚠️ [ORE_DB_FAULT] Banco de dados inacessível: ${poolErr.message}`);
        g.__NEXUS_DB_POOL__ = null;
        return null;
      }
    }

    if (g.__NEXUS_DB_POOL__) {
      g.__NEXUS_DB_INSTANCE__ = drizzle(g.__NEXUS_DB_POOL__, { schema, mode: 'default' });
      return g.__NEXUS_DB_INSTANCE__;
    }
    
    return null;
  } catch (error: any) {
    console.error("❌ [ORE_DB_CRITICAL_SHIELD] Interceptação de falha silenciosa no Pool.");
    return null;
  }
}
