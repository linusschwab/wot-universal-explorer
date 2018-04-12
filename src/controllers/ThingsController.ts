import * as Router from "koa-router";
import * as WebSocket from "ws";

import {Context} from "koa";
import {Thing, ThingsManager} from "../models/thing";
import {InteractionError, RequestError, TimeoutError} from "../tools/errors";
import {BaseController} from "./BaseController";


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

    public wsRoutes(ws: WebSocket, message: any, thing: Thing) {
        switch(message.messageType) {
            case 'addEventSubscription':
                console.log('addEventSubscription');
                //this.wsSubscribeEvent(message.data);
                break;
            case 'addPropertySubscription':
                console.log('addPropertySubscription');
                //this.wsSubscribeProperty(message.data);
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

    public async wsSubscribeProperty() {

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

    public async wsSubscribeEvent() {

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
