import EventEmitter from "https://deno.land/x/eventemitter@1.2.1/mod.ts"
import { OP_CODES } from "../constants.js"

export class Gateway extends EventEmitter {
    #token
    constructor(_token, options) {
        super()

        if (!options) options = {}

        this.#token = _token
        this.connecting = false

        this.options = {
            url: options.url || "wss://gateway.discord.gg/?v=9&encoding=json"
        }

    }

    connect(data) {

        if(!data) {
            throw new Error("Missing identify data\nhttps://discord.com/developers/docs/topics/gateway#identify-identify-structure")
        }

        this.identifyData = data

        if (this.ws && this.ws.readyState != WebSocket.CLOSED) {
            throw new Error("Existing connection detected")
        }
        this.connecting = true;
        this.initializeWS()

    }

    initializeWS() {

        if (!this.#token) {
            throw new Error("Token not specified")
        }

        this.status = "connecting"

        this.ws = new WebSocket(this.options.url)

        this.ws.onopen = this._onOpen.bind(this)
        this.ws.onmessage = this._onMessage.bind(this)
        this.ws.onerror = this._onError
        this.ws.onclose = this._onClose

    }

    identify() {

        if(!this.identifyData) {
            throw new Error("Missing identify data\nhttps://discord.com/developers/docs/topics/gateway#identify-identify-structure")
        }

        this.ws.send(JSON.stringify({ op: OP_CODES.IDENTIFY, d: { token: this.#token, ...this.identifyData } }))
    }

    resume() {

        this.status = "resuming"
        this.ws.send(JSON.stringify({ op: OP_CODES.RESUME, d: { token: this.#token, session_id: this.sessionID, seq: this.seq }}))

    }

    heartbeat(regular) {
        // Can only heartbeat after resume succeeds, discord/discord-api-docs#1619
        if(this.status === "resuming") return

        if(regular) {

            if(!this.lastHeartbeatAck) {
                throw new Error("Server didn't acknowledge previous heartbeat, possible lost connection")
            }

            this.lastHeartbeatAck = false;

        }

        this.ws.send(JSON.stringify({ op: OP_CODES.HEARTBEAT, d: null, s: this.seq }))

    }

    _onOpen(d) {
        this.status = "handshaking"
        this.lastHeartbeatAck = true
    }

    _onMessage(d) {
        
        const data = JSON.parse(d.data)

        if (data.s) {
            if (data.s > this.seq + 1 && this.ws && this.status !== "resuming") {
                console.log(`Non-consecutive sequence (${this.seq} -> ${data.s})`)
            }
            this.seq = data.s;
        }

        switch (data.op) {

            case OP_CODES.EVENTS:
                this.emit(data.t, data.d)
                if(data.t === "READY") this.sessionID = data.d.session_id
                break

            case OP_CODES.HELLO:

                if (data.d.heartbeat_interval > 0) {
                    if (this.heartbeatInterval) {
                        clearInterval(this.heartbeatInterval);
                    }
                    this.heartbeatInterval = setInterval(() => this.heartbeat(true), data.d.heartbeat_interval);
                }

                this.connecting = false
                if (this.connectTimeout) {
                    clearTimeout(this.connectTimeout)
                }
                this.connectTimeout = null

                if (this.sessionID) {
                    this.resume()
                } else {
                    this.identify()
                    // Cannot heartbeat when resuming, discord/discord-api-docs#1619
                    this.heartbeat()
                }
                break
            
            case OP_CODES.HEARTBEAT_ACK:
                this.lastHeartbeatAck = true;
                break

        }

    }
    _onError(d) { console.log(d) }
    _onClose(d) { console.log(d) }

}