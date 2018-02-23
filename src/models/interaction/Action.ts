import {InteractionPattern} from "./InteractionPattern";
import {InputSchema, OutputSchema} from "../schema";


export class Action extends InteractionPattern {

    public outputSchema: OutputSchema;
    public inputSchema: InputSchema;

    constructor(name: string, outputSchema: OutputSchema, inputSchema: InputSchema) {
        super(name);
        this.outputSchema = outputSchema;
        this.inputSchema = inputSchema;
    }

    public async invoke() {
        // TODO: Choose correct link
        return this.links[0].execute();
    }

    public toString() {
        return this.name + ' action';
    }

}
