class Thing {
    constructor(onChange, name) {
        this.onChange = onChange;
        this.ws = new WebSocket('ws://localhost:5000/' + name);
    }
}

class MyStromSwitch extends Thing {
    constructor(onChange) {
        super(onChange, 'mystrom-switch');

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'event') {
                this.updatePower(Math.round(message.data.change.power * 100) / 100);
                this.updateRelay(message.data.change.relay);
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'propertyStatus') {
                this.updatePower(Math.round(message.data.report.power * 100) / 100);
                this.updateRelay(message.data.report.relay);
            } else {
                console.log(message);
            }
        };

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                'messageType': 'addSubscription',
                'data': {'event': 'change'}
            }));

            this.ws.send(JSON.stringify({
                'messageType': 'getProperty',
                'data': {'report': {}}
            }));
        };
    }

    updatePower(power) {
        if (this.power !== power) {
            this.power = power;
            this.onChange('power', power);
        }
    }

    updateRelay(relay) {
        if (this.relay !== relay) {
            this.relay = relay;
            this.onChange('relay', relay);
        }
    }

    toggle() {
        this.ws.send(JSON.stringify({
            'messageType': 'requestAction',
            'data': {'toggle': {}}
        }));
    }
}

class HueColorLamp extends Thing {
    constructor(onChange) {
        super(onChange, 'hue-color-lamp');

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'propertyStatus') {
                if (message.data.hasOwnProperty('on')) {
                    this.updateOn(message.data.on);
                } else if (message.data.hasOwnProperty('color')) {
                    this.updateColor(message.data.color);
                } else {
                    console.log(message);
                }
            } else {
                console.log(message);
            }
        };

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                'messageType': 'addSubscription',
                'data': {'property': ['on', 'color']}
            }));

            this.ws.send(JSON.stringify({
                'messageType': 'getProperty',
                'data': {'on': {}, 'color': {}}
            }));
        };
    }

    updateOn(on) {
        if (this.on !== on) {
            this.on = on;
            this.onChange('on', on);
        }
    }

    updateColor(color) {
        if (this.color !== color) {
            this.color = color;
            this.onChange('color', color);
        }
    }

    toggle() {
        let data = true;
        if (this.on === true) {
            data = false;
        }

        this.ws.send(JSON.stringify({
            'messageType': 'setProperty',
            'data': {'on': data}
        }));
    }

    setColor(color) {
        this.ws.send(JSON.stringify({
            'messageType': 'setProperty',
            'data': {'color': color}
        }));
    }
}
