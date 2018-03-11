import {Thing} from "../../thing";
import {Property} from "../Property";


test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const property = new Property('Test Property', null, true, true);
    thing.registerInteraction(property);

    expect(property.url).toBe('/test-thing/properties/test-property');
});
