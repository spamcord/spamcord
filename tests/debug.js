import {Gateway} from "../src/gateway/gateway.js";
import "https://deno.land/x/dotenv/load.ts";

const connection = new Gateway(Deno.env.get("TOKEN"));
connection.connect({
    intents: 32509,
    properties: {
        $os: Deno.build.$os,
        $browser: "Deno",
        $device: "Deno",
    },
    compress: false,
});

connection.ws.addEventListener(
    "message",
    (d) => console.log(JSON.parse(d.data)),
);

/*
setTimeout(() => {
    connection.ws.close()
    connection.ws = null
    connection.connect(connection.identifyData)
    connection.ws.addEventListener("message", (d) => console.log(JSON.parse(d.data)))
}, 3 * 1000)
*/
