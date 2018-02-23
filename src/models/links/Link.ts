import {InteractionPattern} from "../interaction";

export class Link {

    public href: string;
    public host: string;
    public mediaType: string;
    public interaction: InteractionPattern;

    constructor(href: string, host = '', mediaType = '') {
        this.href = href;
        this.host = host;
        this.mediaType = mediaType;
    }

    public async execute(data: any = null) {

    }

    public toString() {
        if (this.host) {
            return this.host + this.href;
        } else {
            return this.href;
        }
    }

}
