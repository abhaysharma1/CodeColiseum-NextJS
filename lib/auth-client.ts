import "dotenv/config"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"
import { getBackendURL } from "@/utils/utilities"


export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: getBackendURL(),
    plugins: [
        inferAdditionalFields<typeof auth>()
    ]
})