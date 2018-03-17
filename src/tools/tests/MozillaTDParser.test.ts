import * as fs from "fs";
import {MozillaTDParser} from "../MozillaTDParser";
import {Action, Property} from "../../models/interactions";


test('simple td with 2 properties', () => {
    const tdLight = fs.readFileSync(__dirname + '/__data__/mozilla-td-sample-virtual-light.json', 'utf8');
    const thing = MozillaTDParser.parse(tdLight, 'http://localhost:8080');

    // Basic data
    expect(thing.name).toBe('Virtual On/Off Color Light');
    expect(thing.type).toBe('onOffColorLight');
    expect(thing.interactions).toHaveLength(2);

    // Interactions
    const propertyOn = thing.interactions[0];
    expect(propertyOn).toBeInstanceOf(Property);
    expect(propertyOn.name).toBe('on');
    expect(propertyOn.links).toHaveLength(1);
    expect(propertyOn.links[0].toString()).toBe('http://localhost:8080/things/virtual-things-0/properties/on');

    const propertyColor = thing.interactions[1];
    expect(propertyColor).toBeInstanceOf(Property);
    expect(propertyColor.name).toBe('color');
    expect(propertyColor.links).toHaveLength(1);
    expect(propertyColor.links[0].toString()).toBe('http://localhost:8080/things/virtual-things-0/properties/color');

    // Data schema
    const propertyOnSchema = (<Property>propertyOn).schema;
    expect(propertyOnSchema.type).toBe('boolean');
    expect(propertyOnSchema.writable).toBe(true);

    const propertyColorSchema = (<Property>propertyColor).schema;
    expect(propertyColorSchema.type).toBe('string');
    expect(propertyColorSchema.writable).toBe(true);
});
