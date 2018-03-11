import {InteractionPattern} from "../InteractionPattern";
import {HTTPLink} from "../../links";


test('register link to interaction', () => {
    const interaction = new InteractionPattern('Test');
    const link = new HTTPLink('http://localhost/test');

    expect(interaction.links).toHaveLength(0);
    interaction.registerLink(link);

    expect(interaction.links).toHaveLength(1);
    expect(interaction.links[0]).toBe(link);
    expect(interaction.links[0].interaction).toBe(interaction);
});
