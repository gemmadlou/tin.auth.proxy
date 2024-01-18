export default eventHandler(async (event) => {
  let targetUrl = (process.env.PROXY_TARGET_URL ?? "http://localhost:5173/")
    .replace(/\/$/g, '') + event.path

  let sessionCookie = getCookie(event, "__session");

  let jwkUrl = process.env.JWK_URL
  console.log({sessionCookie})

  if (sessionCookie === undefined) {
    setResponseStatus(event, 401)
    return { error: "not signed in" };
  }

  return await proxyRequest(event, targetUrl)
})
