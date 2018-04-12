import {Thing} from "../Thing";
import {Action, Property, Event} from "../../interactions";
import {InteractionError} from "../../../tools/errors";
import {Link} from "../../links";


// Create mocks
jest.mock('../../links/Link');

const mockResponse = 10;
(<any>Link).mockImplementation(() => {
    return {
        execute: () => {return mockResponse}
    };
});


test('create thing without base url', () => {
    const thing = new Thing('TestThing', 'Thing');

    expect(thing.name).toBe('TestThing');
    expect(thing.type).toBe('Thing');
    expect(thing.base).toBe('');
    expect(thing.interactions).toHaveLength(0);
});

test('register interaction with base url', () => {
    const thing = new Thing('TestThing', 'Thing', 'http://localhost');
    const action = new Action('TestAction', null, null);
    thing.registerInteraction(action);

    expect(thing.interactions).toHaveLength(1);
    expect(thing.interactions[0]).toBe(action);
    expect(thing.interactions[0].thing).toBe(thing);
    expect(thing.interactions[0].base).toBe(thing.base);
});

describe('interaction getters', () => {
    test('getting not existing interaction throws error', () => {
        const thing = new Thing('TestThing', 'Thing');

        expect(() => {
            thing.getInteraction('TestAction');
        }).toThrowError(InteractionError);
    });

    test('getting interaction returns correct interaction', () => {
        const thing = new Thing('TestThing', 'Thing');
        const property = new Property('TestProperty', null, true, true);
        thing.registerInteraction(property);
        const action = new Action('TestAction', null, null);
        thing.registerInteraction(action);

        expect(thing.getInteraction('TestAction')).toBe(action);
        expect(thing.getInteraction('TestProperty')).toBe(property);
    });

    test('getting property, action and event returns correct interaction', () => {
        const thing = new Thing('TestThing', 'Thing');
        const property = new Property('TestProperty', null, true, true);
        thing.registerInteraction(property);
        const action = new Action('TestAction', null, null);
        thing.registerInteraction(action);
        const event = new Event('TestEvent', null);
        thing.registerInteraction(event);

        expect(thing.getProperty('TestProperty')).toBe(property);
        expect(thing.getAction('TestAction')).toBe(action);
        expect(thing.getEvent('TestEvent')).toBe(event);
    });

    test('properties, actions and events getters return correct interactions', () => {
        const thing = new Thing('TestThing', 'Thing');
        const property = new Property('TestProperty', null, true, true);
        thing.registerInteraction(property);
        const action = new Action('TestAction', null, null);
        thing.registerInteraction(action);
        const event = new Event('TestEvent', null);
        thing.registerInteraction(event);

        expect(thing.interactions).toHaveLength(3);

        expect(thing.properties).toHaveLength(1);
        expect(thing.properties[0]).toBe(property);

        expect(thing.actions).toHaveLength(1);
        expect(thing.actions[0]).toBe(action);

        expect(thing.events).toHaveLength(1);
        expect(thing.events[0]).toBe(event);
    });
});

describe('invoke interactions', () => {
    const thing = new Thing('TestThing', 'Thing');

    beforeAll(() => {
        // Prepare interactions
        const property = new Property('TestProperty', null, true, true);
        property.registerLink(new Link(null));
        thing.registerInteraction(property);
        const action = new Action('TestAction', null, null);
        action.registerLink(new Link(null));
        thing.registerInteraction(action);
        const event = new Event('TestEvent', null);
        thing.registerInteraction(event);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('read property', async () => {
        const response = await thing.readProperty('TestProperty');
        expect(response).toBe(mockResponse);
    });

    test('write property', async () => {
        const response = await thing.readProperty('TestProperty');
        expect(response).toBe(mockResponse);
    });

    test('subscribe to property', async () => {
        // TODO
    });

    test('unsubscribe from property', async () => {
        // TODO
    });

    test('invoke action', async () => {
        const response = await thing.invokeAction('TestAction');
        expect(response).toBe(mockResponse);
    });

    test('subscribe to action', async () => {
        // TODO
    });

    test('unsubscribe from action', async () => {
        // TODO
    });

    test('get event data', async () => {
        const response = await thing.getEventData('TestEvent', 0, 0);
        expect(response).toEqual([]);
    });

    test('subscribe to event', async () => {
        // TODO
    });

    test('unsubscribe from event', async () => {
        // TODO
    });
});
