import * as getSlug from "speakingurl";
import {Link, Operation} from "../links";
import {Thing} from "../thing";
import {InteractionData} from "./InteractionData";


// TODO: Change to abstract
export class InteractionPattern {

    public name: string;
    public description: string;

    public thing: Thing;
    public base: string;

    public links: Link[];
    public url: string;
    public operations: Operation[];

    public subscribers: any; // TODO
    public data: InteractionData[]; // TODO: Only for events get resource

    constructor(name: string) {
        this.name = name;
        this.links = [];
        this.subscribers = [];
        this.data = [];
    }

    public registerLink(link: Link) {
        this.links.push(link);
        link.interaction = this;
    }

    public async subscribe() {
        // TODO: Implement
    }

    public async unsubscribe() {
        // TODO: Implement
    }

    public async notifySubscribers(data: InteractionData) {
        // TODO: Implement
        console.log(data.toString());
    }

    public toString() {
        return 'Interaction ' + this.name ;
    }

    get slug() {
        return getSlug(this.name);
    }
}
