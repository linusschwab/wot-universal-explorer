import {IndexController, TDController, ThingsController} from "./index";
import {ThingsManager} from "../models/thing";


export class ControllerManager {

    public td: TDController;
    public things: ThingsController;
    public index: IndexController;

    constructor(things: ThingsManager) {
        this.td = new TDController(things);
        this.things = new ThingsController(things);
        this.index = new IndexController();
    }
}
