import { Queue } from "./queue.js";

export class RequestHandler {
  constructor() {
    this.queues = {};
  }

  async request(url, method, body) {
    const key = this.simplify(url, method);

    if (!this.queues[key]) {
      this.queues[key] = new Queue();
    }

    return await this.queues[key].push(url, method, body);
  }

  simplify(url, method) {
    // deno-fmt-ignore
    let res = url.replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, (match, p) => p === "channels" || p === "guilds" || p === "webhooks" ? match : `/${p}/:id`).replace(/\/reactions\/[^/]+/g, "/reactions/:id").replace(/\/reactions\/:id\/[^/]+/g, "/reactions/:id/:userID").replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token").replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token");
    if (method === "DELETE") {
      res = `${res} D`;
    }
    return res;
  }
}
