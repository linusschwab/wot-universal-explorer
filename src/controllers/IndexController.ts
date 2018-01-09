import {NextFunction, Request, Response, Router} from "express";


export class IndexController {

    private title: string = "Web of Things Explorer";
    private router: Router;

    constructor(router: Router) {
        this.router = router;
        this.registerRoutes();
    }

    public registerRoutes() {
        this.router.get('/', this.getIndex.bind(this));
    }

    public getIndex(req: Request, res: Response, next: NextFunction) {
        res.locals.title = this.title;

        let options: Object = {
            "message": "Test"
        };

        res.render("index", options);
    }
}
