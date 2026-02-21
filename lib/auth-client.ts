import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"



export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "https://codecoliseum-express-101490724745.us-central1.run.app",
    plugins: [
        inferAdditionalFields<typeof auth>()
    ]
})