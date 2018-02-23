import {Thing} from "./models/thing/Thing";
import {HTTPLink, Link, Operation} from "./models/links";
import {DataSchema, InputSchema} from "./models/schema";
import {isArray} from "util";
import {Action} from "./models/interaction";


export class OpenAPIEncoder {

    public static encode(thing: Thing) {
        return JSON.stringify(thing, (key: string, value: Object) => {
            if (value instanceof Thing) {
                return {
                    "openapi": "3.0.0",
                    "info": this.info(value.name),
                    "paths": this.paths(value.links),
                }
            }
            // TODO: Support other link types
            if (value instanceof HTTPLink) {
                return this.operations(value);
            }
            if (value instanceof Operation) {
                return this.operation(value);
            }

            return value;
        }, 4);
    }

    private static info(name: string) {
        return {
            "version": "1.0",
            "title": name,
            "description": "API to interact with " + name + " generated from the TD",
        };
    }

    private static paths(links: Link[]) {
        let obj: any = {};

        for (let link of links) {
            obj[link.href] = link;
        }

        return obj
    }

    private static operations(link: HTTPLink) {
        let obj: any = {};

        for (let operation of link.operations) {
            obj[operation.type] = operation;
        }

        return obj;
    }

    private static operation(o: Operation) {
        let operation: any = {
            "description": o.description,
            "responses": {
                "200": {
                    "description": "success"
                }
            },
            "tags": [
                (<any>o.link.interaction).constructor.name
            ]
        };

        let requestBodyData = [];
        if (o.link.interaction instanceof Action) {
            let inputData = o.link.interaction.inputSchema;
            if (inputData) {
                requestBodyData.push(inputData);
            }
        }

        /*let outputData = o.link.interaction.schema;
        if (outputData) {
            operation['responses']['200']['content'] = {
                [o.link.mediaType]: {
                    "schema": this.schema(outputData)
                }
            };

            if (outputData.writable) {
                requestBodyData.push(outputData);
            }
        }*/

        if (requestBodyData.length > 0) {
            operation['requestBody'] = this.requestBody(o.link.interaction.toString(), o.link.mediaType, requestBodyData);
        }

        return operation;
    }

    private static schema(data: DataSchema | DataSchema[]) {
        if (!isArray(data)) {
            data = [data];
        }

        // TODO: Check if same name multiple times
        let properties: any = {};
        let required: string[] = [];

        for (let d of data) {
            properties[d.type] = {
                "type": d.type
            };

            if (d instanceof InputSchema) {
                required.push(d.type);
            }
        }

        let schema: any = {
            "type": "object",
            "properties": properties
        };

        if (required.length > 0) {
            schema['required'] = required;
        }

        return schema;
    }

    private static requestBody(description: string, mediaType: string, data: DataSchema | DataSchema[]) {
        return {
            "description": description + " parameters",
            "required": "true",
            "content": {
                [mediaType]: {
                    "schema": this.schema(data)
                }
            }
        }
    }

}
