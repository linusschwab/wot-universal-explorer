import {Thing} from "./Thing";
import {InteractionPattern} from "../interaction";


export class ThingsManager {

    public things: Thing[];

    constructor() {
        this.things = [];
    }

    public addThing(thing: Thing): boolean {
        // Check if thing already exists
        if (this.getThing(thing.slug) !== null) {
            return false;
        }

        this.things.push(thing);
        return true;
    }

    public removeThing(slug: string) {
        let thing = this.getThing(slug);
        // TODO: Implement
    }

    public getThing(slug: string): Thing {
        for (let thing of this.things) {
            if (thing.slug == slug) {
                return thing;
            }
        }
        return null;
    }

    public getThingsNames() {
        let names: string[] = [];

        for (let thing of this.things) {
            names.push(thing.toString());
        }

        return names;
    }

    public getInteractions() {
        let interactions: InteractionPattern[] = [];

        for (let thing of this.things) {
            for (let interaction of thing.interaction) {
                interactions.push(interaction);
            }
        }

        return interactions;
    }
}
