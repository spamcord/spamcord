import { Bucket } from "../bucket/ratelimits.js";

const RequestsBucket = new Bucket();

export class Request {
  constructor(url, method, body, options) {
    this.url = url;
    this.method = method;
    this.body = body;

    // deno-fmt-ignore
    this.baseURL = (options && options.baseURL) ? options.baseURL : "https://discord.com/api";

    RequestsBucket.registerRequest(this.key(), `${this.baseURL}/${url}`, {
      method: this.method,
      body: this.body,
    });
  }

  // Creadits to abalabahaha/eris
  key() {
    //deno-fmt-ignore
    return this.url
        .replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, (match, p) => (p === "channels" || p === "guilds" || p === "webhooks" ? match : `/${p}/:id`))
        .replace(/\/reactions\/[^/]+/g, "/reactions/:id")
        .replace(/\/reactions\/:id\/[^/]+/g,"/reactions/:id/:userID")
        .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token")
  }
}