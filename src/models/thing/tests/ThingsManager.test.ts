import {Thing} from "../Thing";
import {ThingsManager} from "../ThingsManager";
import {ThingError} from "../../../tools/errors";
import {Action, Property} from "../../interactions";


test('adding thing to manager', () => {
    const thing = new Thing('TestThing', 'Thing');
    const thingsManager = new ThingsManager();

    expect(thingsManager.things).toHaveLength(0);
    thingsManager.addThing(thing);

    expect(thingsManager.things).toHaveLength(1);
    expect(thingsManager.things[0]).toBe(thing);
});

test('adding same thing twice is not possible', () => {
    const thing = new Thing('TestThing', 'Thing');
    const thingsManager = new ThingsManager();

    const result1 = thingsManager.addThing(thing);
    const result2 = thingsManager.addThing(thing);

    expect(thingsManager.things).toHaveLength(1);
    expect(result1).toBe(true);
    expect(result2).toBe(false);
});

test('getting not existing thing throws error', () => {
    const thingsManager = new ThingsManager();

    expect(() => {
        thingsManager.getThing('TestThing');
    }).toThrowError(ThingError);
});

test('getting thing returns correct thing', () => {
    const lamp = new Thing('Lamp', 'Thing');
    const sensor = new Thing('Sensor', 'Thing');

    const thingsManager = new ThingsManager();
    thingsManager.addThing(lamp);
    thingsManager.addThing(sensor);

    expect(thingsManager.getThing('Lamp')).toBe(lamp);
    expect(thingsManager.getThing('Sensor')).toBe(sensor);
});

test('get all interactions', () => {
    // Create test things
    const lamp = new Thing('Lamp', 'Thing');
    const turnOn = new Action('Turn On', null, null);
    lamp.registerInteraction(turnOn);
    const turnOff = new Action('Turn Off', null, null);
    lamp.registerInteraction(turnOff);

    const sensor = new Thing('Sensor', 'Thing');
    const temperature = new Property('Temperature', null, true, true);
    sensor.registerInteraction(temperature);

    const thingsManager = new ThingsManager();
    thingsManager.addThing(lamp);
    thingsManager.addThing(sensor);

    // Test result
    const interactions = thingsManager.getInteractions();
    expect(interactions).toHaveLength(3);
    expect(interactions[0]).toBe(turnOn);
    expect(interactions[1]).toBe(turnOff);
    expect(interactions[2]).toBe(temperature);
});
