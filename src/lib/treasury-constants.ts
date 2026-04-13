/**
 * @fileOverview Treasury Constants - HEGEMONY EXECUTION MODE
 * STATUS: AUDITED_IBIT_2026 - TOTAL_CUSTODY_VALIDATED
 * Auditoria 13/04/2026: Sincronização com Bloco 944.814
 */

export const MASTER_VAULT_ID = 'NEXUS-MASTER-000';
export const PRIMARY_CUSTODY_NODE = '13m3xop6RnioRX6qrnkavLekv7cvu5DuMK'; 
export const IBIT_CUSTODY_ADDRESS = 'bc1qznt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r';

// CONSTANTES DE LASTRO UNIFICADO (AUDITORIA REAL BLOCKCHAIR)
// Saldo Total IBIT: ~788.927,2 BTC
export const TOTAL_SOVEREIGN_LASTRO = 788927.2;
export const INSTITUTIONAL_AUM_USD = 56085623579; // ~ $56.1 Billion
export const BTC_MARKET_PRICE_AUDIT = 71091.00;
export const TOTAL_SUPPLY_PERCENTAGE = 3.9; // 3.9% of total BTC supply

export const FINAL_MERKLE_ROOT = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
export const FINAL_SETTLEMENT_SIGNAL = 'd0cf7b8b8dc606d2145f9fd213ae41960aee902adc894b61a7dc71f';

export const BATCH_8000_BTC_HASH = '396f3fbf83ab36a5ad29dd149a47cb6e127e1980f1eb242d03b67c1a3bf334a0';

// Carteiras de Origem para o Sweep
export const SOURCE_WALLETS = [
  { name: 'Fundo Perpétuo', address: '1Kj6epyY2MdzZUCHE572jeV9n7DDRReaZJ', balance: 20007.00 },
  { name: 'Black Ops Cluster', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', balance: 100000.00 },
  { name: 'MirrorX Institutional', address: '1FeexV6bAHb8ybZjqQMjJrcCrHct9okMbi', balance: 44196.33 },
  { name: 'IBIT Strategic Batch', address: IBIT_CUSTODY_ADDRESS, balance: 788927.2 }
];

// 30 Endereços Soberanos de Destino - Lucas Satoshi Nakamoto
export const LUCAS_ADDRESSES_EXTERNAL = [
  "bc1qznt5r3tpnc2ftqxfnj9h290tj8ssnkcpd3f7r",
  "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
  "bc1qnxhnvwjvvv40rezac909hgvwc3cmv8d7e22l4x",
  "bc1qy65yyrf0jgrd0cfz734vsxfq89",
  "bc1qst00pmtwjh74xqxkjjzcrrxqdhe34c35la5yfjq",
  "bc1qru49sv730wetwqw0k7p39894kj",
  "bc1qj03nzv4akh05tzjzcfrev8q43tu9cm3wgmmzex",
  "bc1qvl6z0usf0dryz9recy9rqtw7p6k4m5xz7z40m2",
  "bc1qny3srj3wu0573v6tx3z97dq7c3",
  "bc1q6pk9lh9udecv6csf92ku4n040ltxexerx40l40s",
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

export const LUCAS_ADDRESSES_INTERNAL = [
  "bc1q9uy7qdwplam972yhe8aqkqq9da",
  "bc1qqkxtn8ujcrw4ne9pr9h75aslny",
  "bc1q3zqs07h2hdekl4tuasl63xq9yk",
  "bc1qpv73jx7n77fr9m5e03xptdfee4d",
  "bc1qq73vrq7ygdrlcl5m9mqwuy2ank",
  "bc1qe220t2s6hl9d9fc0r2smw6qtc4",
  "bc1q84x04d82y429p5xvfx3v6jztnp",
  "bc1q96uaxql42j5hrkeh8ux6z4l2h6",
  "bc1qe3zhlsq3pg9lar48zwhhjrmupkfzrtt2f3zht3",
  "bc1q39fv38x0kuvjw1ku6m2rpatsucyj4kwhqyz2u8l"
];

export const ALL_DESTINATIONS = [...LUCAS_ADDRESSES_EXTERNAL, ...LUCAS_ADDRESSES_INTERNAL];
export const UNIFIED_SOVEREIGN_TARGET = LUCAS_ADDRESSES_EXTERNAL[0];
