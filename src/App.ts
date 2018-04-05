import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as cors from "@koa/cors";
import * as WebSocket from "ws";
import * as fs from "fs";

import {Server} from "http";
import {IndexController, TDController, ThingsController} from "./controllers";
import {ThingsManager} from "./models/thing";
import {MozillaTDParser, OpenAPIEncoder, TDParser} from "./tools";


export class App {

    public koa: Koa;
    public server: Server;
    public wss: WebSocket.Server;
    public things: ThingsManager;

    // TODO: Introduce controller manager?
    private tdController: TDController;
    private indexController: IndexController;
    private thingsController: ThingsController;

    public static instance: App;
    public static port: number;
    public static url: string;

    public static run() {
        this.instance = new App();
        this.port = Number(process.env.PORT) || 5000;
        this.url = 'http://localhost:' + this.port;

        this.instance.server = this.instance.koa.listen(this.port);
        this.instance.setupWebsocket();
        this.instance.importTD();

        console.log('Server listening on port ' + this.port);
    }

    constructor() {
        this.koa = new Koa();
        this.things = new ThingsManager();

        this.setupMiddleware();
        this.setupControllers();
        this.setupRoutes();
    }

    private setupMiddleware() {
        // Mount logger
        this.koa.use(async (ctx, next) => {
            const start = Date.now();
            await next();
            const ms = Date.now() - start;
            console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
        });

        // Mount body parser
        this.koa.use(bodyParser({strict: false}));

        // Enable CORS
        this.koa.use(cors());

        // Set defaults
        this.koa.use(async (ctx, next) => {
            ctx.set('Content-Type', 'application/json');
            await next();
        });
    }

    private setupControllers() {
        this.tdController = new TDController(this.things);
        this.thingsController = new ThingsController(this.things);
        this.indexController = new IndexController();
    }

    private setupRoutes() {
        this.koa.use(this.tdController.router.routes());
        this.koa.use(this.thingsController.router.routes());
        // Must be defined last (generic route to serve static files)
        this.koa.use(this.indexController.router.routes());
    }

    private setupWebsocket() {
        this.wss = new WebSocket.Server({ port: 8080 });
        this.wss.on('connection', (ws, req) => {
            this.thingsController.wsConnection(ws, req);
        });
    }

    private importTD() {
        // Parse td files to things
        const tdPath = '../public/td/';
        fs.readdirSync(tdPath).forEach(file => {
            let td = fs.readFileSync(tdPath + file, 'utf8');
            let thing = TDParser.parse(td);
            this.things.addThing(thing);
        });

        // Parse moz-td files to things
        const mozTDPath = '../public/td-moz/';
        fs.readdirSync(mozTDPath).forEach(file => {
            let td = fs.readFileSync(mozTDPath + file, 'utf8');
            let thing = MozillaTDParser.parse(td);
            this.things.addThing(thing);
        });

        // Generate openapi file from things
        let json = OpenAPIEncoder.encode(this.things);
        fs.writeFile('../public/swagger-ui/openapi.json', json, 'utf8', (err) => {
            if (err) {
                console.log(err.message);
            }
        });
    }
}
