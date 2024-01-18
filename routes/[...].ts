import { ofetch } from "ofetch";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

export default eventHandler(async (event) => {
  let targetUrl = (process.env.PROXY_TARGET_URL ?? "http://localhost:5173/")
    .replace(/\/$/g, '') + event.path

  let sessionCookie = getCookie(event, "__session");

  let jwkUrl = process.env.JWK_URL

  if (sessionCookie === undefined) {
    setResponseStatus(event, 401)
    return { error: "not signed in" };
  }

  try {
    const client = jwksClient({
      // rateLimit: true,
      // jwksRequestsPerMinute: 10, // Default value
      jwksUri: process.env.JWK_URL
    });

    let key = await client.getSigningKey()

    let decoded = jwt.verify(sessionCookie, await key.getPublicKey())

    console.log({ decoded })

    return await proxyRequest(event, targetUrl)
  } catch (error) {
    setResponseStatus(event, 403)
    return { error: "invalidToken" }
  }
})
