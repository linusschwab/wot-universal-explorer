import * as getSlug from "speakingurl";
import {Action, InteractionPattern, Property, Event} from "../interactions";
import {InteractionError} from "../../tools/errors";


export class Thing {

    public name: string;
    public description: string;
    public type: string;

    public base: string;
    public interactions: InteractionPattern[];
    public subscribers: any; // TODO
    public websocket: any;

    constructor(name: string, type: string, base = '') {
        this.name = name;
        this.type = type;
        this.base = base;
        this.interactions = [];
        this.subscribers = [];
    }

    public async readProperty(name: string): Promise<any> {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Property) {
            return interaction.read();
        } else {
            throw new InteractionError('No property with name ' + name);
        }
    }

    public async writeProperty(name: string, data: any): Promise<any> {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Property) {
            return interaction.write(data);
        } else {
            throw new InteractionError('No property with name ' + name);
        }
    }

    public async invokeAction(name: string, data: any = null): Promise<any> {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Action) {
            return interaction.invoke(data);
        } else {
            throw new InteractionError('No action with name ' + name);
        }
    }

    public async subcribeTo(name: string): Promise<any> {
        // TODO: Implement
    }

    public async unsubscribeFrom(name: string): Promise<any> {
        // TODO: Implement
    }

    public async subscribe(): Promise<any> {
        // TODO: Implement
    }

    public async unsubscribe(): Promise<any> {
        // TODO: Implement
    }

    public registerInteraction(interaction: InteractionPattern) {
        interaction.thing = this;
        interaction.base = this.base;
        this.interactions.push(interaction);
    }

    public getInteraction(name: string): InteractionPattern {
        for (let interaction of this.interactions) {
            if (interaction.slug == getSlug(name)) {
                return interaction;
            }
        }
        throw new InteractionError('No interaction with name ' + name);
    }

    public toString() {
        return this.name;
    }

    get properties() {
        let properties: Property[] = [];
        for (let interaction of this.interactions) {
            if (interaction instanceof Property) {
                properties.push(interaction)
            }
        }
        return properties;
    }

    get actions() {
        let actions: Action[] = [];
        for (let interaction of this.interactions) {
            if (interaction instanceof Action) {
                actions.push(interaction)
            }
        }
        return actions;
    }

    get events() {
        let events: Event[] = [];
        for (let interaction of this.interactions) {
            if (interaction instanceof Event) {
                events.push(interaction)
            }
        }
        return events;
    }

    get links() {
        let links = [];
        for (let interaction of this.interactions) {
            for (let link of interaction.links) {
                links.push(link);
            }
        }
        return links;
    }

    get slug() {
        return getSlug(this.name);
    }
}
