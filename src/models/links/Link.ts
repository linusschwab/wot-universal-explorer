import {Interaction} from "../interactions";

export class Link {

    public href: string;
    public host: string;
    public mediaType: string;
    public interaction: Interaction;

    constructor(href: string, host = '', mediaType = '') {
        this.href = href;
        this.host = host;
        this.mediaType = mediaType;
    }

    public toString() {
        if (this.host) {
            return this.host + this.href;
        } else {
            return this.href;
        }
    }

}
