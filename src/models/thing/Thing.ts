import {Action, Interaction, Property} from "../interactions";


export class Thing {

    public name: string;
    public base: string;
    public interactions: Interaction[];

    constructor(name: string, base = '') {
        this.name = name;
        this.base = base;
        this.interactions = [];
    }

    public registerInteraction(interaction: Interaction) {
        interaction.base = this.base;
        this.interactions.push(interaction);
    }

    public async invokeAction(name: string) {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Action) {
            return interaction.invoke();
        }
        throw new TypeError('No action with name ' + name);
    }

    public async subcribeToEvent(name: string) {
        // TODO: Implement
    }

    public async readProperty(name: string) {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Property) {
            return interaction.read();
        }
        throw new TypeError('No property with name ' + name);
    }

    public async writeProperty(name: string, value: any) {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Property) {
            return interaction.write(value);
        }
        throw new TypeError('No property with name ' + name);
    }

    public getInteraction(name: string): Interaction {
        for (let interaction of this.interactions) {
            if (interaction.name == name) {
                return interaction;
            }
        }
        return null;
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

    public toString() {
        return this.name;
    }
}
