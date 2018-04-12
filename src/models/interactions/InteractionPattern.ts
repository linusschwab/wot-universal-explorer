import * as WebSocket from "ws";
import * as getSlug from "speakingurl";

import {Link, Operation} from "../links";
import {Thing} from "../thing";
import {InteractionData} from "./InteractionData";


export class InteractionPattern {

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
            return;
            // TODO: Throw error if already subscribed?
        }

        this.subscribers.push(ws);
    }

    public unsubscribe(ws: WebSocket) {
        if (this.subscribers.includes(ws)) {
            let index = this.subscribers.indexOf(ws);
            this.subscribers.splice(index, 1);
        }
        // TODO: Throw error if not subscribed?
    }

    public async notifySubscribers(data: InteractionData) {
        // TODO: Implement (abstract definition, move to subclasses?)
        //console.log(data.toString());
    }

    public toString() {
        return 'Interaction ' + this.name ;
    }

    get slug() {
        return getSlug(this.name);
    }
}
