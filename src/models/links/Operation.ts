import {Link} from "./Link";

export class Operation {

    public type: string;
    public description: string;
    public link: Link;

    constructor(type: string, description: string, link: Link) {
        this.type = type;
        this.description = description;
        this.link = link;
    }

}
