import {DataSchema} from "./DataSchema";


export class InputSchema extends DataSchema {

    constructor(type: string) {
        super(type, true, true);
    }

}
