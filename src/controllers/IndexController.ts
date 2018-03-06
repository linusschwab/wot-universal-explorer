import * as Router from "koa-router";
import * as send from "koa-send";
import {Context} from "koa";


export class IndexController {

    public router: Router;

    constructor() {
        this.router = this.routes();
    }

    public routes(): Router {
        const router = new Router();

        router.get('/*', this.getSwaggerUI.bind(this));

        return router;
    }

    public async getSwaggerUI(ctx: Context) {
        const rootPath = '../public/swagger-ui/';

        if (ctx.path === '/') {
            await send(ctx, 'index.html', {root: rootPath});
        } else {
            await send(ctx, ctx.path, {root: rootPath});
        }
    }
}
