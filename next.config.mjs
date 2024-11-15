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
    ],
  },
};

export default nextConfig;
