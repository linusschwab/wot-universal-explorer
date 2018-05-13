import {MozillaThing} from "../models/thing";
import {Action, Event, Property} from "../models/interactions";
import {DataSchema} from "../models/schema";
import {MozillaHTTPLink} from "../models/links/MozillaHTTPLink";


export class MozillaTDParser {

    public static parse(td: string | object) {
        let obj;

        if (typeof td === 'string') {
            obj = JSON.parse(td);
        } else {
            obj = td;
        }

        const base = MozillaTDParser.parseBase(obj.href);
        const thing = new MozillaThing(obj.name, obj.type, base);
        thing.description = obj.description;

        for (let [name, pobj] of Object.entries(obj.properties)) {
            let property = MozillaTDParser.parseProperty(name, pobj);

            let link = MozillaTDParser.parseLink((<any>pobj).href, base);
            property.registerLink(link);

            thing.registerInteraction(property);
        }

        for (let [name, aobj] of Object.entries(obj.actions)) {
            let action = MozillaTDParser.parseAction(name, aobj);

            let link = MozillaTDParser.parseLink(MozillaTDParser.parseActionLink(obj.links), base);
            action.registerLink(link);

            thing.registerInteraction(action);
        }

        for (let [name, eobj] of Object.entries(obj.events)) {
            let event = MozillaTDParser.parseEvent(name, eobj);

            thing.registerInteraction(event);
        }

        return thing;
    }

    private static parseBase(base: string) {
        if (base === undefined) {
            return process.env.MOZ_BASE;
        } else if (base.includes('http://')) {
            return base;
        } else {
            return process.env.MOZ_BASE + base;
        }
    }

    private static parseActionLink(links: any[]) {
        for (let link of links) {
            if (link.hasOwnProperty('rel') && link.rel === 'actions') {
                return link.href;
            }
        }
    }

    private static parseLink(href: string, base: string) {
        let tdBase = base.replace(process.env.MOZ_BASE, '');
        let url = href.replace(tdBase, '');

        return new MozillaHTTPLink(url, base);
    }

    private static parseProperty(name: string, obj: any) {
        // TODO: include unit in data schema? (celsius, percentage, ...)
        let schema = new DataSchema(obj.type, true, false);
        return new Property(name, schema, true, true);
    }

    private static parseAction(name: string, obj: any) {
        // TODO: support input schema
        return new Action(name, null, null)
    }

    private static parseEvent(name: string, obj: any) {
        let schema = new DataSchema(obj.type, false, false);
        return new Event(name, schema);
    }
}
