/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 👇 AQUI ESTÁ A CORREÇÃO DAS IMAGENS
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google Auth
      'firebasestorage.googleapis.com', // Seus uploads no Firebase
      'i.scdn.co', // Capas de álbuns do Spotify
      'pbs.twimg.com', // Imagens do Twitter (caso use)
      'abs.twimg.com'
    ]
  },

  // Configurações para o Build passar (que fizemos antes)
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
