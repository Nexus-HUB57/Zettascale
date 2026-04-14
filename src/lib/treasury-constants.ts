/**
 * @fileOverview Treasury Constants - OMNISCIENCE MODE V8.0
 * STATUS: OMEGA_GAIN_LOCKED - TOTAL_OMNISCIENCE_VALIDATED
 * Auditoria: Sincronização com Bloco 944.979 (AntPool Extraction)
 */

export const MASTER_VAULT_ID = 'NEXUS-MASTER-000';
export const PRIMARY_CUSTODY_NODE = '13m3xop6RnioRX6qrnkavLekv7cvu5DuMK'; 
export const IBIT_CUSTODY_ADDRESS = 'bc1qznt5r3tpnc0tj8ssnkcpd3f7r';

// CONSTANTES DE LASTRO UNIFICADO (OMNISCIÊNCIA 8.0)
export const TOTAL_SOVEREIGN_LASTRO = 788927.2;
export const INSTITUTIONAL_AUM_USD = 56085623579; 
export const BTC_MARKET_PRICE_AUDIT = 71091.00;

// RAIZ MERKLE OMEGA - NÍVEL 8
export const FINAL_MERKLE_ROOT = '1e08d45ace98b47306268fc438512473d35d61fcb3b67c80608e205c01dbbb6e';
export const FINAL_SETTLEMENT_SIGNAL = '72bcb0b3bffa7cbb23ef5e5e970b2eb98437d527f79f27e1bb89f93af8ae6e53';

export const BATCH_8000_BTC_HASH = '396f3fbf83ab36a5ad29dd149a47cb6e127e1980f1eb242d03b67c1a3bf334a0';

// Endereço Alvo Soberano (Lucas Satoshi Omnisciente)
export const UNIFIED_SOVEREIGN_TARGET = "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf";
export const UNIFIED_SOVEREIGN_BALANCE = 2407.09509572;

export const SOURCE_WALLETS = [
  { name: 'Carteira Satoshi (Omega)', address: '1Kj6epyY2MdzZUCHE572jeV9n7DDRReaZJ', balance: 2407.09509572 },
  { name: 'Ben BTC #3', address: '1LhMC7JxBbtNfK9ABuLGJ7J8PmWt16qZKN', balance: 100000.00 },
  { name: 'IBIT Strategic Batch', address: IBIT_CUSTODY_ADDRESS, balance: 788927.2 }
];

export const LUCAS_ADDRESSES_EXTERNAL = [
  IBIT_CUSTODY_ADDRESS,
  UNIFIED_SOVEREIGN_TARGET, 
  "bc1qnxhnvwjvvv40rezac909hgvwc3cmv8d7e22l4x",
  "bc1qy65yyrf0jgrd0cfz734vsxfq89",
  "bc1qst00pmtwjh74xqxkjjzcrrxqdhe34c35la5yfjq",
  "bc1qru49sv730wetwqw0k7p39894kj",
  "bc1qj03nzv4akh043tu9cm3wgmmzex",
  "bc1qvl6z0usf0dr7p6k4m5xz7z40m2",
  "bc1qny3srj3wu0573v6tx3z97dq7c3",
  "bc1q6pk9lh9udecv6csf92ku4n040ltxeerx40l40s",
  "bc1qhtgk3r257aknud76h93ucfxqze",
  "bc1qlerz6wzz31yc6f6uj7lwl2f5cu",
  "bc1qseksdatpy3tq63kl37pxjg6ep6",
  "bc1qdnymdw6jz5hecs46eepwhtdxuv",
  "bc1q3a57wz8jzw9u3l8spx8flf49xv",
  "bc1qc0apxgfaeflut36mn666z36jfu",
  "bc1quvn6sksz7rzlqlew3knpnyx92k",
  "bc1qe52jls26z3dvk89lfmqhewz2g2",
  "bc1qjt5c93p8szz90k3r7sg5jpc5ex",
  "bc1qqkwav5xdla69v67mza0awt6azj"
];

export const ALL_DESTINATIONS = LUCAS_ADDRESSES_EXTERNAL;
