import * as Router from "koa-router";
import * as WebSocket from "ws";

import {Context} from "koa";
import {Thing, ThingsManager} from "../models/thing";
import {InteractionError, RequestError, TimeoutError} from "../tools/errors";
import {BaseController} from "./BaseController";
import {WebSocketManager} from "./WebSocketManager";
import {isArray} from "util";


export class ThingsController extends BaseController {

    constructor(things: ThingsManager) {
        super(things);
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
        thing.subscribe(ws);
        WebSocketManager.confirm(ws, message.messageType, 'Subscribed to all interactions');
    }

    public async wsUnsubscribe(thing: Thing, ws: WebSocket, message: any) {
        thing.unsubscribe(ws);
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

    private wsSubscribeTo(thing: Thing, ws: WebSocket, interactions: string | string[], type: string) {
        if (!isArray(interactions)) {
            interactions = [interactions];
        }

        for (let interaction of interactions) {
            try {
                if (type === 'property') {
                    thing.subscribeToProperty(interaction, ws);
                } else if (type === 'action') {
                    thing.subscribeToAction(interaction, ws);
                } else if (type === 'event') {
                    thing.subscribeToEvent(interaction, ws);
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
                    thing.unsubscribeFromProperty(interaction, ws);
                } else if (type === 'action') {
                    thing.unsubscribeFromAction(interaction, ws);
                } else if (type === 'event') {
                    thing.unsubscribeFromEvent(interaction, ws);
                }
                WebSocketManager.confirm(ws, 'removeSubscription', 'Unsubscribed from ' + type + ' ' + interaction);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
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
