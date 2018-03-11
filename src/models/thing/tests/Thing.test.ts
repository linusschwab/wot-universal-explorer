import {Thing} from "../Thing";
import {Action, Property} from "../../interaction";
import {InteractionError} from "../../../tools/errors";


test('create thing without base url', () => {
    const thing = new Thing('TestThing', 'Thing');

    expect(thing.name).toBe('TestThing');
    expect(thing.type).toBe('Thing');
    expect(thing.base).toBe('');
    expect(thing.interaction).toHaveLength(0);
});


test('register interaction with base url', () => {
    const thing = new Thing('TestThing', 'Thing', 'http://localhost');
    const action = new Action('TestAction', null, null);
    thing.registerInteraction(action);

    expect(thing.interaction).toHaveLength(1);
    expect(thing.interaction[0]).toBe(action);
    expect(thing.interaction[0].thing).toBe(thing);
    expect(thing.interaction[0].base).toBe(thing.base);
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
