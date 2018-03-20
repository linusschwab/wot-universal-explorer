import {Thing} from "../models/thing";
import {Action, InteractionPattern, Property, Event} from "../models/interactions";
import {Link} from "../models/links";
import {DataSchema} from "../models/schema";
import {App} from "../App";


export class TDEncoder {

    public static encode(thing: Thing) {
        return JSON.stringify(thing, (key: string, value: Object) => {
            if (value instanceof Thing) {
                return this.thing(value);
            }
            if (value instanceof InteractionPattern) {
                return this.interaction(value);
            }

            return value;
        }, 4);
    }

    private static thing(thing: Thing) {
        return {
            "@context": ["https://w3c.github.io/wot/w3c-wot-td-context.jsonld",
                "https://w3c.github.io/wot/w3c-wot-common-context.jsonld"],
            "@type": [thing.type],
            "name": thing.name,
            "base": App.url + '/things',
            "interaction": thing.interactions
        };
    }

    // Interactions
    private static interaction(interaction: InteractionPattern) {
        if (interaction instanceof Property) {
            return this.property(interaction);
        }
        else if (interaction instanceof Action) {
            return this.action(interaction);
        }
        else if (interaction instanceof Event) {
            return this.event(interaction);
        }

        // TODO: Throw error instead?
        return null;
    }

    private static property(property: Property) {
        return {
            "@type": ["Property"],
            "name": property.name,
            "schema": this.schema(property.schema),
            "writable": property.writable,
            "observable": property.observable,
            "form": this.form(property.url)
        }
    }

    private static action(action: Action) {
        return {
            "@type": ["Action"],
            "name": action.name,
            "inputSchema": this.schema(action.inputSchema),
            "form": this.form(action.url)
        }
    }

    private static event(event: Event) {
        return {
            "@type": ["Event"],
            "name": event.name,
            "schema": this.schema(event.schema),
            "form": this.form(event.url)
        }
    }

    private static schema(schema: DataSchema) {
        if (schema) {
            return {
                "type": schema.type
            }
        } else {
            return null;
        }
    }

    private static form(url: string) {
        return [
            {
                "href": url,
                "mediaType": "application/json"
            }
        ]
    }
}
