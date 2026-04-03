export function getBackendURL() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_DOMAIN || "http://api.codecoliseum.in/"
  );
}
