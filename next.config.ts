import "dotenv/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/admin/bulkSignUp",
        destination: "/admin/bulk-sign-up",
        permanent: true,
      },
      {
        source: "/admin/uploaddrivercode",
        destination: "/admin/upload-driver-code",
        permanent: true,
      },
      {
        source: "/admin/uploadcomplexitycases",
        destination: "/admin/upload-complexity-cases",
        permanent: true,
      },
      {
        source: "/admin/uploadComplexityGenerator",
        destination: "/admin/upload-complexity-generator",
        permanent: true,
      },
      {
        source: "/dashboard/student/problemlist",
        destination: "/dashboard/student/problem-list",
        permanent: true,
      },
      {
        source: "/dashboard/student/seeresults/:id",
        destination: "/dashboard/student/results/:id",
        permanent: true,
      },
      {
        source: "/dashboard/student/seeresults/:id/airesults",
        destination: "/dashboard/student/results/:id/ai-results",
        permanent: true,
      },
      {
        source: "/dashboard/teacher/students/creategroup",
        destination: "/dashboard/teacher/students/create-group",
        permanent: true,
      },
      {
        source: "/dashboard/teacher/test/edit/:id",
        destination: "/dashboard/teacher/tests/edit/:id",
        permanent: true,
      },
      {
        source: "/dashboard/teacher/test/seeresults/:id",
        destination: "/dashboard/teacher/tests/results/:id",
        permanent: true,
      },
      {
        source: "/dashboard/teacher/test/seeresults/:id/airesults",
        destination: "/dashboard/teacher/tests/results/:id/ai-results",
        permanent: true,
      },
      {
        source: "/test/starttest/:id",
        destination: "/tests/start/:id",
        permanent: true,
      },
      {
        source: "/test/givetest/:id",
        destination: "/tests/attempt/:id",
        permanent: true,
      },
      {
        source: "/problemlist",
        destination: "/problem-list",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
    ],
  },
};

export default nextConfig;
