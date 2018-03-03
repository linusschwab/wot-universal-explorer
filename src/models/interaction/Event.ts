import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";
import {Operation} from "../links";


export class Event extends InteractionPattern {

    public schema: DataSchema;

    constructor(name: string, schema: DataSchema) {
        super(name);
        this.schema = schema;
    }

    public toString() {
        return this.name + ' event';
    }

    public get url() {
        return '/' + this.thing.name + '/events/' + this.name;
    }

    public get operations(): Operation[] {
        return [new Operation('post', 'subscribe to ' + this.name, this)];
    }

}
