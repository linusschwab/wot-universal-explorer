import {Thing} from "../models/thing";
import {Property} from "../models/interaction";
import {DataSchema} from "../models/schema";
import {HTTPLink} from "../models/links";


export class MozillaTDParser {

    public static parse(td: string | object, base = '', authKey = '') {
        // TODO: Implement authorization
        let obj;

        if (typeof td === 'string') {
            obj = JSON.parse(td);
        } else {
            obj = td;
        }

        let thing = new Thing(obj.name, obj.type, base);
        thing.description = obj.description;

        for (let [name, pobj] of Object.entries(obj.properties)) {
            let property = this.parseProperty(name, pobj);

            let link = this.parseLink(pobj.href, thing.base);
            property.registerLink(link);

            thing.registerInteraction(property);
        }

        return thing;
    }

    private static parseProperty(name: string, pobj: any) {
        let schema = new DataSchema(pobj.type, true, false);
        return new Property(name, schema, true, false);
    }

    private static parseLink(href: string, base: string) {
        return new HTTPLink(href, base, 'application/json');
    }
}
