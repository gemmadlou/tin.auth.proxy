import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    event.context.auth = undefined;

    let sessionCookie = getCookie(event, "__session");

    if (sessionCookie) {
        try {
            const client = jwksClient({
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: process.env.JWK_URL
            });

            let key = await client.getSigningKey()

            event.context.auth = jwt.verify(sessionCookie, await key.getPublicKey())

            console.debug('Cookie handled', event.path)

        } catch (error) {
            console.error('Cookie handling error', { error }, process.env.AUTH_FE_URL, event.path)
        }

    }
    
})  