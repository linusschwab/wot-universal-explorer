import {Thing} from "./models/thing/Thing";
import {Action, Event, InteractionPattern, Property} from "./models/interaction";
import {DataSchema, InputSchema, OutputSchema} from "./models/schema";
import {HTTPLink} from "./models/links";


export class TDParser {

    public static parse(td: string) {
        const obj = JSON.parse(td);

        let thing = new Thing(obj.name, obj.base);

        for (let iobj of obj.interaction) {
            let interaction = this.parseInteraction(iobj);

            for (let fobj of iobj.form) {
                let link = this.parseForm(fobj, thing.base);
                interaction.registerLink(link);
            }

            thing.registerInteraction(interaction);
        }

        return thing;
    }

    // Interactions
    private static parseInteraction(iobj: any) {
        let type = iobj['@type'][0];
        // TODO: Parse detailed type? ["Property","Temperature"]

        switch(type) {
            case 'Property':
                return this.parseProperty(iobj);
            case 'Action':
                return this.parseAction(iobj);
            case 'Event':
                return this.parseEvent(iobj);
            default:
                let name = iobj.name;
                return new InteractionPattern(name);
        }
    }

    private static parseProperty(iobj: any) {
        let name = iobj.name;

        let writable = false;
        if ('writable' in iobj) {
            writable = iobj.writable;
        }

        let observable = false;
        if ('observable' in iobj) {
            observable = iobj.observable;
        }

        let schema = new DataSchema(iobj.schema.type, writable, false);

        return new Property(name, schema, writable, observable);
    }

    private static parseAction(iobj: any) {
        let name = iobj.name;

        let outputSchema = null;
        if ('outputSchema' in iobj && iobj.outputSchema) {
            outputSchema = new OutputSchema(iobj.outputSchema.type);
        }

        let inputSchema = null;
        if ('inputSchema' in iobj && iobj.inputSchema) {
            inputSchema = new InputSchema(iobj.inputSchema.type);
        }

        return new Action(name, outputSchema, inputSchema);
    }

    private static parseEvent(iobj: any) {
        let name = iobj.name;

        let schema = new DataSchema(iobj.schema.type, false, false);

        return new Event(name, schema);
    }

    // Links
    private static parseForm(fobj: any, base: string) {
        let href = fobj.href;
        let mediaType = fobj.mediaType;
        // TODO: Support other link types
        return new HTTPLink(href, base, mediaType);
    }
}
