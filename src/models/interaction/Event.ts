import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";


export class Event extends InteractionPattern {

    public schema: DataSchema;

    constructor(name: string, schema: DataSchema) {
        super(name);
        this.schema = schema;
    }

    public toString() {
        return this.name + ' event';
    }
}
