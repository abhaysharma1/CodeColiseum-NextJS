import { NextRequest } from "next/server";
import crypto from "crypto";

export class SEBError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export function verifySEB(req: NextRequest) {
  console.log("---- SEB VERIFY START ----");

  const CONFIG_KEY = process.env.SEB_CONFIG_KEY; // RAW config key from SEB tool
  const receivedHash = req.headers.get("x-safeexambrowser-configkeyhash");

  if (!CONFIG_KEY) throw new SEBError("Server missing config key", 500);
  if (!receivedHash) throw new SEBError("Not opened in SEB");

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host");

  const url = `${proto}://${host}${req.nextUrl.pathname}${req.nextUrl.search}`;

  // 🔐 get absolute URL (without fragment)
  // const url = req.nextUrl.origin + req.nextUrl.pathname + req.nextUrl.search;

  console.log("URL:", url);
  console.log("ConfigKey:", CONFIG_KEY);
  console.log("Received:", receivedHash);

  // 🔐 generate expected hash
  const expectedHash = crypto
    .createHash("sha256")
    .update(url + CONFIG_KEY, "utf8")
    .digest("hex");

  console.log("Expected:", expectedHash);

  if (expectedHash !== receivedHash) {
    console.log("❌ SEB HASH INVALID");
    throw new SEBError("Invalid SEB configuration");
  }

  console.log("✅ SEB VERIFIED");
  console.log("---- SEB VERIFY END ----");
}
