import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";


export class Property extends InteractionPattern {

    public schema: DataSchema;
    public writable: boolean;
    public observable: boolean;

    constructor(name: string, schema: DataSchema, writable: boolean, observable: boolean) {
        super(name);
        this.schema = schema;
        this.writable = writable;
        this.observable = observable;
    }

    public async read() {
        // TODO: Choose correct link
        return this.links[0].execute();
    }

    public async write(value: any) {
        if (this.writable) {
            // TODO: Choose correct link
            this.links[0].execute(value);
            return true;
        }
        return false;
    }

    public toString() {
        return this.name + ' property';
    }

}
