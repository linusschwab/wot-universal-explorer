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
    public subscribers: WebSocket[];

    constructor(name: string) {
        this.name = name;
        this.links = [];
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

    public async notifySubscribers(data: InteractionData) {
        // TODO: Implement (abstract definition, move to subclasses?)
        //console.log(data.toString());
    }

    public abstract toString(): string;

    get slug() {
        return getSlug(this.name);
    }
}
