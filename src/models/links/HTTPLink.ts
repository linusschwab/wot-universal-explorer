import {Link} from "./Link";
import {Action, Event, Property} from "../interactions";
import {Operation} from "./Operation";
import * as request from "request-promise-native";


export class HTTPLink extends Link {

    public operations: Operation[];

    constructor(href: string, host = '', mediaType = '') {
        super(href, host, mediaType);
        this.addOperations();
    }

    private addOperations() {
        if (this.interaction instanceof Action) {
            this.operations.push(new Operation('post', 'invoke ' + this.interaction, this));
        }
        if (this.interaction instanceof Event) {
            this.operations.push(new Operation('post', 'subscribe to ' + this.interaction, this));
        }
        if (this.interaction instanceof Property) {
            this.operations.push(new Operation('get', 'read ' + this.interaction, this));
            if ((this.interaction as Property).writable) {
                this.operations.push(new Operation('put', 'write ' + this.interaction, this));
            }
        }
    }

    public async execute(data: any = null) {
        if (this.interaction instanceof Action) {
            return request.post(this.toString());
        }
        if (this.interaction instanceof Property) {
            if (data !== null) {
                return null; // TODO
            } else {
                return request.get(this.toString());
            }
        }
    }
}
