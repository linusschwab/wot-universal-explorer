import {Thing} from "./models/thing/Thing";
import {HTTPLink, Link, Operation} from "./models/links";
import {Data} from "./models/data";
import {isArray} from "util";
import {Action} from "./models/interactions";


export class OpenAPIEncoder {

    public static encode(thing: Thing) {
        return JSON.stringify(thing, (key: string, value: Object) => {
            if (value instanceof Thing) {
                return {
                    "openapi": "3.0.0",
                    "info": {
                        "version": "0.1.0",
                        "title": value.name,
                        "description": "API to interact with " + value.name + " generated from the TD",
                    },
                    "paths": this.paths(value.links),
                }
            }
            // TODO: Support other link types
            if (value instanceof HTTPLink) {
                return this.operations(value);
            }
            if (value instanceof Operation) {
                let operation: any = {
                    "description": value.description,
                    "responses": {
                        "200": {
                            "description": "success"
                        }
                    },
                    "tags": [
                        (<any>value.link.interaction).constructor.name
                    ]
                };

                let requestBodyData = [];
                if (value.link.interaction instanceof Action) {
                    let inputData = value.link.interaction.inputData;
                    if (inputData) {
                        requestBodyData.push(inputData);
                    }
                }

                let outputData = value.link.interaction.outputData;
                if (outputData) {
                    operation['responses']['200']['content'] = {
                        [value.link.mediaType]: {
                            "schema": this.schema(outputData)
                        }
                    };

                    if (outputData.writable) {
                        requestBodyData.push(outputData);
                    }
                }

                // TODO: Add request body

                return operation;
            }

            return value;
        }, 4);
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

    private static schema(data: Data | Data[]) {
        if (!isArray(data)) {
            data = [data];
        }

        // TODO: Check if same name multiple times
        let properties: any = {};
        for (let d of data) {
            properties[d.name] = {
                "type": d.type
            };
        }

        // TODO: Add "required" parameter
        return {
            "type": "object",
            "properties": properties
        }
    }

    private static requestBody() {
        return {
            "description": "user to add to the system",
            "required": "true",
            "content": {
                "application/json": {
                    "schema": {

                    }
                }
            }
        }
    }

}
