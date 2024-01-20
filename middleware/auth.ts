import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    let sessionCookie = getCookie(event, "__session");

    let isExcludedPath = (new RegExp(/.jpg|.png|.jpef|._nuxt|.svg|.css|node_modules/))
        .test(event.path)

    if (sessionCookie && !isExcludedPath) {

        try {
            const client = jwksClient({
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: process.env.JWK_URL
            });

            let key = await client.getSigningKey()

            event.context.auth = jwt.verify(sessionCookie, await key.getPublicKey())

        } catch (error) {
            console.log({ error }, process.env.AUTH_FE_URL, event.path, "expired")
        }

    } else if (isExcludedPath) {
        event.context.skipAuth = true
    }
    
})  