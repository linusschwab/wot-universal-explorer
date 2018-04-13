import * as WebSocket from "ws";
import * as getSlug from "speakingurl";

import {Link, Operation} from "../links";
import {Thing} from "../thing";
import {InteractionData} from "./InteractionData";
import {InteractionError} from "../../tools/errors";


export abstract class InteractionPattern {

    public name: string;
    public description: string;

    public thing: Thing;
    public base: string;

    public links: Link[];
    public url: string;
    public operations: Operation[];

    public data: InteractionData[];
    public subscribers: WebSocket[];

    constructor(name: string) {
        this.name = name;
        this.links = [];
        this.data = [];
        this.subscribers = [];
    }

    public registerLink(link: Link) {
        this.links.push(link);
        link.interaction = this;
    }

    public subscribe(ws: WebSocket) {
        if (this.subscribers.includes(ws)) {
            throw new InteractionError('Already subscribed to interaction');
        }

        this.subscribers.push(ws);
    }

    public unsubscribe(ws: WebSocket) {
        if (!this.subscribers.includes(ws)) {
            throw new InteractionError('Not subscribed to interaction');
        }

        let index = this.subscribers.indexOf(ws);
        this.subscribers.splice(index, 1);
    }

    public abstract async notifySubscribers(data: InteractionData): Promise<void>;

    public async storeData(data: InteractionData) {
        // Delete old items if too many
        if (this.data.length > 1000) {
            this.data.splice(0, 1);
        }

        this.data.push(data);
    }

    public newData(data: InteractionData): boolean {
        return this.data.length == 0 || !data.equals(this.data[this.data.length-1])
    }

    public abstract toString(): string;

    get slug() {
        return getSlug(this.name);
    }
}
