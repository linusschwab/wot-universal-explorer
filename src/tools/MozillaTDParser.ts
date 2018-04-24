import {MozillaThing} from "../models/thing";
import {Property} from "../models/interactions";
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

        let thing = new MozillaThing(obj.name, obj.type, process.env.MOZ_BASE + obj.href);
        thing.description = obj.description;

        for (let [name, pobj] of Object.entries(obj.properties)) {
            let property = MozillaTDParser.parseProperty(name, pobj);

            let link = MozillaTDParser.parseLink(obj.href, (<any>pobj).href);
            property.registerLink(link);

            thing.registerInteraction(property);
        }

        return thing;
    }

    private static parseLink(base: string, href: string) {
        let url = href.replace(base, '');
        return new MozillaHTTPLink(url);
    }

    private static parseProperty(name: string, pobj: any) {
        // TODO: include unit in data schema? (celsius, percentage, ...)
        let schema = new DataSchema(pobj.type, true, false);
        return new Property(name, schema, true, true);
    }
}
