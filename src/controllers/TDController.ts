import {NextFunction, Request, Response, Router} from "express";
import * as fs from "fs";
import {OpenAPIEncoder, TDParser} from "../tools";
import {ThingsManager} from "../models/thing";


export class TDController {

    private router: Router;
    private things: ThingsManager;

    constructor(router: Router, things: ThingsManager) {
        this.router = router;
        this.things = things;
        this.registerRoutes();
    }

    public registerRoutes() {
        const base = '/td';

        this.router.post(base + '/add', this.postTD.bind(this));
        this.router.get(base + '/:name', this.getTD.bind(this));

        // TODO: Remove
        this.router.get('/test', this.test.bind(this));
    }

    public async postTD(req: Request, res: Response) {
        try {
            let thing = TDParser.parse(req.body);
            this.things.addThing(thing);

            // Regenerate openapi file
            let json = OpenAPIEncoder.encode(this.things);

            fs.writeFile('../public/swagger-ui/openapi.json', json, 'utf8', (err) => {
                if (err) {
                    console.log(err.message);
                }
            });

            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.send("");
        } catch (e) {
            res.status(400);
            res.send(e.message);
        }
    }

    public async getTD(req: Request, res: Response) {
        let name = req.params['name'];

        // TODO: Return TD generated from thing instead
        let td = fs.readFileSync('../public/td/' + name + '.jsonld', 'utf8');

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(td);
    }

    public async test(req: Request, res: Response) {
        let thing = this.things.getThing('counter');

        if (thing === null) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.send("Counter Thing does not exist");
            return;
        }

        try {
            let test;
            test = await thing.invokeAction('increment');
            await thing.writeProperty('count', 10);

            test = await thing.readProperty('count');
            //thing.invokeAction('status');

            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.send(test.data);
        } catch(e) {
            if (e instanceof TypeError) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.send(e.message);
            } else {
                throw e;
            }
        }
    }
}
