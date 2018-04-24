import * as getSlug from "speakingurl";
import {Thing} from "./Thing";
import {InteractionPattern} from "../interactions";
import {ThingError, TimeoutError} from "../../tools/errors";
import {type} from "os";
import {MozillaThing} from "./MozillaThing";


export class ThingsManager {

    public things: Thing[];

    constructor() {
        this.things = [];

        setInterval(this.pollData.bind(this), 1000);
    }

    public addThing(thing: Thing): boolean {
        // Check if thing already exists
        if (this.existsThing(thing)) {
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
            if (thing.slug == getSlug(name)) {
                return thing;
            }
        }
        throw new ThingError('No thing with name ' + name);
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
            for (let interaction of thing.interactions) {
                interactions.push(interaction);
            }
        }

        return interactions;
    }

    private existsThing(thing: Thing) {
        try {
            this.getThing(thing.name);
        } catch (e) {
            if (e instanceof ThingError) {
                return false;
            } else {
                throw e;
            }
        }

        return true;
    }

    private pollData() {
        for (let thing of this.things) {
            if (thing instanceof MozillaThing) {
                continue;
            }

            for (let event of thing.events) {
                event.update();
            }
            for (let property of thing.properties) {
                property.update();
            }
        }
    }
}
