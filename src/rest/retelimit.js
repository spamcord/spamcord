export class RateLimit {
  constructor(data) {
    this.global = data.global;
    this.limit = data.limit;
    this.bucket = data.bucket;
    this.reset = data.rest;

    this.request = {
      url: data.request.url,
      body: data.request.body,
      headers: data.request.headers,
    };

    this.key = data.key;
  }
}