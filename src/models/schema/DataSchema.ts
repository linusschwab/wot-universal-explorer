export class DataSchema {

    public type: string;
    public writable: boolean;
    public required: boolean;

    constructor(type: string, writable: boolean, required = true) {
        this.type = type;
        this.writable = writable;
        this.required = required;
    }

    // See: https://w3c.github.io/wot-thing-description/#simple-type-list
    public isSimpleType() {
        return (
            this.type === 'boolean' ||
            this.type === 'integer' ||
            this.type === 'number' ||
            this.type === 'string'
        );
    }
}
