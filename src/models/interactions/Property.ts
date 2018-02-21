import {Interaction} from "./Interaction";
import {OutputData} from "../data";


export class Property extends Interaction {

    public writable: boolean;

    constructor(name: string, outputData: OutputData, writable: boolean) {
        super(name);
        this.outputData = outputData;
        this.writable = writable;
    }

    public read(): any {
        // TODO: Implement
        return "test";
    }

    public write(value: any) {
        if (this.writable) {
            // TODO: Implement
            return true;
        }
        return false;
    }

    public toString() {
        return this.name + ' property';
    }

}
