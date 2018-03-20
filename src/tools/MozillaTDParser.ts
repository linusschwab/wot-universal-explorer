import {Thing} from "../models/thing";
import {Property} from "../models/interactions";
import {DataSchema} from "../models/schema";
import {HTTPLink} from "../models/links";
import {MozillaHTTPLink} from "../models/links/MozillaHTTPLink";


export class MozillaTDParser {

    public static parse(td: string | object) {
        let obj;

        if (typeof td === 'string') {
            obj = JSON.parse(td);
        } else {
            obj = td;
        }

        let thing = new Thing(obj.name, obj.type);
        thing.description = obj.description;

        for (let [name, pobj] of Object.entries(obj.properties)) {
            let property = this.parseProperty(name, pobj);

            let link = new MozillaHTTPLink(pobj.href);
            property.registerLink(link);

            thing.registerInteraction(property);
        }

        return thing;
    }

    private static parseProperty(name: string, pobj: any) {
        // TODO: include unit in data schema? (celsius, percentage, ...)
        let schema = new DataSchema(pobj.type, true, false);
        return new Property(name, schema, true, false);
    }
}
