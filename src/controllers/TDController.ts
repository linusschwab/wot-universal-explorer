import {NextFunction, Request, Response, Router} from "express";
import * as fs from "fs";
import {TDParser} from "../TDParser";
import {OpenAPIEncoder} from "../OpenAPIEncoder";


export class TDController {

    private router: Router;

    constructor(router: Router) {
        this.router = router;
        this.registerRoutes();
    }

    public registerRoutes() {
        const base = '/td';
        this.router.get(base + '/:name', this.getTD.bind(this));
    }

    public getTD(req: Request, res: Response, next: NextFunction) {
        let name = req.params['name'];
        let td = fs.readFileSync('../public/td/' + name + '.jsonld', 'utf8');

        let thing = TDParser.parse(td);
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
