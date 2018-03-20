import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";
import {Operation} from "../links/Operation";
import {InteractionError} from "../../tools/errors";


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

    public async write(data: any) {
        if (this.writable) {
            // TODO: Choose correct link
            return this.links[0].execute(data);
        }
        throw new InteractionError('Property is not writable');
    }

    public toString() {
        return 'Property ' + this.name;
    }

    public get url() {
        return '/' + this.thing.slug + '/properties/' + this.slug;
    }

    public get operations(): Operation[] {
        let operations = [];

        operations.push(new Operation('get', 'Read ' + this.toString(), this));

        if (this.writable) {
            operations.push(new Operation('put', 'Write ' + this.toString(), this));
        }

        return operations;
    }
}
