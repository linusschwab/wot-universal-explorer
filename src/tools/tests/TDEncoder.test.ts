import {Thing} from "../../models/thing";
import {Action, Property} from "../../models/interaction";
import {DataSchema, InputSchema, OutputSchema} from "../../models/schema";
import {HTTPLink, Link} from "../../models/links";
import {TDEncoder} from "../TDEncoder";


test('thing with base, 1 writable property and 1 action', () => {
    // Prepare test thing
    const thing = new Thing('Testthing', 'Thing', 'http://localhost');

    const property = new Property('testProperty', new DataSchema('integer', true), true, false);
    property.registerLink(new HTTPLink('/testproperty', thing.base, 'application/json'));
    thing.registerInteraction(property);

    const action = new Action('testAction', new InputSchema('boolean'), new OutputSchema('boolean'));
    action.registerLink(new HTTPLink('/testaction', thing.base, 'application/json'));
    thing.registerInteraction(action);

    // Encode
    const td = TDEncoder.encode(thing);
    expect(td).toMatchSnapshot();
});

test('thing without base, 1 property with multiple links', () => {
    // Prepare test thing
    const thing = new Thing('Testthing', 'Thing');

    const property = new Property('testProperty', new DataSchema('integer', true), true, false);
    property.registerLink(new HTTPLink('http://link1.com/testproperty', '', 'application/json'));
    property.registerLink(new HTTPLink('http://link2.com/testproperty', '', 'application/json'));
    thing.registerInteraction(property);

    // Encode
    const td = TDEncoder.encode(thing);
    expect(td).toMatchSnapshot();
});
