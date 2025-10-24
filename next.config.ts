import type { NextConfig } from "next";
const { withAxiom } = require("next-axiom");

const nextConfig: NextConfig = withAxiom({
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
}); 


export default nextConfig;
