import * as Router from "koa-router";
import {Context} from "koa";
import {ThingsManager} from "../models/thing";
import {ThingError} from "../tools/errors";
import * as http from "http";


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
                ctx.throw(404, 'Thing ' + name + ' does not exist');
            } else {
                throw e;
            }
        }
    }

    protected async getThingWs(ws: WebSocket, req: http.IncomingMessage) {
        // Match first part of path
        let path = req.url.match(/\/(.*?)(?:\/|$)/g);

        if (path && path[1]) {

        }

        try {
            return this.things.getThing(name);
        } catch (e) {
            if (e instanceof ThingError) {
                ws.send(JSON.stringify({
                    messageType: 'error',
                    data: {
                        status: '400',
                        message: 'Thing ' + name + ' does not exist',
                    }
                }));
            } else {
                throw e;
            }
        }
    }
}
