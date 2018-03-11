import {Thing} from "../../thing";
import {Action} from "../Action";


test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const action = new Action('Test Action', null, null);
    thing.registerInteraction(action);

    expect(action.url).toBe('/test-thing/actions/test-action');
});
