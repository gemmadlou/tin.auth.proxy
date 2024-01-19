import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

export default eventHandler(async (event) => {

  let isExcludedPath = (new RegExp(/.jpg|.png|.jpef|.+nuxt/)).test(event.path)

  let sessionCookie = getCookie(event, "__session");

  let jwkUrl = process.env.JWK_URL

  if (sessionCookie === undefined) {
    return await proxyRequest(event, process.env.AUTH_FE_URL.replace(/\/$/g, '') + event.path)
  }

  let targetUrl = (process.env.PROXY_TARGET_URL)
    .replace(/\/$/g, '') + event.path

  if (!isExcludedPath) {
    let decoded;

    try {
      const client = jwksClient({
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWK_URL
      });

      let key = await client.getSigningKey()

      decoded = jwt.verify(sessionCookie, await key.getPublicKey())

    } catch (error) {
      console.log({ error }, process.env.AUTH_FE_URL)
      return await proxyRequest(event, process.env.AUTH_FE_URL.replace(/\/$/g, '') + event.path)
    }

    return await proxyRequest(event, targetUrl, {
      headers: {
        user_id: decoded?.sub?.toString()
      }
    })

  }

  return await proxyRequest(event, targetUrl)

})
