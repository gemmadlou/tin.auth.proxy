export default eventHandler(async (event) => {
  let targetUrl = (process.env.PROXY_TARGET_URL ?? "http://localhost:5173/")
    .replace(/\/$/g, '') + event.path

    return await proxyRequest(event, targetUrl)
})
