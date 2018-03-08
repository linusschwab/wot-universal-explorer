import {Action} from "../src/models/interaction";
import {Thing} from "../src/models/thing";


test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const action = new Action('Test Action', null, null);
    thing.registerInteraction(action);

    expect(action.url).toBe('/test-thing/actions/test-action');
});
