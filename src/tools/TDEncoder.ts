import {Thing} from "../models/thing";
import {Action, InteractionPattern, Property, Event} from "../models/interactions";
import {DataSchema} from "../models/schema";
import {App} from "../App";


export class TDEncoder {

    public static encode(thing: Thing) {
        return JSON.stringify(thing, (key: string, value: Object) => {
            if (value instanceof Thing) {
                return TDEncoder.thing(value);
            }
            if (value instanceof InteractionPattern) {
                return TDEncoder.interaction(value);
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
            return TDEncoder.property(interaction);
        }
        else if (interaction instanceof Action) {
            return TDEncoder.action(interaction);
        }
        else if (interaction instanceof Event) {
            return TDEncoder.event(interaction);
        }

        // TODO: Throw error instead?
        return null;
    }

    private static property(property: Property) {
        return {
            "@type": ["Property"],
            "name": property.name,
            "schema": TDEncoder.schema(property.schema),
            "writable": property.writable,
            "observable": property.observable,
            "form": TDEncoder.form(property.url)
        }
    }

    private static action(action: Action) {
        return {
            "@type": ["Action"],
            "name": action.name,
            "inputSchema": TDEncoder.schema(action.inputSchema),
            "form": TDEncoder.form(action.url)
        }
    }

    private static event(event: Event) {
        return {
            "@type": ["Event"],
            "name": event.name,
            "schema": TDEncoder.schema(event.schema),
            "form": TDEncoder.form(event.url)
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
