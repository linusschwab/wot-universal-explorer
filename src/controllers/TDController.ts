import {NextFunction, Request, Response, Router} from "express";
import * as fs from "fs";
import {TDParser} from "../TDParser";
import {OpenAPIEncoder} from "../OpenAPIEncoder";
import {ThingsManager} from "../models/thing/ThingsManager";


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
        this.router.get(base + '/:name', this.getTD.bind(this));
    }

    // TODO: Change to post with TD in body
    public getTD(req: Request, res: Response, next: NextFunction) {
        let name = req.params['name'];
        let td = fs.readFileSync('../public/td/' + name + '.jsonld', 'utf8');

        let thing = TDParser.parse(td);
        this.things.addThing(thing);

        let json = OpenAPIEncoder.encode(thing);

        fs.writeFile('../public/swagger-ui/openapi.json', json, 'utf8', (err) => {
            if (err) {
                console.log(err.message);
            }
        });

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(json);
    }
}
