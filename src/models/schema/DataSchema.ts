export class DataSchema {

    public type: string;
    public writable: boolean;
    public required: boolean;

    constructor(type: string, writable: boolean, required = true) {
        this.type = type;
        this.writable = writable;
        this.required = required;
    }

}
