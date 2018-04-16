import MockAdapter from "axios-mock-adapter";
import {Action, Event, Property} from "../../interactions";
import {MozillaHTTPLink} from "../MozillaHTTPLink";


let link: MozillaHTTPLink;
let mock: MockAdapter;
const mockResponse = 10;

beforeAll(() => {
    link = new MozillaHTTPLink('http://localhost/');
    mock = new MockAdapter(link.http);
});

beforeEach(() => {
    jest.clearAllMocks();
    mock.reset();
});

describe('execute property', () => {
    beforeEach(() => {
        link.interaction = new Property('test', null, true, true);
    });

    test('write property', async () => {
        mock.onPut().reply(200, JSON.stringify({test: mockResponse})); // Wrapped response

        const response = await link.execute({test: 10});
        expect(response).toEqual(mockResponse); // Unwrapped response
    });

    test('read property', async () => {
        mock.onGet().reply(200, JSON.stringify({test: mockResponse})); // Wrapped response

        const response = await link.execute();
        expect(response).toEqual(mockResponse); // Unwrapped response
    });
});
