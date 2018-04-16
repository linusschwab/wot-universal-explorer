import MockAdapter from "axios-mock-adapter";
import {Action, Event, Property} from "../../interactions";
import {HTTPLink} from "../HTTPLink";
import {RequestError, TimeoutError} from "../../../tools/errors";


let link: HTTPLink;
let mock: MockAdapter;
const mockResponse = 10;

beforeAll(() => {
    link = new HTTPLink('http://localhost/', '', 'application/json');
    mock = new MockAdapter(link.http);
});

beforeEach(() => {
    jest.clearAllMocks();
    mock.reset();
});

describe('execute property', () => {
    beforeEach(() => {
        link.interaction = new Property('TestProperty', null, true, true);
    });

    test('write property', async () => {
        mock.onPut().reply(200, JSON.stringify(mockResponse));

        const response = await link.execute(10);
        expect(response).toEqual(mockResponse);
    });

    test('write property request error', async () => {
        mock.onPut().reply(400);

        await expect(link.execute(10)).rejects.toThrowError(RequestError);
    });

    test('read property', async () => {
        mock.onGet().reply(200, JSON.stringify(mockResponse));

        const response = await link.execute();
        expect(response).toEqual(mockResponse);
    });

    test('read property timeout error', async () => {
        mock.onGet().timeout();

        await expect(link.execute()).rejects.toThrowError(TimeoutError);
    });
});

describe('execute action', () => {
    beforeEach(() => {
        link.interaction = new Action('TestAction', null, null);
    });

    test('regular action', async () => {
        mock.onPost().reply(200, JSON.stringify(mockResponse));

        const response = await link.execute();
        expect(response).toEqual(mockResponse);
    });

    test('legacy action', async () => {
        mock.onPost().reply(405);
        mock.onGet().reply(200, JSON.stringify(mockResponse));

        const response = await link.execute();
        expect(response).toEqual(mockResponse);
    });

    test('timeout error', async () => {
        mock.onPost().timeout();

        await expect(link.execute()).rejects.toThrowError(TimeoutError);
    });

    test('request error', async () => {
        mock.onPost().reply(400);

        await expect(link.execute()).rejects.toThrowError(RequestError);
    });
});

describe('execute event', () => {
    beforeEach(() => {
        link.interaction = new Event('TestEvent', null);
    });

    test('poll event', async () => {
        mock.onGet().reply(200, JSON.stringify(mockResponse));

        const response = await link.execute();
        expect(response).toEqual(mockResponse);
    });

    test('timeout error', async () => {
        mock.onGet().timeout();

        await expect(link.execute()).rejects.toThrowError(TimeoutError);
    });

    test('request error', async () => {
        mock.onGet().reply(400);

        await expect(link.execute()).rejects.toThrowError(RequestError);
    });
});
