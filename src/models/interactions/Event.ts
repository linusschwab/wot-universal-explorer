import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";
import {Operation} from "../links";
import {InteractionData} from "./InteractionData";
import {TimeoutError} from "../../tools/errors";


export class Event extends InteractionPattern {

    public schema: DataSchema;
    public data: InteractionData[];

    constructor(name: string, schema: DataSchema) {
        super(name);
        this.schema = schema;
        this.data = [];
    }

    public async update() {
        // Only poll if regular event link
        if (this.links.length === 0) {
            return;
        }

        try {
            // TODO: Choose correct link
            const data = new InteractionData(await this.links[0].execute());
            this.data.push(data);
            this.notifySubscribers(data);
        } catch (e) {
            if (e !instanceof TimeoutError) {
                throw e;
            }
        }
    }

    public getData(newerThan: number = 0) {
        if (!newerThan) {
            return this.data;
        }

        let newData = [];
        for (let data of this.data) {
            if (data.timestamp > newerThan) {
                newData.push(data);
            }
        }
        return newData;
    }

    public toString() {
        return 'Event ' + this.name;
    }

    public get url() {
        return '/' + this.thing.slug + '/events/' + this.slug;
    }

    public get operations(): Operation[] {
        return [new Operation('get', 'List of ' + this.name + ' Event data', this)];
    }
}
