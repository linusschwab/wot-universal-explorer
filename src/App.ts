import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as fs from "fs";

import {IndexController, TDController, ThingsController} from "./controllers";
import {ThingsManager} from "./models/thing";
import {OpenAPIEncoder, TDParser} from "./tools";


export class App {

    public express: express.Application;
    public things: ThingsManager;

    public static run(): express.Application {
        let instance = new App();
        return instance.express;
    }

    constructor() {
        this.express = express();
        this.things = new ThingsManager();

        // Add static paths
        this.express.use(express.static("../public"));

        // Configure pug
        this.express.set("views", "../views");
        this.express.set("view engine", "jade");

        // Mount logger
        this.express.use(logger("dev"));

        // Mount json form parser
        this.express.use(bodyParser.json());

        // Mount query string parser
        this.express.use(bodyParser.urlencoded({
            extended: true
        }));

        // Create routes
        this.routes();

        // Mount cookie parser middleware
        this.express.use(cookieParser("SECRET_GOES_HERE"));

        // Catch 404 and forward to error handler
        this.express.use((req: any, res: any, next: any) => {
            let err: any = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // Error handler
        this.express.use((err: any, req: any, res: any, next: any) => {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });

        this.importTD();
    }

    /**
     * Create routes
     */
    private routes() {
        let router: express.Router = express.Router();
        this.express.use('/', router);

        new IndexController(router);
        new TDController(router, this.things);
        new ThingsController(router, this.things);
    }

    private importTD() {
        // Parse td files to things
        const tdPath = '../public/td/';
        fs.readdirSync(tdPath).forEach(file => {
            let td = fs.readFileSync(tdPath + file, 'utf8');
            let thing = TDParser.parse(td);
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
