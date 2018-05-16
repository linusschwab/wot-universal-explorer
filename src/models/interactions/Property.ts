import * as WebSocket from "ws";

import {InteractionPattern} from "./InteractionPattern";
import {DataSchema} from "../schema";
import {Operation} from "../links";
import {InteractionError, TimeoutError} from "../../tools/errors";
import {InteractionData} from "./InteractionData";


export class Property extends InteractionPattern {

    public schema: DataSchema;
    public writable: boolean;
    public observable: boolean;

    constructor(name: string, schema: DataSchema, writable: boolean, observable: boolean) {
        super(name);
        this.schema = schema;
        this.writable = writable;
        this.observable = observable;
    }

    public async read() {
        // TODO: Choose correct link
        return this.links[0].execute(null);
    }

    public async write(data: any) {
        if (this.writable) {
            // TODO: Choose correct link
            return this.links[0].execute(data);
        }
        throw new InteractionError('Property is not writable');
    }

    public async update(data: InteractionData = null) {
        if (!this.observable) {
            return;
        }

        try {
            if (data === null) {
                data = new InteractionData(await this.read());
            }

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

    public subscribe(ws: WebSocket) {
        if (!this.observable) {
            throw new InteractionError('Property is not observable');
        }
        super.subscribe(ws);
    }

    public async notifySubscribers(data: InteractionData) {
        for (let ws of this.subscribers) {
            ws.send(JSON.stringify({
                messageType: 'propertyStatus',
                data: {
                    [this.name]: data.data
                }
            }));
        }
    };

    public toString() {
        return 'Property ' + this.name;
    }

    public get url() {
        return '/properties/' + this.slug;
    }

    public get operations(): Operation[] {
        let operations = [];

        operations.push(new Operation('get', 'Read ' + this.toString(), this));

        if (this.writable) {
            operations.push(new Operation('put', 'Write ' + this.toString(), this));
        }

        return operations;
    }
}
