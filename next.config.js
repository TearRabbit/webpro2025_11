// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // 他のNext.js設定...
    env: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL, // <<< この行を追加
    },
  };
  
  module.exports = nextConfig;