import {InteractionPattern} from "./InteractionPattern";
import {InputSchema, OutputSchema} from "../schema";
import {Operation} from "../links";
import {InteractionData} from "./InteractionData";


export class Action extends InteractionPattern {

    public outputSchema: OutputSchema;
    public inputSchema: InputSchema;

    constructor(name: string, outputSchema: OutputSchema, inputSchema: InputSchema) {
        super(name);
        this.outputSchema = outputSchema;
        this.inputSchema = inputSchema;
    }

    public async invoke(data: any = null) {
        // TODO: Choose correct link
        const response = await this.links[0].execute(data);
        const responseData = new InteractionData(response);

        this.storeData(responseData);
        this.notifySubscribers(responseData);

        return response;
    }

    public async notifySubscribers(data: InteractionData) {
        for (let ws of this.subscribers) {
            ws.send(JSON.stringify({
                messageType: 'action',
                data: {
                    [this.name]: data.data
                }
            }));
        }
    };

    public toString() {
        return 'Action ' + this.name;
    }

    public get url() {
        return '/actions/' + this.slug;
    }

    public get operations(): Operation[] {
        return [new Operation('post', 'Invoke ' + this.toString(), this)];
    }
}
