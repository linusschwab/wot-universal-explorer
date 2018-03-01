import {Action, InteractionPattern, Property} from "../interaction";


export class Thing {

    public name: string;
    public base: string;
    public interaction: InteractionPattern[];

    constructor(name: string, base = '') {
        this.name = name;
        this.base = base;
        this.interaction = [];
    }

    public async invokeAction(name: string): Promise<any> {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Action) {
            return interaction.invoke();
        }
        throw new TypeError('No action with name ' + name);
    }

    public async subcribeToEvent(name: string): Promise<any> {
        // TODO: Implement
    }

    public async readProperty(name: string): Promise<any> {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Property) {
            return interaction.read();
        }
        throw new TypeError('No property with name ' + name);
    }

    public async writeProperty(name: string, value: any): Promise<any> {
        let interaction = this.getInteraction(name);

        if (interaction instanceof Property) {
            return interaction.write(value);
        }
        throw new TypeError('No property with name ' + name);
    }

    public registerInteraction(interaction: InteractionPattern) {
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
