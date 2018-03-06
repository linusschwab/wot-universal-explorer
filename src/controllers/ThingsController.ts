import * as Router from "koa-router";
import {Context} from "koa";
import {ThingsManager} from "../models/thing";
import {InteractionError, TimeoutError} from "../tools/errors";


export class ThingsController {

    public router: Router;
    private things: ThingsManager;

    constructor(things: ThingsManager) {
        this.things = things;
        this.router = this.routes();
    }

    public routes() {
        const router = new Router();
        router.prefix('/things');

        router.get('/', this.getThings.bind(this));

        // Interactions
        router.get('/:name/properties/:property', this.getProperty.bind(this));
        router.put('/:name/properties/:property', this.putProperty.bind(this));
        router.post('/:name/actions/:action', this.postAction.bind(this));
        router.post('/:name/events/:event', this.postEvent.bind(this));

        return router;
    }

    public async getThings(ctx: Context) {
        // TODO: Return more than names? Available interactions?
        ctx.body = this.things.getThingsNames();
    }

    public async getProperty(ctx: Context) {
        let property = ctx.params['property'];

        let thing = await this.getThing(ctx);

        try {
            let result = await thing.readProperty(property);
            ctx.body = result.data;
        } catch (e) {
            await this.handleError(ctx, e);
        }
    }

    public async putProperty(ctx: Context) {
        let property = ctx.params['property'];
        let data = ctx.request.body;

        let thing = await this.getThing(ctx);

        try {
            let result = await thing.writeProperty(property, data);
            ctx.body = result.data;
        } catch (e) {
            await this.handleError(ctx, e);
        }
    }

    public async postAction(ctx: Context) {
        let action = ctx.params['action'];
        let data = ctx.request.body;

        let thing = await this.getThing(ctx);

        try {
            let result = await thing.invokeAction(action, data);
            ctx.body = result.data;
        } catch (e) {
            await this.handleError(ctx, e);
        }
    }

    public async postEvent(ctx: Context) {
        let event = ctx.params['event'];

        // TODO: Implement

        ctx.body = 'Not implemented yet';
    }

    private async getThing(ctx: Context) {
        let name = ctx.params['name'];
        let thing = this.things.getThing(name);

        if (thing === null) {
            ctx.throw(400, 'Thing ' + name + ' does not exist');
        }

        return thing;
    }

    private async handleError(ctx: Context, e: Error) {
        if (e instanceof InteractionError) {
            ctx.throw(400, e.message);
        } if (e instanceof TimeoutError) {
            ctx.throw(408, e.message);
        } else {
            throw e;
        }
    }
}
