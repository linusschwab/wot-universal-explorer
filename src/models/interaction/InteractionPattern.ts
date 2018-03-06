import * as getSlug from "speakingurl";
import {Link, Operation} from "../links";
import {Thing} from "../thing";


export class InteractionPattern {

    public name: string;
    public thing: Thing;

    public base: string;
    public links: Link[];
    public url: string;
    public operations: Operation[];

    constructor(name: string) {
        this.name = name;
        this.links = [];
    }

    public registerLink(link: Link) {
        this.links.push(link);
        link.interaction = this;
    }

    public toString() {
        return this.name + ' interaction';
    }

    get slug() {
        return getSlug(this.name);
    }
}
