import {Link} from "../links";
import {OutputSchema} from "../schema";

export class InteractionPattern {

    public name: string;
    public base: string;
    public links: Link[];

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

}
