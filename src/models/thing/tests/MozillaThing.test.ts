import {MozillaThing} from "../MozillaThing";
import {Property, Event} from "../../interactions";


// Create mocks
jest.mock('ws');

beforeEach(() => {
    jest.clearAllMocks();
});

test('property status update notifies subscribers', async () => {
    const thing = new MozillaThing('TestThing', 'Thing', 'http://localhost/');
    const property = new Property('on', null, false, true);
    const callback = jest.fn();
    thing.registerInteraction(property);
    thing.subscribeToProperty('on', callback);

    const data = '{"messageType": "propertyStatus", "data": {"on": false}}';
    await thing.wsHandleMessage(data);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][1].data).toBe(false);
});

test('event notifies subscribers', async () => {
    const thing = new MozillaThing('TestThing', 'Thing', 'http://localhost/');
    const event = new Event('button', null);
    const callback = jest.fn();
    thing.registerInteraction(event);
    thing.subscribeToEvent('button', callback);

    const data = '{"messageType": "event", "data": {"button": "Pressed"}}';
    await thing.wsHandleMessage(data);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][1].data).toBe('Pressed');
});
