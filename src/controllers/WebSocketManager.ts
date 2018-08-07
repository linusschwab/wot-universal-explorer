import * as WebSocket from "ws";
import * as http from "http";

import {Server} from "http";
import {Thing, ThingsManager} from "../models/thing";
import {ControllerManager} from "../controllers";
import {InteractionError, RequestError, ThingError, TimeoutError} from "../tools/errors";
import {Action, Event, InteractionData, InteractionPattern, Property} from "../models/interactions";


export class WebSocketManager {

    public server: WebSocket.Server;
    private controllers: ControllerManager;
    private things: ThingsManager;

    constructor(server: Server, controllers: ControllerManager, things: ThingsManager) {
        this.controllers = controllers;
        this.things = things;

        this.server = new WebSocket.Server({ server });
        this.server.on('connection', (ws, req) => this.connection(ws, req));
    }

    public async connection(ws: WebSocket, req: http.IncomingMessage) {
        try {
            const thing = this.getThing(req);

            ws.on('message', async (data) => this.handleMessage(thing, ws, data));

            ws.on('error', () => {
                thing.unsubscribe(this.controllers.things.wsSubscribers.get(ws));
            });
            ws.on('close', () => {
                thing.unsubscribe(this.controllers.things.wsSubscribers.get(ws));
            });
        } catch (e) {
            WebSocketManager.handleError(ws, e);
        }
    }

    public handleMessage(thing: Thing, ws: WebSocket, data: WebSocket.Data) {
        try {
            const message = WebSocketManager.parseMessage(data);
            this.controllers.things.wsRoutes(thing, ws, message);
        } catch (e) {
            WebSocketManager.handleError(ws, e);
        }
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

    public static parseMessage(data: WebSocket.Data) {
        let message: string;

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

    public static notify(ws: WebSocket, interaction: InteractionPattern, data: InteractionData) {
        if (interaction instanceof Property) {
            ws.send(JSON.stringify({
                messageType: 'propertyStatus',
                data: {
                    [interaction.name]: data.data
                }
            }));
        } else if (interaction instanceof Action) {
            ws.send(JSON.stringify({
                messageType: 'action',
                data: {
                    [interaction.name]: data.data
                }
            }));
        } else if (interaction instanceof Event) {
            ws.send(JSON.stringify({
                messageType: 'event',
                data: {
                    [interaction.name]: data.data
                }
            }));
        }

    }

    public static confirm(ws: WebSocket, type: any, message: string) {
        ws.send(JSON.stringify({
            messageType: type,
            data: {
                status: '200',
                message: message
            }
        }));
    }

    public static reject(ws: WebSocket, message: string) {
        ws.send(JSON.stringify({
            messageType: 'error',
            data: {
                status: '400',
                message: message
            }
        }));
    }

    public static handleError(ws: WebSocket, e: Error) {
        if (e instanceof ThingError) {
            ws.send(JSON.stringify({
                messageType: 'error',
                data: {
                    status: '404',
                    message: e.message
                }
            }));
            ws.close();
        } else if (e instanceof TimeoutError) {
            ws.send(JSON.stringify({
                messageType: 'error',
                data: {
                    status: '408',
                    message: e.message
                }
            }));
        } else if (e instanceof RequestError || e instanceof InteractionError) {
            WebSocketManager.reject(ws, e.message);
        } else {
            throw e;
        }
    }
}
