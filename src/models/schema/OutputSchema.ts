import {DataSchema} from "./DataSchema";


export class OutputSchema extends DataSchema {

    constructor(type: string) {
        super(type, false, false);
    }

}
