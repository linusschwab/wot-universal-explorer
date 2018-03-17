import * as Router from "koa-router";
import {Context} from "koa";
import {ThingsManager} from "../models/thing";
import {ThingError} from "../tools/errors";


export abstract class BaseController {

    public router: Router;
    protected things: ThingsManager;

    constructor(things: ThingsManager) {
        this.things = things;
        this.router = this.routes();
    }

    public abstract routes(): Router;

    protected async getThing(ctx: Context) {
        let name = ctx.params['name'];

        try {
            return this.things.getThing(name);
        } catch (e) {
            if (e instanceof ThingError) {
                ctx.throw(400, 'Thing ' + name + ' does not exist');
            } else {
                throw e;
            }
        }
    }
}
