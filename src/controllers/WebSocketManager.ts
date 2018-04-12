import * as WebSocket from "ws";
import * as http from "http";
import {Thing, ThingsManager} from "../models/thing";
import {ControllerManager} from "../controllers";
import {RequestError, ThingError} from "../tools/errors";


export class WebSocketManager {

    public server: WebSocket.Server;
    private controllers: ControllerManager;
    private things: ThingsManager;

    public static port = 8080;

    constructor(controllers: ControllerManager, things: ThingsManager) {
        this.controllers = controllers;
        this.things = things;

        this.server = new WebSocket.Server({ port: WebSocketManager.port });
        this.server.on('connection', (ws, req) => this.connection(ws, req));
    }

    public async connection(ws: WebSocket, req: http.IncomingMessage) {
        try {
            const thing = this.getThing(req);

            ws.on('message', async (data) => this.handleMessage(ws, data, thing));

            ws.on('error', () => {
                // TODO: Remove subscriber
            });
            ws.on('close', () => {
                // TODO: Remove subscriber
            });

            ws.send('connected to ' + thing.name);
        } catch (e) {
            this.handleError(ws, e);
        }
    }

    private handleMessage(ws: WebSocket, data: WebSocket.Data, thing: Thing) {
        try {
            const message = this.parseMessage(data);
            this.controllers.things.wsRoutes(ws, message, thing);
        } catch (e) {
            this.handleError(ws, e);
        }
    }

    public parseMessage(data: WebSocket.Data) {
        let message: any;

        try {
            message = JSON.parse(<string>data);
        } catch (e) {
            throw new RequestError('Unable to parse message');
        }

        if (!message.hasOwnProperty('messageType') || !message.hasOwnProperty('data')) {
            throw new RequestError('Invalid message format');
        }

        return message;
    }

    public getThing(req: http.IncomingMessage) {
        // Match first part of path
        let path = req.url.match(/\/(.*?)(?:\/|$)/g);

        if (path && path.length == 1) {
            let name = path[0];
            return this.things.getThing(name);
        }
        throw new ThingError('Invalid thing name');
    }

    public handleError(ws: WebSocket, e: Error) {
        if (e instanceof ThingError) {
            ws.send(JSON.stringify({
                messageType: 'error',
                data: {
                    status: '404',
                    message: e.message
                }
            }));
            ws.close();
        } else if (e instanceof RequestError) {
            ws.send(JSON.stringify({
                messageType: 'error',
                data: {
                    status: '400',
                    message: e.message
                }
            }));
        } else {
            throw e;
        }
    }
}
