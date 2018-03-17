import * as Router from "koa-router";
import * as fs from "fs";
import {OpenAPIEncoder, TDEncoder, TDParser} from "../tools";
import {ThingsManager} from "../models/thing";
import {Context} from "koa";
import {ThingError} from "../tools/errors/ThingError";
import {BaseController} from "./BaseController";


export class TDController extends BaseController {

    constructor(things: ThingsManager) {
        super(things);
    }

    public routes(): Router {
        const router = new Router();
        router.prefix('/td');

        router.post('/add', this.postTD.bind(this));
        router.get('/test', this.test.bind(this)); // TODO: Remove
        router.get('/:name', this.getTD.bind(this));

        return router;
    }

    public async postTD(ctx: Context) {
        try {
            let thing = TDParser.parse(ctx.request.body);
            this.things.addThing(thing);

            // Regenerate openapi file
            let json = OpenAPIEncoder.encode(this.things);

            fs.writeFile('../public/swagger-ui/openapi.json', json, 'utf8', (err) => {
                if (err) {
                    console.log(err.message);
                }
            });

            ctx.body = '';
        } catch (e) {
            ctx.throw(400, 'Invalid TD format');
        }
    }

    public async getTD(ctx: Context) {
        let thing = await this.getThing(ctx);
        ctx.body = TDEncoder.encode(thing);
    }

    public async test(ctx: Context) {
        let thing = this.things.getThing('counter');

        if (thing === null) {
            ctx.throw(400, 'Counter Thing does not exist');
        }

        try {
            let test;
            test = await thing.invokeAction('increment');
            await thing.writeProperty('count', 10);

            test = await thing.readProperty('count');
            //thing.invokeAction('status');

            ctx.body = test.data;
        } catch(e) {
            if (e instanceof TypeError) {
                ctx.throw(400, e.message);
            } else {
                throw e;
            }
        }
    }
}
