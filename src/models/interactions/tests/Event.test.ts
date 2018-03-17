import {Thing} from "../../thing";
import {Event} from "../Event";


test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const event = new Event('Test Event', null);
    thing.registerInteraction(event);

    expect(event.url).toBe('/test-thing/events/test-event');
});
