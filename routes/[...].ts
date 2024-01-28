import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

export default eventHandler(async (event) => {

  if (event.path.startsWith("/session")) {
    console.log("Go through to Auth UI")
    return await proxyRequest(event, process.env.AUTH_FE_URL.replace(/\/$/g, '') + event.path)
  } 

  if (!event.context.auth) {
    console.log('Auth required', event.path)
    if (event.headers.get("content-type") === "application/json") {
      setResponseStatus(event, 401);
      return
    }
    return await sendRedirect(event, "/session");
  }

  let targetUrl = (process.env.PROXY_TARGET_URL)
    .replace(/\/$/g, '') + event.path

  return await proxyRequest(event, targetUrl, {
    headers: {
      "X-Forwarded-User": event.context?.auth?.sub?.toString(),
      "X-Forwarded-Tenant": event.context?.auth?.org_id?.toString(),
      "X-Forwarded-Tenant-Role": event.context?.auth?.org_role?.toString()
    }
  })

})
