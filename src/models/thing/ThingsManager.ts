import {Thing} from "./Thing";


export class ThingsManager {

    public things: Thing[];

    constructor() {
        this.things =  [];
    }

    public addThing(thing: Thing): boolean {
        // Check if thing already exists
        if (this.getThing(thing.name) !== null) {
            return false;
        }

        this.things.push(thing);
        return true;
    }

    public removeThing(name: string) {
        let thing = this.getThing(name);
        // TODO: Implement
    }

    public getThing(name: string): Thing {
        for (let thing of this.things) {
            if (thing.name == name) {
                return thing;
            }
        }

        return null;
    }
}
