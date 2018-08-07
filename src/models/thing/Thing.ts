import * as WebSocket from "ws";
import * as getSlug from "speakingurl";

import {Action, InteractionPattern, Property, Event, ISubscriber} from "../interactions";
import {InteractionError} from "../../tools/errors";


export class Thing {

    public name: string;
    public description: string;
    public type: string;

    public base: string;
    public interactions: InteractionPattern[];

    constructor(name: string, type: string, base = '') {
        this.name = name;
        this.type = type;
        this.base = base;
        this.interactions = [];
    }

    public async readProperty(name: string): Promise<any> {
        const property = this.getProperty(name);
        return property.read();
    }

    public async writeProperty(name: string, data: any): Promise<any> {
        const property = this.getProperty(name);
        return property.write(data);
    }

    public subscribeToProperty(name: string, subscriber: ISubscriber) {
        const property = this.getProperty(name);
        property.subscribe(subscriber);
    }

    public unsubscribeFromProperty(name: string, subscriber: ISubscriber) {
        const property = this.getProperty(name);
        property.unsubscribe(subscriber);
    }

    public async invokeAction(name: string, data: any = null): Promise<any> {
        const action = this.getAction(name);
        return action.invoke(data);
    }

    public subscribeToAction(name: string, subscriber: ISubscriber) {
        const action = this.getAction(name);
        action.subscribe(subscriber);
    }

    public unsubscribeFromAction(name: string, subscriber: ISubscriber) {
        const action = this.getAction(name);
        action.unsubscribe(subscriber);
    }

    public async getEventData(name: string, newerThan: number = 0, limit: number = 0): Promise<any> {
        const event = this.getEvent(name);
        return event.getData(newerThan, limit);
    }

    public subscribeToEvent(name: string, subscriber: ISubscriber) {
        const event = this.getEvent(name);
        event.subscribe(subscriber);
    }

    public unsubscribeFromEvent(name: string, subscriber: ISubscriber) {
        const event = this.getEvent(name);
        event.unsubscribe(subscriber);
    }

    public subscribe(subscriber: ISubscriber) {
        for (let interaction of this.interactions) {
            try {
                interaction.subscribe(subscriber);
            } catch (e) {
                if (e instanceof InteractionError === false) {
                    throw e;
                }
            }
        }
    }

    public unsubscribe(subscriber: ISubscriber) {
        for (let interaction of this.interactions) {
            try {
                interaction.unsubscribe(subscriber);
            } catch (e) {
                if (e instanceof InteractionError === false) {
                    throw e;
                }
            }
        }
    }

    public registerInteraction(interaction: InteractionPattern) {
        interaction.thing = this;
        interaction.base = this.base;
        this.interactions.push(interaction);
    }

    public getInteraction(name: string): InteractionPattern {
        for (let interaction of this.interactions) {
            if (interaction.slug == getSlug(name)) {
                return interaction;
            }
        }
        throw new InteractionError('No interaction with name ' + name);
    }

    public getProperty(name: string): Property {
        for (let property of this.properties) {
            if (property.slug == getSlug(name)) {
                return property;
            }
        }
        throw new InteractionError('No property with name ' + name);
    }

    public getAction(name: string): Action {
        for (let action of this.actions) {
            if (action.slug == getSlug(name)) {
                return action;
            }
        }
        throw new InteractionError('No action with name ' + name);
    }

    public getEvent(name: string): Event {
        for (let event of this.events) {
            if (event.slug == getSlug(name)) {
                return event;
            }
        }
        throw new InteractionError('No event with name ' + name);
    }

    public toString() {
        return this.name;
    }

    get properties() {
        let properties: Property[] = [];
        for (let interaction of this.interactions) {
            if (interaction instanceof Property) {
                properties.push(interaction)
            }
        }
        return properties;
    }

    get actions() {
        let actions: Action[] = [];
        for (let interaction of this.interactions) {
            if (interaction instanceof Action) {
                actions.push(interaction)
            }
        }
        return actions;
    }

    get events() {
        let events: Event[] = [];
        for (let interaction of this.interactions) {
            if (interaction instanceof Event) {
                events.push(interaction)
            }
        }
        return events;
    }

    get links() {
        let links = [];
        for (let interaction of this.interactions) {
            for (let link of interaction.links) {
                links.push(link);
            }
        }
        return links;
    }

    get subscribers() {
        let subscribers: ISubscriber[] = [];
        for (let interaction of this.interactions) {
            for (let ws of interaction.subscribers) {
                if (!subscribers.includes(ws)) {
                    subscribers.push(ws);
                }
            }
        }
        return subscribers;
    }

    get slug() {
        return getSlug(this.name);
    }
}
