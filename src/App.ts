import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as cors from "@koa/cors";
import * as fs from "fs";

import {IndexController, TDController, ThingsController} from "./controllers";
import {ThingsManager} from "./models/thing";
import {MozillaTDParser, OpenAPIEncoder, TDParser} from "./tools";


export class App {

    public koa: Koa;
    public things: ThingsManager;

    static instance: App;

    public static run(): Koa {
        this.instance = new App();
        return this.instance.koa;
    }

    constructor() {
        this.koa = new Koa();
        this.things = new ThingsManager();

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

        // Create routes
        this.routes();
    }

    private routes() {
        const td = new TDController(this.things);
        this.koa.use(td.router.routes());

        const things = new ThingsController(this.things);
        this.koa.use(things.router.routes());

        // Must be defined last (generic route to serve static files)
        const index = new IndexController();
        this.koa.use(index.router.routes());
    }

    public importTD() {
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
