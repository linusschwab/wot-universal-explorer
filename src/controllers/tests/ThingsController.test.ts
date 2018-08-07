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
        readProperty: jest.fn().mockReturnValue(mockResponse),
        writeProperty: jest.fn().mockReturnValue(mockResponse),
        subscribeToProperty: jest.fn(),
        unsubscribeFromProperty: jest.fn(),
        invokeAction: jest.fn().mockReturnValue(mockResponse),
        subscribeToAction: jest.fn(),
        unsubscribeFromAction: jest.fn(),
        getEventData: jest.fn().mockReturnValue(mockResponse),
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

describe('websocket', () => {
    let wsManager: WebSocketManager;

    beforeEach(() => {
        const things = new ThingsManager();
        const controllers = new ControllerManager(things);
        wsManager = new WebSocketManager(null, controllers, things);
    });

    describe('subscriptions', () => {
        test('subscribe to all', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "subscribe",
                "data": {}
            }));
            expect(mockThing.subscribe).toHaveBeenCalledTimes(1);
            expect(mockWs.send).toMatchSnapshot();
        });

        test('unsubscribe from all', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "unsubscribe",
                "data": {}
            }));
            expect(mockThing.unsubscribe).toHaveBeenCalledTimes(1);
            expect(mockWs.send).toMatchSnapshot();
        });

        test('subscribe to interaction', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "addSubscription",
                "data": {
                    "property": "testProperty"
                }
            }));

            expect(mockThing.subscribeToProperty).toHaveBeenCalledTimes(1);
            expect(mockWs.send).toMatchSnapshot();
        });

        test('unsubscribe from interaction', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "removeSubscription",
                "data": {
                    "property": "testProperty"
                }
            }));

            expect(mockThing.unsubscribeFromProperty).toHaveBeenCalledTimes(1);
            expect(mockWs.send).toMatchSnapshot();
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
            expect(mockWs.send).toMatchSnapshot();
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
            expect(mockWs.send).toMatchSnapshot();
        });
    });

    describe('interactions', () => {
        test('get property', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "getProperty",
                "data": {
                    "testProperty": {}
                }
            }));

            expect(mockThing.readProperty).toHaveBeenCalledTimes(1);
            expect(mockThing.readProperty).toMatchSnapshot();
        });

        test('get multiple properties', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "getProperty",
                "data": {
                    "testProperty": {},
                    "testProperty2": {}
                }
            }));

            expect(mockThing.readProperty).toHaveBeenCalledTimes(2);
            expect(mockThing.readProperty).toMatchSnapshot();
        });

        test('set property', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "setProperty",
                "data": {
                    "testProperty": "10"
                }
            }));

            expect(mockThing.writeProperty).toHaveBeenCalledTimes(1);
            expect(mockThing.writeProperty).toMatchSnapshot();
        });

        test('set multiple properties', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "setProperty",
                "data": {
                    "testProperty": "10",
                    "testProperty2": "20"
                }
            }));

            expect(mockThing.writeProperty).toHaveBeenCalledTimes(2);
            expect(mockThing.writeProperty).toMatchSnapshot();
        });

        test('request action', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "requestAction",
                "data": {
                    "testAction": {}
                }
            }));

            expect(mockThing.invokeAction).toHaveBeenCalledTimes(1);
            expect(mockThing.invokeAction).toMatchSnapshot();
        });

        test('request multiple actions', async () => {
            await wsManager.handleMessage(mockThing, mockWs, JSON.stringify({
                "messageType": "requestAction",
                "data": {
                    "testAction": {},
                    "testAction2": "data"
                }
            }));

            expect(mockThing.invokeAction).toHaveBeenCalledTimes(2);
            expect(mockThing.invokeAction).toMatchSnapshot();
        });
    });
});
