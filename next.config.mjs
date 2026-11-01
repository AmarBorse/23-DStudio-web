/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Photos uploaded through the admin are stored in Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};
export default nextConfig;
