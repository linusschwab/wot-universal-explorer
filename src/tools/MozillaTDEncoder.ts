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
        return {
            "name": thing.name,
            "type": thing.type,
            "href": App.url + '/things/' + thing.slug,
            "properties": MozillaTDEncoder.properties(thing.properties),
            "actions": MozillaTDEncoder.actions(thing.actions),
            "events": MozillaTDEncoder.events(thing.events),
            "links": MozillaTDEncoder.links(thing)
        };
    }

    private static properties(properties: Property[]) {
        let obj: any = {};
        for (const property of properties) {
            obj[property.name] = {
                "type": property.schema.type,
                "description": property.description,
                "href": property.url
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
            obj[action.name] = {
                "description": action.description
            };
        }
        return obj;
    }

    private static events(events: Event[]) {
        let obj: any = {};
        for (const event of events) {
            obj[event.name] = {
                "description": event.description,
                "href": event.url
            };
        }
        return obj;
    }

    private static links(thing: Thing) {
        return [
            {
                "rel": 'actions',
                "href": '/actions'
                },
            {
                "rel": 'events',
                "href": '/events'
            },
            {
                "rel": 'alternate',
                "href": App.url.replace('http://', 'ws://') + '/things/' + thing.slug
            }
        ];
    }
}