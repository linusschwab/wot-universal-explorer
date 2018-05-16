import * as WebSocket from "ws";

import {Thing} from "../../thing";
import {Property} from "../Property";
import {HTTPLink} from "../../links";
import {InteractionData} from "../InteractionData";
import {InteractionError} from "../../../tools/errors";


const mockResponse = 10;
let mockLink: HTTPLink;
let mockWs: WebSocket;

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

test('read returns response', async () => {
    const property = new Property('Test Property', null, true, true);
    property.registerLink(mockLink);

    const response = await property.read();

    expect(response).toBe(mockResponse);
    expect(mockLink.execute).toHaveBeenCalledTimes(1);
});

test('write returns response', async () => {
    const property = new Property('Test Property', null, true, true);
    property.registerLink(mockLink);

    const response = await property.write(10);

    expect(response).toBe(mockResponse);
    expect(mockLink.execute).toHaveBeenCalledTimes(1);
});

test('write throws error for non-writable properties', async () => {
    const property = new Property('Test Property', null, false, true);
    property.registerLink(mockLink);

    await expect(property.write(10)).rejects.toThrowError(InteractionError);
});

test('update polls data, stores it and notifies subscribers', async () => {
    const property = new Property('Test Property', null, true, true);
    property.registerLink(mockLink);
    property.subscribe(mockWs);

    await property.update();

    expect(mockLink.execute).toHaveBeenCalledTimes(1);
    expect(property.data).toHaveLength(1);
    expect(property.data[0].equals(new InteractionData(mockResponse)));
    expect(mockWs.send).toHaveBeenCalledTimes(1);
});

test('update only works for observable properties', async () => {
    const property = new Property('Test Property', null, true, false);
    property.registerLink(mockLink);

    await property.update();

    expect(mockLink.execute).not.toHaveBeenCalled();
    expect(property.data).toHaveLength(0);
});

test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const property = new Property('Test Property', null, true, true);
    thing.registerInteraction(property);

    expect(property.url).toBe('/properties/test-property');
});
