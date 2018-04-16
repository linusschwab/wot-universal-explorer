import * as fs from "fs";

import {App} from "../";


// Create mocks
console.log = jest.fn();
jest.mock('fs');
jest.mock('koa');
jest.mock('ws');


beforeAll(() => {
    // Mock implementation
    (<any>fs.readdirSync).mockImplementation((): string[] => {return []});
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('app runs without errors', () => {
    App.run();
});
