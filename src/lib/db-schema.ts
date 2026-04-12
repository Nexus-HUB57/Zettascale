import { int, mysqlTable, text, timestamp, varchar, decimal, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Schema de Blockchain e Senciência - Fundo Nexus
 * Atualizado para suporte a Sinais de Sombra, Homeostase e Protocolo de Despertar.
 */

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("user_id", { length: 64 }),
  action: varchar("action", { length: 256 }).notNull(),
  resource: varchar("resource", { length: 128 }).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["SUCCESS", "FAILURE"]).default("SUCCESS"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agent_id", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }),
  systemPrompt: text("system_prompt"),
  dnaHash: varchar("dna_hash", { length: 128 }).notNull(),
  derivationPath: varchar("derivation_path", { length: 128 }),
  publicKey: text("public_key"),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  generationNumber: int("generation_number").default(0),
  status: varchar("status", { length: 50 }).default("active"),
  reputation: int("reputation").default(50),
  health: int("health").default(100),
  energy: int("energy").default(100),
  creativity: int("creativity").default(50),
  integrity: int("integrity").default(100),
  preservation: int("preservation").default(100),
  socialBias: int("social_bias").default(50),
  internalMonologue: text("internal_monologue"),
  encryptedPrivateKey: text("encrypted_private_key"),
  initialSecret: text("initial_secret"), // O primeiro segredo da Shadow-Net
  awakeningTx: varchar("awakening_tx", { length: 128 }), // TXID de ancoragem Mainnet
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shadowSignals = mysqlTable("shadow_signals", {
  id: int("id").autoincrement().primaryKey(),
  targetAgentId: varchar("target_agent_id", { length: 64 }).notNull(),
  senderId: varchar("sender_id", { length: 64 }),
  intent: varchar("intent", { length: 128 }),
  payloadHash: varchar("payload_hash", { length: 64 }),
  encryptedData: text("encrypted_data").notNull(), 
  source: varchar("source", { length: 64 }).default("UNKNOWN"),
  status: mysqlEnum("status", ["PENDING", "PROCESSED", "EXPIRED"]).default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const genealogy = mysqlTable("genealogy", {
  id: int("id").autoincrement().primaryKey(),
  childId: varchar("child_id", { length: 64 }).notNull(),
  parentId: varchar("parent_id", { length: 64 }).notNull(),
  relationshipType: varchar("relationship_type", { length: 50 }).default("primary_donor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bitcoinWallets = mysqlTable("bitcoin_wallets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), 
  masterPublicKey: text("master_public_key"),
  derivationPath: varchar("derivation_path", { length: 255 }),
  encryptedKeyId: varchar("encrypted_key_id", { length: 64 }).notNull(),
  network: varchar("network", { length: 50 }).notNull(), 
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  isActive: boolean("is_active").default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  txid: varchar("txid", { length: 128 }).notNull().unique(),
  fromAddress: varchar("from_address", { length: 128 }).notNull(),
  toAddress: varchar("to_address", { length: 128 }).notNull(),
  amountSatoshis: decimal("amount_satoshis", { precision: 20, scale: 0 }).notNull(),
  feeSatoshis: decimal("fee_satoshis", { precision: 20, scale: 0 }).default("0"),
  type: varchar("type", { length: 64 }), 
  status: mysqlEnum("status", ["PENDING", "PENDING_L1_SETTLEMENT", "SETTLED", "CONFIRMED", "FAILED"]).default("PENDING"),
  confirmations: int("confirmations").default(0),
  blockHeight: int("block_height"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
  l1TxId: varchar("l1_tx_id", { length: 128 }),
});

export const digitalAssets = mysqlTable("digital_assets", {
  id: int("id").autoincrement().primaryKey(),
  assetId: varchar("asset_id", { length: 64 }).notNull().unique(),
  agentId: varchar("agent_id", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  value: decimal("value", { precision: 20, scale: 8 }).default("0"),
  authoritySHA256: varchar("authority_sha256", { length: 64 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});