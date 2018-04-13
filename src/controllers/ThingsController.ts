import * as Router from "koa-router";
import * as WebSocket from "ws";

import {Context} from "koa";
import {Thing, ThingsManager} from "../models/thing";
import {InteractionError, RequestError, TimeoutError} from "../tools/errors";
import {BaseController} from "./BaseController";
import {WebSocketManager} from "./WebSocketManager";


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
            case 'addSubscription':
                this.wsSubscribe(thing, ws, message);
                break;
            case 'removeSubscription':
                this.wsUnsubscribe(thing, ws, message);
                break;
            case 'addPropertySubscription':
                this.wsSubscribeProperty(thing, ws, message);
                break;
            case 'removePropertySubscription':
                this.wsUnsubscribeProperty(thing, ws, message);
                break;
            case 'addActionSubscription':
                this.wsSubscribeAction(thing, ws, message);
                break;
            case 'removeActionSubscription':
                this.wsUnsubscribeAction(thing, ws, message);
                break;
            case 'addEventSubscription':
                this.wsSubscribeEvent(thing, ws, message);
                break;
            case 'removeEventSubscription':
                this.wsUnsubscribeEvent(thing, ws, message);
                break;
            default:
                throw new RequestError('Unknown messageType');
        }
    }

    public async getThings(ctx: Context) {
        // TODO: Return more than names? Available interactions?
        ctx.body = this.things.getThingsNames();
    }

    public async wsSubscribe(thing: Thing, ws: WebSocket, message: any) {
        thing.subscribe(ws);
        WebSocketManager.confirm(ws, message.messageType, 'Subscribed to all interactions');
    }

    public async wsUnsubscribe(thing: Thing, ws: WebSocket, message: any) {
        thing.unsubscribe(ws);
        WebSocketManager.confirm(ws, message.messageType, 'Unsubscribed from all interactions');
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

    public async wsSubscribeProperty(thing: Thing, ws: WebSocket, message: any) {
        for (let property in message.data) {
            try {
                thing.subscribeToProperty(property, ws);
                WebSocketManager.confirm(ws, message.messageType, 'Subscribed to property ' + property);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    public async wsUnsubscribeProperty(thing: Thing, ws: WebSocket, message: any) {
        for (let property in message.data) {
            try {
                thing.unsubscribeFromProperty(property, ws);
                WebSocketManager.confirm(ws, message.messageType, 'Unsubscribed from property ' + property);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
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

    public async wsSubscribeAction(thing: Thing, ws: WebSocket, message: any) {
        for (let action in message.data) {
            try {
                thing.subscribeToAction(action, ws);
                WebSocketManager.confirm(ws, message.messageType, 'Subscribed to action ' + action);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    public async wsUnsubscribeAction(thing: Thing, ws: WebSocket, message: any) {
        for (let action in message.data) {
            try {
                thing.unsubscribeFromAction(action, ws);
                WebSocketManager.confirm(ws, message.messageType, 'Unsubscribed from action ' + action);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
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

    public async wsSubscribeEvent(thing: Thing, ws: WebSocket, message: any) {
        for (let event in message.data) {
            try {
                thing.subscribeToEvent(event, ws);
                WebSocketManager.confirm(ws, message.messageType, 'Subscribed to event ' + event);
            } catch (e) {
                WebSocketManager.handleError(ws, e);
            }
        }
    }

    public async wsUnsubscribeEvent(thing: Thing, ws: WebSocket, message: any) {
        for (let event in message.data) {
            try {
                thing.unsubscribeFromEvent(event, ws);
                WebSocketManager.confirm(ws, message.messageType, 'Unsubscribed from event ' + event);
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
