import {InteractionPattern} from "../interaction";

export class Operation {

    public type: string;
    public description: string;
    public interaction: InteractionPattern;

    constructor(type: string, description: string, interaction: InteractionPattern) {
        this.type = type;
        this.description = description;
        this.interaction = interaction;
    }

}
