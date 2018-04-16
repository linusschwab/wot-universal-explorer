import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";
import {Operation} from "../links";
import {InteractionData} from "./InteractionData";
import {TimeoutError} from "../../tools/errors";


export class Event extends InteractionPattern {

    public schema: DataSchema;

    constructor(name: string, schema: DataSchema) {
        super(name);
        this.schema = schema;
    }

    public async poll() {
        // TODO: Choose correct link
        return this.links[0].execute(null);
    }

    public async update() {
        // Only poll if regular event link
        if (this.links.length === 0) {
            return;
        }

        try {
            const data = new InteractionData(await this.poll());

            // Check if data changed
            if (this.newData(data)) {
                this.storeData(data);
                this.notifySubscribers(data);
            }
        } catch (e) {
            if (e instanceof TimeoutError === false) {
                throw e;
            }
        }
    }

    public getData(newerThan: number = 0, limit: number = 0) {
        let newData: InteractionData[] = [];
        if (newerThan > 0) {
            for (let data of this.data) {
                if (data.timestamp > newerThan) {
                    newData.push(data);
                }
            }
        } else {
            newData = this.data;
        }
        return newData.slice(-limit);
    }

    public async notifySubscribers(data: InteractionData) {
        for (let ws of this.subscribers) {
            ws.send(JSON.stringify({
                messageType: 'event',
                data: data.toString()
            }));
        }
    };

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
