/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
        port: "",
        pathname: "/images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', ''),
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
