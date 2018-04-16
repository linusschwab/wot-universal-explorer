import {Thing} from "../models/thing";
import {Action, Event, Property} from "../models/interactions";
import {App} from "../app";


export class MozillaTDEncoder {

    public static encode(thing: Thing) {
        return JSON.stringify(thing, (key: string, value: Object) => {
            if (value instanceof Thing) {
                return MozillaTDEncoder.thing(value);
            }

            return value;
        }, 4);
    }

    private static thing(thing: Thing) {
        // TODO: href? Include in Thing?
        return {
            "name": thing.name,
            "type": thing.type,
            "href": "",
            "properties": MozillaTDEncoder.properties(thing.properties),
            "actions": MozillaTDEncoder.actions(thing.actions),
            "events": MozillaTDEncoder.events(thing.events)
        };
    }

    private static properties(properties: Property[]) {
        let obj: any = {};
        for (const property of properties) {
            obj[property.name] = {
                "type": property.schema.type,
                "description": property.description,
                "href": App.url + '/things' + property.url
            };

            if (!property.description) {
                delete obj.description;
            }
        }
        return obj;
    }

    private static actions(actions: Action[]) {
        let obj: any = {};
        for (const action of actions) {
            // TODO: Include href (as links object?)
            obj[action.name] = {
                "description": action.description,
            };
        }
        return obj;
    }

    private static events(events: Event[]) {
        let obj: any = {};
        for (const event of events) {
            // TODO: Include href (as links object?)
            obj[event.name] = {
                "description": event.description,
            };
        }
        return obj;
    }
}