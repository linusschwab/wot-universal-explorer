import * as request from "supertest";
import * as WebSocket from "ws";

import {App} from "../../app";
import {Thing, ThingsManager} from "../../models/thing";
import {WebSocketManager} from "../WebSocketManager";
import {ControllerManager} from "../ControllerManager";


// Create mocks
console.log = jest.fn();
jest.mock('ws');
jest.mock('../../models/thing/Thing');
jest.mock('../../models/thing/ThingsManager');

const mockResponse = 10;
let mockThing: Thing;
let mockWs: WebSocket;


beforeAll(() => {
    // Mock implementations
    const MockThing = jest.fn<Thing>(() => ({
        readProperty: () => {return mockResponse},
        writeProperty: () => {return mockResponse},
        subscribeToProperty: jest.fn(),
        unsubscribeFromProperty: jest.fn(),
        invokeAction: () => {return mockResponse},
        subscribeToAction: jest.fn(),
        unsubscribeFromAction: jest.fn(),
        getEventData: () => {return mockResponse},
        subscribeToEvent: jest.fn(),
        unsubscribeFromEvent: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn()
    }));
    mockThing = new MockThing('testthing', 'Thing');

    (<any>ThingsManager).mockImplementation(() => {
        return {
            getThing: () => {return mockThing}
        };
    });

    const MockWebSocket = jest.fn<WebSocket>(() => ({
        send: jest.fn()
    }));
    mockWs = new MockWebSocket();
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('interactions', () => {
    let app: App;

    beforeEach(() => {
        app = new App();
    });

    test('get property returns thing response', async () => {
        const response = await request(app.koa.callback())
            .get('/things/testthing/properties/testproperty');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        expect(response.body).toBe(mockResponse);
    });

    test('put property returns thing response', async () => {
        const response = await request(app.koa.callback())
            .put('/things/testthing/properties/testproperty');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        expect(response.body).toBe(mockResponse);
    });

    test('post action returns thing response', async () => {
        const response = await request(app.koa.callback())
            .post('/things/testthing/actions/testaction');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        expect(response.body).toBe(mockResponse);
    });

    test('get event returns thing response', async () => {
        const response = await request(app.koa.callback())
            .get('/things/testthing/events/testevent');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        expect(response.body).toBe(mockResponse);
    });
});

describe('subscriptions', () => {
    let wsManager: WebSocketManager;

    beforeEach(() => {
        const things = new ThingsManager();
        const controllers = new ControllerManager(things);
        wsManager = new WebSocketManager(null, controllers, things);
    });

    test('subscribe to all', async () => {
        await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
            "messageType": "subscribe",
            "data": {}
        }));
        expect(mockThing.subscribe).toHaveBeenCalledTimes(1);
        expect(mockWs.send).toMatchSnapshot()
    });

    test('unsubscribe from all', async () => {
        await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
            "messageType": "unsubscribe",
            "data": {}
        }));
        expect(mockThing.unsubscribe).toHaveBeenCalledTimes(1);
        expect(mockWs.send).toMatchSnapshot()
    });

    test('subscribe to interaction', async () => {
        await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
            "messageType": "addSubscription",
            "data": {
                "property": "testProperty"
            }
        }));

        expect(mockThing.subscribeToProperty).toHaveBeenCalledTimes(1);
        expect(mockWs.send).toMatchSnapshot()
    });

    test('unsubscribe from interaction', async () => {
        await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
            "messageType": "removeSubscription",
            "data": {
                "property": "testProperty"
            }
        }));

        expect(mockThing.unsubscribeFromProperty).toHaveBeenCalledTimes(1);
        expect(mockWs.send).toMatchSnapshot()
    });

    test('subscribe to multiple interactions', async () => {
        await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
            "messageType": "addSubscription",
            "data": {
                "property": ["testProperty1", "testProperty2"],
                "action": "testAction",
                "event": ["testEvent1", "testEvent2"]
            }
        }));

        expect(mockThing.subscribeToProperty).toHaveBeenCalledTimes(2);
        expect(mockThing.subscribeToAction).toHaveBeenCalledTimes(1);
        expect(mockThing.subscribeToEvent).toHaveBeenCalledTimes(2);
        expect(mockWs.send).toMatchSnapshot()
    });

    test('unsubscribe from multiple interactions', async () => {
        await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
            "messageType": "removeSubscription",
            "data": {
                "property": ["testProperty1", "testProperty2"],
                "action": ["testAction1", "testAction2"],
                "event": "testEvent"
            }
        }));

        expect(mockThing.unsubscribeFromProperty).toHaveBeenCalledTimes(2);
        expect(mockThing.unsubscribeFromAction).toHaveBeenCalledTimes(2);
        expect(mockThing.unsubscribeFromEvent).toHaveBeenCalledTimes(1);
        expect(mockWs.send).toMatchSnapshot()
    });
});
