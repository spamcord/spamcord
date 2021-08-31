import { RequestHandler } from "../mod.js";
import "https://deno.land/x/dotenv/load.ts";

const _request = new RequestHandler();

for (let i = 0; i < 3; i++) {
    _request.request(
        Deno.env.get("WEBHOOK_URL"),
        "POST",
        JSON.stringify({
            content: "Hello from Spamcord",
    }),
  ).then((r) => console.log(r));
}
