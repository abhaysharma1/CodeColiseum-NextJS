// import "dotenv/config";
export function getBackendURL() {
  return process.env.NEXT_PUBLIC_BACKEND_DOMAIN || "https://api.codecoliseum.in";
}
