import {Thing} from "../../thing";
import {Event} from "../Event";
import {InteractionData} from "../InteractionData";


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('event data returns correct data newer than timestamp', async () => {
    const event = new Event('Test Event', null);
    const data1 = new InteractionData('test1');
    await sleep(5);
    const timestamp = Date.now();
    await sleep(5);
    const data2 = new InteractionData('test2');
    event.data = [data1, data2];

    expect(event.getData()).toHaveLength(2);
    expect(event.getData()[0]).toBe(data1);
    expect(event.getData()[1]).toBe(data2);

    expect(event.getData(timestamp)).toHaveLength(1);
    expect(event.getData(timestamp)[0]).toBe(data2);
});

test('url slug', () => {
    const thing = new Thing('Test Thing', 'Thing');
    const event = new Event('Test Event', null);
    thing.registerInteraction(event);

    expect(event.url).toBe('/test-thing/events/test-event');
});
