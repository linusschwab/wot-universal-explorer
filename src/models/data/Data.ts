export class Data {

    public name: string;
    public type: string;
    public writable: boolean;
    public required: boolean;

    constructor(name: string, type: string, writable: boolean, required = true) {
        this.name = name;
        this.type = type;
        this.writable = writable;
        this.required = required;
    }

}
