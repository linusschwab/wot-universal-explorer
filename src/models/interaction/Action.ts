import {InteractionPattern} from "./InteractionPattern";
import {InputSchema, OutputSchema} from "../schema";
import {Operation} from "../links";


export class Action extends InteractionPattern {

    public outputSchema: OutputSchema;
    public inputSchema: InputSchema;

    constructor(name: string, outputSchema: OutputSchema, inputSchema: InputSchema) {
        super(name);
        this.outputSchema = outputSchema;
        this.inputSchema = inputSchema;
    }

    public async invoke(data: any = null) {
        // TODO: Choose correct link
        return this.links[0].execute(data);
    }

    public toString() {
        return this.name + ' action';
    }

    public get url() {
        return '/' + this.thing.name + '/actions/' + this.name;
    }

    public get operations(): Operation[] {
        return [new Operation('post', 'invoke ' + this.name, this)];
    }

}
