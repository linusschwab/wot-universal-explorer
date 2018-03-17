import {Action, Property} from "../../models/interactions";
import {DataSchema, InputSchema, OutputSchema} from "../../models/schema";
import {HTTPLink} from "../../models/links";
import {Thing, ThingsManager} from "../../models/thing";
import {OpenAPIEncoder} from "../OpenAPIEncoder";


test('encode one thing', () => {
    // Prepare test thing
    const thing = new Thing('Testthing', 'Thing', 'http://localhost');

    const property = new Property('testProperty', new DataSchema('integer', true), true, false);
    property.registerLink(new HTTPLink('/testproperty', thing.base, 'application/json'));
    thing.registerInteraction(property);

    const action = new Action('testAction', new InputSchema('boolean'), new OutputSchema('boolean'));
    action.registerLink(new HTTPLink('/testaction', thing.base, 'application/json'));
    thing.registerInteraction(action);

    // Add to ThingsManager
    const things = new ThingsManager();
    things.addThing(thing);

    // Encode
    const openapi = OpenAPIEncoder.encode(things);
    expect(openapi).toMatchSnapshot();
});

test('encode multiple things', () => {
    // Prepare test things
    const thing1 = new Thing('Testthing', 'Thing', 'http://localhost');

    const property1 = new Property('testProperty', new DataSchema('integer', true), true, false);
    property1.registerLink(new HTTPLink('/testproperty', thing1.base, 'application/json'));
    thing1.registerInteraction(property1);

    const action1 = new Action('testAction', new InputSchema('boolean'), new OutputSchema('boolean'));
    action1.registerLink(new HTTPLink('/testaction', thing1.base, 'application/json'));
    thing1.registerInteraction(action1);

    const thing2 = new Thing('Testthing 2', 'Thing');

    const property2 = new Property('testProperty', new DataSchema('integer', true), true, false);
    property2.registerLink(new HTTPLink('http://link1.com/testproperty', '', 'application/json'));
    property2.registerLink(new HTTPLink('http://link2.com/testproperty', '', 'application/json'));
    thing2.registerInteraction(property2);

    // Add to ThingsManager
    const things = new ThingsManager();
    things.addThing(thing1);
    things.addThing(thing2);

    // Encode
    const openapi = OpenAPIEncoder.encode(things);
    expect(openapi).toMatchSnapshot();
});
