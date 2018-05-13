import * as WebSocket from "ws";

import {MozillaThing} from "../MozillaThing";
import {Property, Event} from "../../interactions";


// Create mocks
jest.mock('ws');
let mockWs: WebSocket;

beforeAll(() => {
    // Mock implementations
    const MockWebSocket = jest.fn<WebSocket>(() => ({
        send: jest.fn()
    }));
    mockWs = new MockWebSocket();
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('property status update sends websocket notification', async () => {
    const thing = new MozillaThing('TestThing', 'Thing', 'http://localhost/');
    const property = new Property('on', null, false, true);
    thing.registerInteraction(property);
    thing.subscribeToProperty('on', mockWs);

    const data = '{"messageType": "propertyStatus", "data": {"on": false}}';
    await thing.wsHandleMessage(data);

    expect(mockWs.send).toMatchSnapshot();
});

test('event sends websocket notification', async () => {
    const thing = new MozillaThing('TestThing', 'Thing', 'http://localhost/');
    const event = new Event('button', null);
    thing.registerInteraction(event);
    thing.subscribeToEvent('button', mockWs);

    const data = '{"messageType": "event", "data": {"button": "Pressed"}}';
    await thing.wsHandleMessage(data);

    expect(mockWs.send).toMatchSnapshot();
});
