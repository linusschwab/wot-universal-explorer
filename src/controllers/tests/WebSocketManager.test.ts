import * as http from "http";
import * as WebSocket from "ws";

import {WebSocketManager} from "../WebSocketManager";
import {Thing, ThingsManager} from "../../models/thing";
import {ControllerManager} from "../ControllerManager";
import {InteractionError, RequestError, ThingError, TimeoutError} from "../../tools/errors";
import {Action, Event, InteractionData, Property} from "../../models/interactions";


// Create mocks
jest.mock('ws');

let mockWs: WebSocket;


let things = new ThingsManager();
let controllers = new ControllerManager(things);
const ws = new WebSocketManager(null, controllers, things);


beforeAll(() => {
    const MockWebSocket = jest.fn<WebSocket>(() => ({
        send: jest.fn(),
        close: jest.fn()
    }));
    mockWs = new MockWebSocket();
});

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

describe('subscriber notifications', () => {
    const data = new InteractionData('Test Data');

    test('property notification sends correct message', async () => {
        const property = new Property('Test Property', null, false, true);

        WebSocketManager.notify(mockWs, property, data);

        expect(mockWs.send).toMatchSnapshot();
    });

    test('action notification sends correct message', async () => {
        const action = new Action('Test Action', null, null);

        WebSocketManager.notify(mockWs, action, data);

        expect(mockWs.send).toMatchSnapshot();
    });

    test('event notification sends correct message', async () => {
        const event = new Event('Test Event', null);

        WebSocketManager.notify(mockWs, event, data);

        expect(mockWs.send).toMatchSnapshot();
    });
});

describe('error handling', () => {
    test('thing error sends error message and closes connection', async () => {
        const error = new ThingError('Error message');

        WebSocketManager.handleError(mockWs, error);

        expect(mockWs.send).toMatchSnapshot();
        expect(mockWs.close).toHaveBeenCalledTimes(1);
    });

    test('timeout error sends error message', async () => {
        const error = new TimeoutError('Error message');

        WebSocketManager.handleError(mockWs, error);

        expect(mockWs.send).toMatchSnapshot();
    });

    test('request error rejects message', async () => {
        const error = new RequestError('Error message');

        WebSocketManager.handleError(mockWs, error);

        expect(mockWs.send).toMatchSnapshot();
    });

    test('interaction error rejects message', async () => {
        const error = new InteractionError('Error message');

        WebSocketManager.handleError(mockWs, error);

        expect(mockWs.send).toMatchSnapshot();
    });
});
