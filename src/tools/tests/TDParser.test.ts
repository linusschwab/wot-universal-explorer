import * as fs from "fs";
import {TDParser} from "../TDParser";
import {Action} from "../../models/interactions";


test('td without base and 1 action with multiple links', () => {
    const tdLamp = fs.readFileSync(__dirname + '/__data__/td-sample-lamp.jsonld', 'utf8');
    const thing = TDParser.parse(tdLamp);

    // Basic data
    expect(thing.name).toBe('myMasterLED');
    expect(thing.type).toBe('Lamp');
    expect(thing.base).toBe('');
    expect(thing.interactions).toHaveLength(1);

    // Interactions
    const action = thing.interactions[0];
    expect(action).toBeInstanceOf(Action);
    expect(action.name).toBe('myMasterOnOff');
    expect(action.links).toHaveLength(2);
    expect(action.links[0].toString()).toBe('coap://www.example.com:5683/master');
    expect(action.links[1].toString()).toBe('http://www.example.com:80/master');

    // Data schema
    const actionInputSchema = (<Action>action).inputSchema;
    expect(actionInputSchema.type).toBe('boolean');
    expect(actionInputSchema.writable).toBe(true);

    const actionOutputSchema = (<Action>action).outputSchema;
    expect(actionOutputSchema).toBeNull();
});

test('td with base, 2 properties and 2 events', () => {
    const tdSensor = fs.readFileSync(__dirname + '/__data__/td-sample-sensor.jsonld', 'utf8');
    const thing = TDParser.parse(tdSensor);

    // Basic data
    expect(thing.name).toBe('myTempSensor');
    expect(thing.type).toBe('Sensor');
    expect(thing.base).toBe('coap:///www.example.com:5683/temp/');
    expect(thing.interactions).toHaveLength(4);

    // Interactions
    expect(thing.interactions).toMatchSnapshot()
});
