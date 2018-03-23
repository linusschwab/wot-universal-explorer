import * as Koa from "koa";
import * as request from "supertest";
import {App} from "../../App";
import {Thing, ThingsManager} from "../../models/thing";


// Create mocks
console.log = jest.fn();
jest.mock('../../models/thing/Thing');
jest.mock('../../models/thing/ThingsManager');

const mockResponse = 10;
(<any>Thing).mockImplementation(() => {
    return {
        readProperty: () => {return mockResponse},
        writeProperty: () => {return mockResponse},
        invokeAction: () => {return mockResponse}
    };
});

const mockThing = new Thing('testthing', 'Thing');
(<any>ThingsManager).mockImplementation(() => {
    return {
        getThing: () => {return mockThing}
    };
});


let app: App;

beforeEach(() => {
    app = new App();
    jest.clearAllMocks();
});

test('get property returns thing response', async () => {
    const response = await request(app.koa.callback())
        .get('/things/testthing/properties/testproperty');

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body).toBe(mockResponse);
});

test('put property returns thing response', async () => {
    const response = await request(app.koa.callback())
        .put('/things/testthing/properties/testproperty');

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body).toBe(mockResponse);
});

test('post action returns thing response', async () => {
    const response = await request(app.koa.callback())
        .post('/things/testthing/actions/testaction');

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body).toBe(mockResponse);
});
