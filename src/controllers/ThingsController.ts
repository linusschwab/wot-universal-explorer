import * as Router from "koa-router";
import * as WebSocket from "ws";

import {Context} from "koa";
import {Thing, ThingsManager} from "../models/thing";
import {InteractionError, RequestError, TimeoutError} from "../tools/errors";
import {BaseController} from "./BaseController";
import {WebSocketManager} from "./WebSocketManager";
import {isArray} from "util";
import {InteractionData, InteractionPattern, ISubscriber} from "../models/interactions";


export class ThingsController extends BaseController {

    public wsSubscribers: Map<WebSocket, ISubscriber>;

    constructor(things: ThingsManager) {
        super(things);
        this.wsSubscribers = new Map();
    }

    public routes() {
        const router = new Router();
        router.prefix('/things');

        router.get('/', this.getThings.bind(this));

        // Interactions
        router.get('/:name/properties/:property', this.getProperty.bind(this));
        router.put('/:name/properties/:property', this.putProperty.bind(this));
        router.post('/:name/actions/:action', this.postAction.bind(this));
        router.get('/:name/events/:event', this.getEvent.bind(this));

        return router;
    }

    public wsRoutes(thing: Thing, ws: WebSocket, message: any) {
        switch(message.messageType) {
            case 'subscribe':
                this.wsSubscribe(thing, ws, message);
                break;
            case 'unsubscribe':
                this.wsUnsubscribe(thing, ws, message);
                break;
            case 'addSubscription':
                this.wsAddSubscription(thing, ws, message);
                break;
            case 'removeSubscription':
                this.wsRemoveSubscription(thing, ws, message);
                break;
            case 'getProperty':
                this.wsGetProperty(thing, ws, message);
                break;
            case 'setProperty':
                this.wsSetProperty(thing, ws, message);
                break;
            case 'requestAction':
                this.wsRequestAction(thing, ws, message);
                break;
            default:
                throw new RequestError('Unknown messageType');
        }
    }

    public async getThings(ctx: Context) {
        // TODO: Return more than names? Available interactions?
        ctx.body = this.things.getThingsNames();
    }

    public async getProperty(ctx: Context) {
        let property = ctx.params['property'];

        let thing = await this.getThing(ctx);

        try {
            ctx.body = await thing.readProperty(property);
            ctx.status = 200;
        } catch (e) {
            this.handleError(ctx, e);
        }
    }

    public async putProperty(ctx: Context) {
        let property = ctx.params['property'];
        let data = ctx.request.body;

        let thing = await this.getThing(ctx);

        try {
            ctx.body = await thing.writeProperty(property, data);
            ctx.status = 200;
        } catch (e) {
            this.handleError(ctx, e);
        }
    }

    public async postAction(ctx: Context) {
        let action = ctx.params['action'];
        let data = ctx.request.body;

        let thing = await this.getThing(ctx);

        try {
            ctx.body = await thing.invokeAction(action, data);
            ctx.status = 200;
        } catch (e) {
            this.handleError(ctx, e);
        }
    }

    public async getEvent(ctx: Context) {
        let event = ctx.params['event'];
        let timestamp = ctx.query['timestamp'] ? ctx.query['timestamp'] : 0;
        let limit = ctx.query['limit'] ? ctx.query['limit'] : 10; // Default limit

        let thing = await this.getThing(ctx);

        try {
            // TODO: return data with date instead of (javascript) timestamp
            ctx.body = await thing.getEventData(event, timestamp * 1000, limit);
            ctx.status = 200;
        } catch (e) {
            this.handleError(ctx, e);
        }
    }

    public async wsSubscribe(thing: Thing, ws: WebSocket, message: any) {
        thing.subscribe(this.wsSubscriber(ws));
        WebSocketManager.confirm(ws, message.messageType, 'Subscribed to all interactions');
    }

    public async wsUnsubscribe(thing: Thing, ws: WebSocket, message: any) {
        thing.unsubscribe(this.wsSubscriber(ws));
        WebSocketManager.confirm(ws, message.messageType, 'Unsubscribed from all interactions');
    }

    public async wsAddSubscription(thing: Thing, ws: WebSocket, message: any) {
        if (message.data.hasOwnProperty('property') || message.data.hasOwnProperty('action') || message.data.hasOwnProperty('event')) {
            if (message.data.hasOwnProperty('property')) {
                this.wsSubscribeTo(thing, ws, message.data['property'], 'property');
            }
            if (message.data.hasOwnProperty('action')) {
                this.wsSubscribeTo(thing, ws, message.data['action'], 'action');
            }
            if (message.data.hasOwnProperty('event')) {
                this.wsSubscribeTo(thing, ws, message.data['event'], 'event');
            }
        } else {
            WebSocketManager.reject(ws, 'No interactions specified to subscribe to');
        }
    }

    public async wsRemoveSubscription(thing: Thing, ws: WebSocket, message: any) {
        if (message.data.hasOwnProperty('property') || message.data.hasOwnProperty('action') || message.data.hasOwnProperty('event')) {
            if (message.data.hasOwnProperty('property')) {
                this.wsUnsubscribeFrom(thing, ws, message.data['property'], 'property');
            }
            if (message.data.hasOwnProperty('action')) {
                this.wsUnsubscribeFrom(thing, ws, message.data['action'], 'action');
            }
            if (message.data.hasOwnProperty('event')) {
                this.wsUnsubscribeFrom(thing, ws, message.data['event'], 'event');
            }
        } else {
            WebSocketManager.reject(ws, 'No interactions specified to unsubscribe from');
        }
    }

    public async wsGetProperty(thing: Thing, ws: WebSocket, message: any) {
        for (let property in message.data) {
            try {
                let response = await thing.readProperty(property);
                ws.send(JSON.stringify({
                    messageType: 'propertyStatus',
                    data: {
                        [property]: response
                    }
                }));
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    public async wsSetProperty(thing: Thing, ws: WebSocket, message: any) {
        for (let property in message.data) {
            try {
                await thing.writeProperty(property, message.data[property]);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    public async wsRequestAction(thing: Thing, ws: WebSocket, message: any) {
        for (let action in message.data) {
            let data = message.data[action] ? message.data[action] : null;
            try {
                await thing.invokeAction(action, data);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    private wsSubscribeTo(thing: Thing, ws: WebSocket, interactions: string | string[], type: string) {
        if (!isArray(interactions)) {
            interactions = [interactions];
        }

        for (let interaction of interactions) {
            try {
                if (type === 'property') {
                    thing.subscribeToProperty(interaction, this.wsSubscriber(ws));
                } else if (type === 'action') {
                    thing.subscribeToAction(interaction, this.wsSubscriber(ws));
                } else if (type === 'event') {
                    thing.subscribeToEvent(interaction, this.wsSubscriber(ws));
                }
                WebSocketManager.confirm(ws, 'addSubscription', 'Subscribed to ' + type + ' ' + interaction);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    private wsUnsubscribeFrom(thing: Thing, ws: WebSocket, interactions: string | string[], type: string) {
        if (!isArray(interactions)) {
            interactions = [interactions];
        }

        for (let interaction of interactions) {
            try {
                if (type === 'property') {
                    thing.unsubscribeFromProperty(interaction, this.wsSubscriber(ws));
                } else if (type === 'action') {
                    thing.unsubscribeFromAction(interaction, this.wsSubscriber(ws));
                } else if (type === 'event') {
                    thing.unsubscribeFromEvent(interaction, this.wsSubscriber(ws));
                }
                WebSocketManager.confirm(ws, 'removeSubscription', 'Unsubscribed from ' + type + ' ' + interaction);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    private wsSubscriber(ws: WebSocket) {
        if (this.wsSubscribers.get(ws)) {
            return this.wsSubscribers.get(ws);
        }

        let subscriber = (interaction: InteractionPattern, data: InteractionData) => {
            WebSocketManager.notify(ws, interaction, data);
        };

        this.wsSubscribers.set(ws, subscriber);
        return subscriber;
    }

    private handleError(ctx: Context, e: Error) {
        if (e instanceof InteractionError || e instanceof RequestError) {
            ctx.throw(400, e.message);
        } else if (e instanceof TimeoutError) {
            ctx.throw(408, e.message);
        } else {
            throw e;
        }
    }
}
