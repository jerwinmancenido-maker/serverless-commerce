const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
  async redirects() {
    return [
      {
        source: "/categories/peptide-blends",
        destination: "/categories/healing-tissue-repair-peptides",
        permanent: false,
      },
      {
        source: "/:countryCode/categories/peptide-blends",
        destination: "/:countryCode/categories/healing-tissue-repair-peptides",
        permanent: false,
      },
      {
        source: "/research-library/comparisons",
        destination: "/comparisons",
        permanent: false,
      },
      {
        source: "/:countryCode/research-library/comparisons",
        destination: "/:countryCode/comparisons",
        permanent: false,
      },
      {
        source: "/coas",
        destination: "/research-library?tab=coas",
        permanent: false,
      },
      {
        source: "/:countryCode/coas",
        destination: "/:countryCode/research-library?tab=coas",
        permanent: false,
      },
      {
        source: "/research-hub",
        destination: "/account/research-hub",
        permanent: false,
      },
      {
        source: "/:countryCode/research-hub",
        destination: "/:countryCode/account/research-hub",
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
