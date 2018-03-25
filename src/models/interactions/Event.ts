import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";
import {Operation} from "../links";
import {InteractionData} from "./InteractionData";


export class Event extends InteractionPattern {

    public schema: DataSchema;

    constructor(name: string, schema: DataSchema) {
        super(name);
        this.schema = schema;
    }

    public async update() {
        // Only poll if regular event link
        if (this.links.length === 0) {
            return;
        }

        // TODO: Choose correct link
        const data = new InteractionData(await this.links[0].execute());
        this.data.push(data);
        this.notifySubscribers(data);
    }

    public toString() {
        return 'Event ' + this.name;
    }

    public get url() {
        return '/' + this.thing.slug + '/events/' + this.slug;
    }

    public get operations(): Operation[] {
        return [new Operation('post', 'Subscribe to ' + this.toString(), this)];
    }
}
