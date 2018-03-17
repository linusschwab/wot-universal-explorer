import {Thing} from "../Thing";
import {Action, Property, Event} from "../../interactions";
import {InteractionError} from "../../../tools/errors";


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

test('getting not existing interaction throws error', () => {
    const thing = new Thing('TestThing', 'Thing');

    expect(() => {
        thing.getInteraction('TestAction');
    }).toThrowError(InteractionError);
});

test('getting interaction returns correct interaction', () => {
    const thing = new Thing('TestThing', 'Thing');
    const action = new Action('TestAction', null, null);
    thing.registerInteraction(action);
    const property = new Property('TestProperty', null, true, true);
    thing.registerInteraction(property);

    expect(thing.getInteraction('TestAction')).toBe(action);
    expect(thing.getInteraction('TestProperty')).toBe(property);
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
