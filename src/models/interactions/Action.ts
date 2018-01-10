import {Interaction} from "./Interaction";
import {InputData, OutputData} from "../data";


export class Action extends Interaction {

    public inputData: InputData;

    constructor(name: string, outputData: OutputData, inputData: InputData) {
        super(name);
        this.outputData = outputData;
        this.inputData = inputData;
    }

    public toString() {
        return this.name + ' action';
    }

}
