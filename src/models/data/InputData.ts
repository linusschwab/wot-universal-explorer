import {Data} from "./Data";


export class InputData extends Data {

    constructor(name: string, type: string, required = true) {
        super(name, type, true, required);
    }

}
