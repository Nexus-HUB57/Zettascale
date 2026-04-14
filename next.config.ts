import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [],
  // CONFIGURAÇÃO SOBERANA NÍVEL 7.7: Carregamento nativo para WASM e SDKs oficiais
  serverExternalPackages: [
    '@coinbase/coinbase-sdk',
    'libsodium-wrappers-sumo',
    'libsodium-wrappers',
    'libsodium',
    'bitcoinjs-lib',
    'tiny-secp256k1',
    '@meshsdk/core',
    '@meshsdk/common',
    '@meshsdk/core-cst',
    '@meshsdk/provider',
    '@cardano-sdk/crypto',
    '@sidan-lab/sidan-csl-rs-nodejs',
    '@sidan-lab/bitcoin-core'
  ],
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false, 
      },
    });

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
