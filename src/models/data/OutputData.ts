import {Data} from "./Data";


export class OutputData extends Data {

    constructor(name: string, type: string, writable = false, required = false) {
        super(name, type, writable, required);
    }

}
