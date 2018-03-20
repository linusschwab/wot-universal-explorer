import {HTTPLink} from "./HTTPLink";


export class MozillaHTTPLink extends HTTPLink {

    constructor(href: string) {
        // TODO: Relative URL detection
        super(href, process.env.MOZ_BASE, 'application/json');

        this.http.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.MOZ_AUTH;
    }
}
