import * as http from "http";

import {WebSocketManager} from "../WebSocketManager";
import {Thing, ThingsManager} from "../../models/thing";
import {ControllerManager} from "../ControllerManager";
import {RequestError, ThingError} from "../../tools/errors";


// Create mocks
jest.mock('ws');


let things = new ThingsManager();
let controllers = new ControllerManager(things);
const ws = new WebSocketManager(null, controllers, things);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('parse message', () => {
    test('empty message throws error', async () => {
        const data = JSON.stringify("");

        expect(() => {
            WebSocketManager.parseMessage(data)
        }).toThrowError(RequestError);
    });

    test('invalid message throws error', async () => {
        const data = JSON.stringify({
                messageType: "data missing"
        });

        expect(() => {
            WebSocketManager.parseMessage(data)
        }).toThrowError(RequestError);
    });

    test('valid message returns javascript object', async () => {
        const data = {
            messageType: "testMessage",
            data: {
                test: "value"
            }
        };
        const message = JSON.stringify(data);

        expect(WebSocketManager.parseMessage(message)).toEqual(data);
    });
});

describe('get thing', () => {
    const thing = new Thing('Test Thing', 'thing');
    things.addThing(thing);

    test('invalid url throws error', async () => {
        const req = new http.IncomingMessage(null);
        req.url = '/test';

        expect(() => {
            ws.getThing(req)
        }).toThrowError(ThingError);
    });

    test('valid url returns correct thing', async () => {
        const req = new http.IncomingMessage(null);
        req.url = '/test-thing';

        expect(ws.getThing(req)).toBe(thing);
    });
});
