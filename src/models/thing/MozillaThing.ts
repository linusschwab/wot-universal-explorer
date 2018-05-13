import * as WebSocket from "ws";

import {Thing} from "./Thing";
import {WebSocketManager} from "../../controllers";
import {InteractionData} from "../interactions";


export class MozillaThing extends Thing {

    public ws: WebSocket;
    private wsReconnecting = false;

    constructor(name: string, type: string, base: string) {
        super(name, type, base);
        this.setupWebSocket();
    }

    private async setupWebSocket() {
        let wsUrl = this.base.replace('http://', 'ws://');
        if (this.base.includes(process.env.MOZ_BASE)) {
            wsUrl += '?jwt=' + process.env.MOZ_AUTH;
        }

        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => this.wsConnected());
        this.ws.on('close', () => this.wsReconnect());
        this.ws.on('message', data => this.wsHandleMessage(data));
        this.ws.on('error', e => this.wsHandleError(e));
    }

    public async wsConnected() {
        if (this.wsReconnecting) {
            console.log('\x1b[32m%s\x1b[0m', 'Connected to ' + this.name + ' WebSocket');
            this.wsReconnecting = false;
        }

        // Subscribe to events
        for (let event of this.events) {
            this.ws.send(JSON.stringify({
                "messageType": "addEventSubscription",
                "data": {
                    [event.name]: {}
                }
            }));
        }
    }

    private async wsReconnect() {
        if (!this.wsReconnecting) {
            console.error('Lost connection to ' + this.name + ' WebSocket');
            this.wsReconnecting = true;
        }

        setTimeout(() => {
            this.setupWebSocket();
        }, 5000)
    }

    public async wsHandleMessage(data: WebSocket.Data) {
        let message: any;
        try {
            message = WebSocketManager.parseMessage(data);
        } catch (e) {
            return;
        }

        if (message.messageType === 'propertyStatus') {
            for (let propertyName in message.data) {
                try {
                    const property = this.getProperty(propertyName);
                    const data = new InteractionData(message.data[propertyName]);
                    property.update(data);
                } catch (e) {
                    // Do nothing
                }
            }
        } else if (message.messageType === 'event') {
            for (let eventName in message.data) {
                try {
                    const event = this.getEvent(eventName);
                    const payload = message.data[eventName];
                    const data = new InteractionData(payload.hasOwnProperty('data') ? payload.data : payload);
                    event.update(data);
                } catch (e) {
                    // Do nothing
                }
            }
        }
    }

    private async wsHandleError(e: Error) {
        if (!this.wsReconnecting) {
            console.error('Could not connect to ' + this.name + ' WebSocket (' + e.message + ')');
            this.wsReconnecting = true;
        }
    }
}
