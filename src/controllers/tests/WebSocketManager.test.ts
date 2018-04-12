import * as http from "http";

import {WebSocketManager} from "../WebSocketManager";
import {Thing, ThingsManager} from "../../models/thing";
import {ControllerManager} from "../ControllerManager";
import {RequestError, ThingError} from "../../tools/errors";


// Create mocks
jest.mock('ws');


let things: ThingsManager = new ThingsManager();
let controllers: ControllerManager = new ControllerManager(things);
const ws = new WebSocketManager(controllers, things);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('parse message', () => {
    test('empty message throws error', async () => {
        const data = JSON.stringify("");

        expect(() => {
            ws.parseMessage(data)
        }).toThrowError(RequestError);
    });

    test('invalid message throws error', async () => {
        const data = JSON.stringify({
                messageType: "data missing"
        });

        expect(() => {
            ws.parseMessage(data)
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

        expect(ws.parseMessage(message)).toEqual(data);
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
