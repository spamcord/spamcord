import { wait } from "../utlis.js";

export class Queue {
  #requests;
  #token;

  constructor(_token) {
    this.#requests = [];
    this.#token = _token;
    this.isRunning = false;
  }

  push(url, method, body) {
    return new Promise((resolve, reject) => {
      this.#requests.push({ url, method, body, resolve, reject });

      if (!this.isRunning) {
        this.isRunning = true;
        this.execute();
      }
    });
  }

  async execute() {
    while (this.#requests.length !== 0) {
      const r = this.#requests[0];
      let res;

      try {
        res = await this.fetch(r.url, r.method, r.body);
      } catch (e) {
        await r.reject(e);
      }

      if ([429].includes(res.status)) {
        const response = await res.json();

        if (!response.retry_after) {
          await r.reject("Unknown rate limit time");
        }

        await wait(response.retry_after || 0);
      } else {
        this.#requests.shift();
        await r.resolve(res);
      }

      await wait(50);
    }
    this.isRunning = false
  }

  fetch(url, method, body, headers = {}) {
    return fetch(url, {
      method,
      headers: {
        "authorization": this.#token,
        "content-type": "application/json",
        ...headers,
      },
      body,
    });
  }
}
