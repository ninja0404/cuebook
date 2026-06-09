/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compile workspace packages from source (JIT internal packages).
  transpilePackages: ["@cuebook/api", "@cuebook/core", "@cuebook/db", "@cuebook/config"],
}

export default nextConfig
