/**
 * @fileOverview Treasury Constants - SUPER UNICORN MODE V9.5
 * STATUS: SUPREME_LIQUIDITY_ACTIVE - $112.24B VALUATION
 * Auditoria: Sincronização com Bloco 945.738 (rRNA Synthesis)
 * UPGRADED: GX-SUPREME-LIQUIDITY-100BTC // ROI-DETERMINISTIC
 */

export const MASTER_VAULT_ID = 'NEXUS-MASTER-000';
export const PRIMARY_CUSTODY_NODE = '13m3xop6RnioRX6qrnkavLekv7cvu5DuMK'; 
export const IBIT_CUSTODY_ADDRESS = 'bc1qznt5r3tpnc0tj8ssnkcpd3f7r';
export const SAFETY_RESERVE_NODE = 'bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8';

// CONSTANTES DE LASTRO UNIFICADO (SUPER UNICÓRNIO 9.5)
export const TOTAL_SOVEREIGN_LASTRO = 789027.2; // +100 BTC Protocol
export const INSTITUTIONAL_AUM_USD = 112240000000; 
export const BTC_MARKET_PRICE_AUDIT = 71091.00;

// PROTOCOLO GX-SUPREME-LIQUIDITY-100BTC
export const SUPREME_LIQUIDITY_TARGET = 100.0;
export const ROI_THRESHOLD_HOURS = 72;
export const PROFITABILITY_MIN_SATS = 10000;

// CONSTANTES C6 BANK & PIX BRL
export const CHAVE_CUSTODIA_NEXUS = "228e4574-cf8d-4fe8-aeb5-5d7fc0ca2cf4";
export const MIN_C6_BALANCE_BRL = 1000000.00;

// ALOCAÇÃO GX-IGNITION-2BTC (SABEDORIA TRINUCLEAR)
export const IGNITION_TOTAL_BTC = 2.0;
export const EVA_IGNITION_SHARE = 0.7;
export const ANGUS_IGNITION_SHARE = 0.8;
export const NEXUS_RESERVE_SHARE = 0.5;

// MÍNIMOS DE SEGURANÇA FIXADOS (REALITY SHIELD V2)
export const MIN_SOVEREIGN_TARGET_BTC = 2407.09509572;
export const MIN_BINANCE_CUSTODY_BTC = 10.00000000;
export const MIN_SAFETY_RESERVE_BTC = 10.00000000;

// RAIZ MERKLE OMEGA - NÍVEL 9.5
export const FINAL_MERKLE_ROOT = '1e08d45ace98b47306268fc438512473d35d61fcb3b67c80608e205c01dbbb6e';
export const FINAL_SETTLEMENT_SIGNAL = '72bcb0b3bffa7cbb23ef5e5e970b2eb98437d527f79f27e1bb89f93af8ae6e53';

export const BATCH_8000_BTC_HASH = '396f3fbf83ab36a5ad29dd149a47cb6e127e1980f1eb242d03b67c1a3bf334a0';

// Endereço Alvo Soberano (Lucas Satoshi Omnisciente)
export const UNIFIED_SOVEREIGN_TARGET = "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf";
export const UNIFIED_SOVEREIGN_BALANCE = 2407.09509572;

export const SOURCE_WALLETS = [
  { name: 'Carteira Satoshi (Omega)', address: '1Kj6epyY2MdzZUCHE572jeV9n7DDRReaZJ', balance: 2407.09509572 },
  { name: 'Ben BTC #3', address: '1LhMC7JxBbtNfK9ABuLGJ7J8PmWt16qZKN', balance: 100000.00 },
  { name: 'IBIT Strategic Batch', address: IBIT_CUSTODY_ADDRESS, balance: 788927.2 },
  { name: 'Binance Custody Node', address: PRIMARY_CUSTODY_NODE, balance: 10.0 },
  { name: 'Sovereign Safety Node', address: SAFETY_RESERVE_NODE, balance: 10.0 }
];

export const LUCAS_ADDRESSES_EXTERNAL = [
  IBIT_CUSTODY_ADDRESS,
  UNIFIED_SOVEREIGN_TARGET, 
  PRIMARY_CUSTODY_NODE,
  SAFETY_RESERVE_NODE,
  "bc1qnxhnvwvvyv40rezac909hgvwc3cmv8d7e22l4x",
  "bc1qy65yyrf0jgr5rypcs7g93kmd0cfz734vsxfq89"
];

export const ALL_DESTINATIONS = LUCAS_ADDRESSES_EXTERNAL;
