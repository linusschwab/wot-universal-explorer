import {Thing} from "./models/thing/Thing";
import {Action, Event, Interaction, Property} from "./models/interactions";
import {InputData, OutputData} from "./models/data";
import {HTTPLink} from "./models/links";


export class TDParser {

    public static parse(td: string) {
        const obj = JSON.parse(td);

        let thing = new Thing(obj.name, obj.base);

        for (let iobj of obj.interactions) {
            let interaction = this.parseInteraction(iobj);

            for (let lobj of iobj.links) {
                let link = this.parseLink(lobj, thing.base);
                interaction.registerLink(link);
            }

            thing.registerInteraction(interaction);
        }

        return thing;
    }

    // Interactions
    private static parseInteraction(iobj: any) {
        let type = iobj['@type'][0];

        switch(type) {
            case 'Action':
                return this.parseAction(iobj);
            case 'Event':
                return this.parseEvent(iobj);
            case 'Property':
                return this.parseProperty(iobj);
            default:
                let name = iobj.name;
                return new Interaction(name);
        }
    }

    private static parseAction(iobj: any) {
        let name = iobj.name;

        let outputData = null;
        if ('outputData' in iobj) {
            outputData = new OutputData('data', iobj.outputData.valueType.type, false, false);
        }

        let inputData = null;
        if ('inputData' in iobj) {
            inputData = new InputData('data', iobj.inputData.valueType.type, true);
        }

        return new Action(name, outputData, inputData);
    }

    private static parseEvent(iobj: any) {
        let name = iobj.name;
        let outputData = new InputData('data', iobj.outputData.valueType.type, false);

        return new Event(name, outputData);
    }

    private static parseProperty(iobj: any) {
        let name = iobj.name;

        let writable = false;
        if ('writable' in iobj) {
            writable = iobj.writable;
        }

        let outputData = new OutputData('data', iobj.outputData.valueType.type, writable, false);

        return new Property(name, outputData, writable);
    }

    // Links
    private static parseLink(lobj: any, base: string) {
        let href = lobj.href;
        let mediaType = lobj.mediaType;
        // TODO: Support other link types
        return new HTTPLink(href, base, mediaType);
    }
}
