import * as WebSocket from "ws";

import {Thing} from "../../thing";
import {Event} from "../Event";
import {InteractionData} from "../InteractionData";
import {HTTPLink} from "../../links";


const mockResponse = 10;
let mockLink: HTTPLink;
let mockWs: WebSocket;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

beforeAll(() => {
    // Mock implementations
    const MockHTTPLink = jest.fn<HTTPLink>(() => ({
        execute: jest.fn(() => {return mockResponse})
    }));
    mockLink = new MockHTTPLink();

    const MockWebSocket = jest.fn<WebSocket>(() => ({
        send: jest.fn()
    }));
    mockWs = new MockWebSocket();
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('update polls data, stores it and notifies subscribers', async () => {
    const event = new Event('Test Event', null);
    event.registerLink(mockLink);
    event.subscribe(mockWs);

    await event.update();

    expect(mockLink.execute).toHaveBeenCalledTimes(1);
    expect(event.data).toHaveLength(1);
    expect(event.data[0].equals(new InteractionData(mockResponse)));
    expect(mockWs.send).toHaveBeenCalledTimes(1);
});

test('event data returns correct data newer than timestamp', async () => {
    const event = new Event('Test Event', null);
    const data1 = new InteractionData('test1');
    await sleep(5);
    const timestamp = Date.now();
    await sleep(5);
    const data2 = new InteractionData('test2');
    event.data = [data1, data2];

    expect(event.getData()).toHaveLength(2);
    expect(event.getData()[0]).toBe(data1);
    expect(event.getData()[1]).toBe(data2);

    expect(event.getData(timestamp)).toHaveLength(1);
    expect(event.getData(timestamp)[0]).toBe(data2);
});

test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const event = new Event('Test Event', null);
    thing.registerInteraction(event);

    expect(event.url).toBe('/test-thing/events/test-event');
});
