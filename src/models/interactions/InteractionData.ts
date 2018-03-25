export class InteractionData {

    public timestamp: number;
    public data: any;

    constructor(data: any) {
        this.timestamp = Date.now();
        this.data = data;
    }

    public toString() {
        return {
            time: this.date,
            data: this.data
        }
    }

    get time() {
        return new Date(this.timestamp).toLocaleTimeString('de-CH');
    }

    get date() {
        return new Date(this.timestamp).toLocaleString('de-CH');
    }
}