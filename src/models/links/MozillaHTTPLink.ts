import {HTTPLink} from "./HTTPLink";


export class MozillaHTTPLink extends HTTPLink {

    constructor(href: string) {
        // TODO: Relative URL detection
        super(href, process.env.MOZ_BASE, 'application/json');

        this.http.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.MOZ_AUTH;
    }

    protected async executeProperty(data: any): Promise<any> {
        // Wrap primitives in object
        if (data !== null && !this.isObject(data)) {
            data = {
                [this.interaction.name]: data
            }
        }

        // Unwrap response
        let response = await super.executeProperty(data);
        if (this.isObject(response) && this.interaction.name in response) {
            return response[this.interaction.name];
        } else {
            return response;
        }
    }

    private isObject(obj: any) {
        return obj === Object(obj);
    }
}
