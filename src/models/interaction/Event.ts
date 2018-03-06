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
        return 'Event ' + this.name;
    }

    public get url() {
        return '/' + this.thing.slug + '/events/' + this.slug;
    }

    public get operations(): Operation[] {
        return [new Operation('post', 'Subscribe to ' + this.toString(), this)];
    }
}
