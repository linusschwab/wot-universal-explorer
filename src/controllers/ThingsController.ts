import {Request, Response, Router} from "express";
import {ThingsManager} from "../models/thing/ThingsManager";

export class ThingsController {

    private router: Router;
    private things: ThingsManager;

    constructor(router: Router, things: ThingsManager) {
        this.router = router;
        this.things = things;
        this.registerRoutes();
    }

    public registerRoutes() {
        const base = '/things';

        this.router.get(base, this.getThings.bind(this));

        // Interactions
        const properties = base + '/:name/properties/:property';
        this.router.get(properties, this.getProperty.bind(this));
        this.router.put(properties, this.putProperty.bind(this));

        const actions = base + '/:name/actions/:action';
        this.router.post(actions, this.postAction.bind(this));

        const events = base + '/:name/events/:event';
        this.router.post(events, this.postEvent.bind(this));
    }

    public async getThings(req: Request, res: Response) {
        // TODO: Return more than names? Available interactions?
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(this.things.getThingsNames());
    }

    public async getProperty(req: Request, res: Response) {
        // TODO: Error handling (for all endpoints)
        let name = req.params['name'];
        let property = req.params['property'];

        let thing = this.things.getThing(name);
        let result = await thing.readProperty(property);

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(result.data);
    }

    public async putProperty(req: Request, res: Response) {
        let name = req.params['name'];
        let property = req.params['property'];
        let data = req.body;

        let thing = this.things.getThing(name);
        let result = await thing.writeProperty(property, data);

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(result.data);
    }

    public async postAction(req: Request, res: Response) {
        let name = req.params['name'];
        let action = req.params['action'];

        let thing = this.things.getThing(name);
        let result = await thing.invokeAction(action);

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(result.data);
    }

    public async postEvent(req: Request, res: Response) {
        let name = req.params['name'];
        let event = req.params['event'];

        // TODO: Implement

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send('Not implemented yet.');
    }
}
