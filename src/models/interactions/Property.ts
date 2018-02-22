import {Interaction} from "./Interaction";
import {OutputData} from "../data";


export class Property extends Interaction {

    public writable: boolean;

    constructor(name: string, outputData: OutputData, writable: boolean) {
        super(name);
        this.outputData = outputData;
        this.writable = writable;
    }

    public async read() {
        // TODO: Choose correct link
        return this.links[0].execute();
    }

    public async write(value: any) {
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
