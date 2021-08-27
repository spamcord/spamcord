export class Request {
  constructor(endpoint, method) {
    this.url = `https://discord.com/api/${endpoint}`;
    this.key = this.simplifyURL(endpoint, method);
  }

  simplifyURL() {
    let results;
    // deno-fmt-ignore
    results = url.replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, (match, p) => (p === "channels" || p === "guilds" || p === "webhooks" ? match : `/${p}/:id`)) // deno-lint-ignore
        .replace(/\/reactions\/[^/]+/g, "/reactions/:id")
        .replace(/\/reactions\/:id\/[^/]+/g,"/reactions/:id/:userID")
        .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token")
    if (method === "DELETE") results = `${method} DELETE`;
    return results;
  }
}
