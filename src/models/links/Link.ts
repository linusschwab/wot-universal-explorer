import {InteractionPattern} from "../interactions";

export abstract class Link {

    public href: string;
    public host: string;
    public mediaType: string;
    public interaction: InteractionPattern;

    constructor(href: string, host = '', mediaType = '') {
        this.href = href;
        this.host = host;
        this.mediaType = mediaType;
    }

    public abstract async execute(data: any): Promise<any>;

    public toString() {
        if (this.host) {
            return this.host + this.href;
        } else {
            return this.href;
        }
    }

    protected isEmpty(data: any) {
        return (data === null || Object.getOwnPropertyNames(data).length === 0);
    }
}
