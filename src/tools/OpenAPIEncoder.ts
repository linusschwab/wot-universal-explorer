import {Thing, ThingsManager} from "../models/thing";
import {Operation} from "../models/links";
import {DataSchema, InputSchema} from "../models/schema";
import {Action, InteractionPattern, Property} from "../models/interaction";
import {isArray} from "util";


export class OpenAPIEncoder {

    public static encode(things: ThingsManager) {
        return JSON.stringify(things, (key: string, value: Object) => {
            if (value instanceof ThingsManager) {
                return {
                    "openapi": "3.0.0",
                    "info": this.info(),
                    "servers": this.servers(),
                    "paths": this.paths(value),
                }
            }
            if (value instanceof InteractionPattern) {
                return this.operations(value);
            }
            if (value instanceof Operation) {
                return this.operation(value);
            }

            return value;
        }, 4);
    }

    private static info() {
        return {
            "version": "1.0",
            "title": "Universal Explorer for the Web of Things",
            "description": "API to interact with things",
        };
    }

    private static servers() {
        // TODO: Remove hardcoded url, read from config
        return [
            {
                "url": "http://localhost:5000/things",
                "description": "Development server"
            }
        ]
    }

    private static paths(things: ThingsManager) {
        let obj: any = {};

        for (let interaction of things.getInteractions()) {
            obj[interaction.url] = interaction;
        }

        return obj
    }

    private static operations(interaction: InteractionPattern) {
        let obj: any = {};

        for (let operation of interaction.operations) {
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
                o.interaction.thing.name
                //(<any>o.interaction).constructor.name
            ]
        };

        let requestBodyData = [];
        if (o.interaction instanceof Action) {
            let inputData = o.interaction.inputSchema;
            if (inputData) {
                requestBodyData.push(inputData);
            }
        }

        // TODO: Output data
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
            operation['requestBody'] = this.requestBody(o.interaction.toString(), 'application/json', requestBodyData);
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
