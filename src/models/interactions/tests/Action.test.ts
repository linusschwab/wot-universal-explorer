import {Thing} from "../../thing";
import {Action} from "../Action";
import {HTTPLink} from "../../links";
import {InteractionData} from "../InteractionData";


const mockResponse = 10;
let mockLink: HTTPLink;

beforeAll(() => {
    // Mock implementations
    const MockHTTPLink = jest.fn<HTTPLink>(() => ({
        execute: jest.fn(() => {return mockResponse})
    }));
    mockLink = new MockHTTPLink();
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('invoke returns response', async () => {
    const action = new Action('Test Action', null, null);
    action.registerLink(mockLink);

    const response = await action.invoke();

    expect(response).toBe(mockResponse);
    expect(mockLink.execute).toHaveBeenCalledTimes(1);
});

test('invoke stores data and notifies subscribers', async () => {
    const action = new Action('Test Action', null, null);
    const callback = jest.fn();
    action.registerLink(mockLink);
    action.subscribe(callback);

    await action.invoke();

    expect(action.data).toHaveLength(1);
    expect(action.data[0].equals(new InteractionData(mockResponse)));
    expect(callback).toHaveBeenCalledTimes(1);
});

test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const action = new Action('Test Action', null, null);
    thing.registerInteraction(action);

    expect(action.url).toBe('/actions/test-action');
});
