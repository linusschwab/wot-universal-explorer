import {Action, InteractionPattern, Property} from "../interaction";
import {InteractionError} from "../../tools/errors";


export class Thing {

    public name: string;
    public base: string;
    public interaction: InteractionPattern[];

    constructor(name: string, base = '') {
        this.name = name;
        this.base = base;
        this.interaction = [];
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

    public async subcribeToEvent(name: string): Promise<any> {
        // TODO: Implement
    }

    public registerInteraction(interaction: InteractionPattern) {
        interaction.thing = this;
        interaction.base = this.base;
        this.interaction.push(interaction);
    }

    public getInteraction(name: string): InteractionPattern {
        for (let interaction of this.interaction) {
            if (interaction.name == name) {
                return interaction;
            }
        }
        return null;
    }

    get links() {
        let links = [];

        for (let interaction of this.interaction) {
            for (let link of interaction.links) {
                links.push(link);
            }
        }

        return links;
    }

    public toString() {
        return this.name;
    }
}
