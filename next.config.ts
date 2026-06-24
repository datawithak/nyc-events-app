import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s1.ticketm.net" },
      { protocol: "https", hostname: "**.ticketm.net" },
      { protocol: "https", hostname: "i.ticketweb.com" },
      { protocol: "https", hostname: "images.universe.com" },
      { protocol: "https", hostname: "seatgeekimages.com" },
      { protocol: "https", hostname: "**.eventbrite.com" },
      { protocol: "https", hostname: "**.ebstatic.com" },
      { protocol: "https", hostname: "**.meetup.com" },
      { protocol: "https", hostname: "**.secure.meetupstatic.com" },
      { protocol: "https", hostname: "**.img.evbuc.com" },
    ],
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
