import {InteractionData} from "./InteractionData";
import {InteractionPattern} from "./InteractionPattern";

export interface ISubscriber {
    (interaction: InteractionPattern, data: InteractionData) : void;
}
