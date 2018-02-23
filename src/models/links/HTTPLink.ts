import {Link} from "./Link";
import {Action, Event, Property} from "../interaction";
import {Operation} from "./Operation";
import * as request from "request-promise-native";


export class HTTPLink extends Link {

    private timeout = 2000;

    public async execute(data: any = null) {
        if (this.interaction instanceof Action) {
            return this.executeAction(data)
        }
        if (this.interaction instanceof Property) {
            return this.executeProperty(data);
        }
    }

    private async executeAction(data: any = null) {
        const options: any = {
            timeout: this.timeout
        };

        return request.post(this.toString(), options).catch(e => {
            return false;
        });
    }

    private async executeProperty(data: any = null) {
        if (data !== null) {
            if (this.mediaType === 'application/json') {
                const options: any = {
                    json: data,
                    headers: {
                        'Accept': 'application/json',
                        'Content': 'application/json'
                    },
                    timeout: this.timeout
                };

                return request.put(this.toString(), options).catch(e => {
                    return false;
                });
            }
            // TODO: Support other mediaTypes
            return false;
        } else {
            const options: any = {
                timeout: this.timeout
            };

            return request.get(this.toString(), options).catch(e => {
                return false;
            });
        }
    }

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
