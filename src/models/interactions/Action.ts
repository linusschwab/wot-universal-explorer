import {Interaction} from "./Interaction";
import {InputData, OutputData} from "../data";


export class Action extends Interaction {

    public inputData: InputData;

    constructor(name: string, outputData: OutputData, inputData: InputData) {
        super(name);
        this.outputData = outputData;
        this.inputData = inputData;
    }

    public async invoke() {
        // TODO: Choose correct link
        return this.links[0].execute();
    }

    public toString() {
        return this.name + ' action';
    }

}
