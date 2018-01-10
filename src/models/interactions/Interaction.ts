import {Link} from "../links";
import {OutputData} from "../data";

export class Interaction {

    public name: string;
    public base: string;
    public links: Link[];
    public outputData: OutputData;

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
