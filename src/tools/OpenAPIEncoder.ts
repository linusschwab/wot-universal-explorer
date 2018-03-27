import {ThingsManager} from "../models/thing";
import {Operation} from "../models/links";
import {DataSchema, InputSchema} from "../models/schema";
import {Action, InteractionPattern, Property, Event} from "../models/interactions";
import {isArray} from "util";
import {App} from "../App";


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
        return [
            {
                "url": "http://localhost:5000/things", // TODO: App.url does not work...
                "description": "Development server"
            }
        ]
    }

    private static paths(things: ThingsManager) {
        let obj: any = {};

        // Add all interactions as paths
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
                    "description": "Ok"
                },
                "400": {
                    "description": "Bad request"
                },
                "408": {
                    "description": "Remote thing did not respond"
                }
            },
            "tags": [
                o.interaction.thing.name // Group interactions by thing
            ]
        };

        // Request body
        let requestSchema: DataSchema = this.requestSchema(o);
        if (requestSchema) {
            operation['requestBody'] = this.requestBody(
                o.interaction.toString(),
                'application/json',
                requestSchema
            );
        }

        // Request parameters
        if (o.interaction instanceof Event) {
            operation['parameters'] = this.eventsRequestParameters();
        }

        // Response
        let responseSchema: DataSchema = this.responseSchema(o);
        if (responseSchema) {
            operation['responses']['200']['content'] = {
                ['application/json']: {
                    "schema": this.schema(responseSchema)
                }
            };
        }

        return operation;
    }

    private static requestSchema(o: Operation): DataSchema {
        let requestSchema: DataSchema = null;

        // Check if operation type allows request body
        if (o.type !== 'post' && o.type !== 'put') {
            return null;
        }

        // Transform interaction data schema
        if (o.interaction instanceof Property) {
            if (o.interaction.schema && o.interaction.schema.writable) {
                requestSchema = o.interaction.schema;
            }
        }
        else if (o.interaction instanceof Action) {
            requestSchema = o.interaction.inputSchema;
        }
        else if (o.interaction instanceof Event) {
            requestSchema = null;
        }

        return requestSchema
    }

    private static responseSchema(o: Operation): DataSchema {
        if (o.interaction instanceof Property) {
            return o.interaction.schema;
        }
        else if (o.interaction instanceof Action) {
            return o.interaction.outputSchema;
        }
        else if (o.interaction instanceof Event) {
            return o.interaction.schema;
        }
        else {
            return null;
        }
    }

    private static schema(data: DataSchema | DataSchema[]) {
        if (!isArray(data) && data.isSimpleType()) {
            return this.schemaSimpleData(data);
        } else {
            return this.schemaStructuredData(data);
        }
    }

    private static schemaSimpleData(data: DataSchema) {
        return {
            "type": data.type,
        };
    }

    private static schemaStructuredData(data: DataSchema | DataSchema[]) {
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

    private static eventsRequestParameters() {
        return [
            {
                "name": "timestamp",
                "in": "query",
                "description": "Only return events newer than timestamp",
                "schema": {
                    "type": "integer"
                }
            },
            {
                "name": "limit",
                "in": "query",
                "description": "Max number of events to return (default: 10)",
                "schema": {
                    "type": "integer"
                }
            }
        ]
    }
}
