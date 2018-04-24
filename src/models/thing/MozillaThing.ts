import * as WebSocket from "ws";

import {Thing} from "./Thing";
import {WebSocketManager} from "../../controllers";
import {InteractionData} from "../interactions";


export class MozillaThing extends Thing {

    public ws: WebSocket;

    constructor(name: string, type: string, base: string) {
        super(name, type, base);
        this.setupWebSocket();
    }

    private setupWebSocket() {
        let wsUrl = this.base.replace('http://', 'ws://');
        if (this.base.includes(process.env.MOZ_BASE)) {
            wsUrl += '?jwt=' + process.env.MOZ_AUTH;
        }

        // TODO: Handle error(s)
        this.ws = new WebSocket(wsUrl);

        this.ws.on('message', data => this.wsHandleMessage(data));
    }

    public wsHandleMessage(data: WebSocket.Data) {
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
        }
    }
}
