import * as fs from "fs";
import {MozillaTDParser} from "../MozillaTDParser";
import {Action, Event, Property} from "../../models/interactions";


// Create mocks
jest.mock('ws');


beforeAll(() => {
    process.env.MOZ_BASE = 'http://mozilla-gateway.base';
    process.env.MOZ_AUTH = 'MozillaGatewayToken';
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('simple td with 2 properties', () => {
    const tdLight = fs.readFileSync(__dirname + '/__data__/mozilla-td-sample-virtual-light.json', 'utf8');
    const thing = MozillaTDParser.parse(tdLight);

    // Basic data
    expect(thing.name).toBe('Virtual On/Off Color Light');
    expect(thing.type).toBe('onOffColorLight');
    expect(thing.interactions).toHaveLength(2);

    // Interactions
    const propertyOn = thing.interactions[0];
    expect(propertyOn).toBeInstanceOf(Property);
    expect(propertyOn.name).toBe('on');
    expect(propertyOn.links).toHaveLength(1);
    expect(propertyOn.links[0].toString()).toBe('http://mozilla-gateway.base/things/virtual-things-0/properties/on');

    const propertyColor = thing.interactions[1];
    expect(propertyColor).toBeInstanceOf(Property);
    expect(propertyColor.name).toBe('color');
    expect(propertyColor.links).toHaveLength(1);
    expect(propertyColor.links[0].toString()).toBe('http://mozilla-gateway.base/things/virtual-things-0/properties/color');

    // Data schema
    const propertyOnSchema = (<Property>propertyOn).schema;
    expect(propertyOnSchema.type).toBe('boolean');
    expect(propertyOnSchema.writable).toBe(true);

    const propertyColorSchema = (<Property>propertyColor).schema;
    expect(propertyColorSchema.type).toBe('string');
    expect(propertyColorSchema.writable).toBe(true);
});

test('td with 3 properties, 1 action and 1 event', () => {
    const tdRaspberry = fs.readFileSync(__dirname + '/__data__/mozilla-td-sample-raspberrypi.json', 'utf8');
    const thing = MozillaTDParser.parse(tdRaspberry);

    // Basic data
    expect(thing.name).toBe('WoT Pi');
    expect(thing.type).toBe('thing');
    expect(thing.interactions).toHaveLength(5);

    // Interactions
    const propertyTemperature = thing.interactions[0];
    expect(propertyTemperature).toBeInstanceOf(Property);
    expect(propertyTemperature.name).toBe('temperature');
    expect(propertyTemperature.links).toHaveLength(1);
    expect(propertyTemperature.links[0].toString()).toBe('http://mozilla-gateway.base/things/pi/properties/temperature');

    const propertyHumidity = thing.interactions[1];
    expect(propertyHumidity).toBeInstanceOf(Property);
    expect(propertyHumidity.name).toBe('humidity');
    expect(propertyHumidity.links).toHaveLength(1);
    expect(propertyHumidity.links[0].toString()).toBe('http://mozilla-gateway.base/things/pi/properties/humidity');

    const propertyLed = thing.interactions[2];
    expect(propertyLed).toBeInstanceOf(Property);
    expect(propertyLed.name).toBe('led');
    expect(propertyLed.links).toHaveLength(1);
    expect(propertyLed.links[0].toString()).toBe('http://mozilla-gateway.base/things/pi/properties/led');

    const actionReboot = thing.interactions[3];
    expect(actionReboot).toBeInstanceOf(Action);
    expect(actionReboot.name).toBe('reboot');
    expect(actionReboot.links).toHaveLength(1);
    expect(actionReboot.links[0].toString()).toBe('http://mozilla-gateway.base/things/pi/actions');

    const eventReboot = thing.interactions[4];
    expect(eventReboot).toBeInstanceOf(Event);
    expect(eventReboot.name).toBe('reboot');
    expect(eventReboot.links).toHaveLength(0);
});
