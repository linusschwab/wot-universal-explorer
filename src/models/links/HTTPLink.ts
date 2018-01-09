import {Link} from "./Link";
import {Action, Event, Property} from "../interactions";
import {Operation} from "./Operation";


export class HTTPLink extends Link {

    get operations() {
        let operations = [];

        if (this.interaction instanceof Action) {
            operations.push(new Operation('post', 'invoke ' + this.interaction, this));
        }
        if (this.interaction instanceof Event) {
            operations.push(new Operation('post', 'subscribe to ' + this.interaction, this));
        }
        if (this.interaction instanceof Property) {
            operations.push(new Operation('get', 'read ' + this.interaction, this));
            if ((this.interaction as Property).writable) {
                operations.push(new Operation('put', 'write ' + this.interaction, this));
            }
        }

        return operations;
    }

}
