import * as Router from "koa-router";
import * as send from "koa-send";
import {Context} from "koa";
import {BaseController} from "./BaseController";


export class IndexController extends BaseController {

    constructor() {
        super(null);
    }

    public routes(): Router {
        const router = new Router();

        router.get('/*', this.getIndex.bind(this));

        return router;
    }

    public async getIndex(ctx: Context) {
        if (ctx.path.startsWith('/demo')) {
            await send(ctx, ctx.path, {root: './public', index: 'index.html'});
        } else {
            await send(ctx, ctx.path, {root: './public/swagger-ui/', index: 'index.html'});
        }
    }
}
