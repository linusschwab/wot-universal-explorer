import {Interaction} from "./Interaction";
import {OutputData} from "../data";


export class Event extends Interaction {

    constructor(name: string, outputData: OutputData) {
        super(name);
        this.outputData = outputData;
    }

    public toString() {
        return this.name + ' event';
    }
}
