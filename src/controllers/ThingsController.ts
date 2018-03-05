import * as Router from "koa-router";
import {Context} from "koa";
import {ThingsManager} from "../models/thing";


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
        const properties = '/:name/properties/:property';
        router.get(properties, this.getProperty.bind(this));
        router.put(properties, this.putProperty.bind(this));

        const actions = '/:name/actions/:action';
        router.post(actions, this.postAction.bind(this));

        const events = '/:name/events/:event';
        router.post(events, this.postEvent.bind(this));

        return router;
    }

    public async getThings(ctx: Context) {
        // TODO: Return more than names? Available interactions?
        ctx.body = this.things.getThingsNames();
    }

    public async getProperty(ctx: Context) {
        // TODO: Error handling (for all endpoints)
        let name = ctx.params['name'];
        let property = ctx.params['property'];

        let thing = this.things.getThing(name);
        let result = await thing.readProperty(property);

        ctx.body = result.data;
    }

    public async putProperty(ctx: Context) {
        let name = ctx.params['name'];
        let property = ctx.params['property'];
        let data = ctx.request.body;

        let thing = this.things.getThing(name);
        let result = await thing.writeProperty(property, data);

        ctx.body = result.data;
    }

    public async postAction(ctx: Context) {
        let name = ctx.params['name'];
        let action = ctx.params['action'];

        let thing = this.things.getThing(name);
        let result = await thing.invokeAction(action);

        ctx.body = result.data;
    }

    public async postEvent(ctx: Context) {
        let name = ctx.params['name'];
        let event = ctx.params['event'];

        // TODO: Implement

        ctx.body = 'Not implemented yet';
    }
}
