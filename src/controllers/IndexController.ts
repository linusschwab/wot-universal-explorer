import * as Router from "koa-router";
import {Context} from "koa";


export class IndexController {

    public router: Router;

    constructor() {
        this.router = this.routes();
    }

    public routes(): Router {
        const router = new Router();

        router.get('/', this.getIndex.bind(this));

        return router;
    }

    // TODO: Serve Swagger UI
    public getIndex(ctx: Context) {
        ctx.body = 'Universal Explorer for the Web of Things';
    }
}
