import {Interaction} from "../interactions";


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
