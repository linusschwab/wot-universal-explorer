class Thing {
    constructor(onChange, name) {
        this.onChange = onChange;
        this.url = 'ws://localhost:5000/' + name;
        this.setup();
    }

    setup() {
        this.ws = new WebSocket(this.url);

        this.ws.onclose = () => this.reconnect();
        this.ws.onerror = (event) => {};
    }

    reconnect() {
        setTimeout(() => {
            this.setup();
        }, 5000)
    }
}

class MyStromSwitch extends Thing {
    constructor(onChange) {
        super(onChange, 'mystrom-switch');
    }

    setup() {
        super.setup();

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'event') {
                this.updatePower(Math.round(message.data.change.power * 100) / 100);
                this.updateRelay(message.data.change.relay);
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'propertyStatus') {
                this.updatePower(Math.round(message.data.report.power * 100) / 100);
                this.updateRelay(message.data.report.relay);
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'error') {
                console.error(message);
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
    }

    setup() {
        super.setup();

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'propertyStatus') {
                if (message.data.hasOwnProperty('on')) {
                    this.updateOn(message.data.on);
                } else if (message.data.hasOwnProperty('color')) {
                    this.updateColor(message.data.color);
                }
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'error') {
                console.error(message);
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

class HueMotionSensor extends Thing {
    constructor(onChange) {
        super(onChange, 'hue-motion-sensor');
    }

    setup() {
        super.setup();

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'propertyStatus') {
                this.updateOn(message.data.on);
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'error') {
                console.error(message);
            }
        };

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                'messageType': 'addSubscription',
                'data': {'property': 'on'}
            }));

            this.ws.send(JSON.stringify({
                'messageType': 'getProperty',
                'data': {'on': {}}
            }));
        };
    }

    updateOn(on) {
        if (this.on !== on) {
            this.on = on;
            this.onChange('on', on);
        }
    }
}

class HueTemperatureSensor extends Thing {
    constructor(onChange) {
        super(onChange, 'hue-temperature-sensor');
    }

    setup() {
        super.setup();

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'propertyStatus') {
                this.updateTemperature(message.data.temperature);
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'error') {
                console.error(message);
            }
        };

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                'messageType': 'addSubscription',
                'data': {'property': 'temperature'}
            }));

            this.ws.send(JSON.stringify({
                'messageType': 'getProperty',
                'data': {'temperature': {}}
            }));
        };
    }

    updateTemperature(temperature) {
        if (this.temperature !== temperature) {
            this.temperature = temperature;
            this.onChange('temperature', temperature);
        }
    }
}

class Thingy52 extends Thing {
    constructor(onChange) {
        super(onChange, 'thingy-52');
    }

    setup() {
        super.setup();

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'propertyStatus') {
                if (message.data.hasOwnProperty('gas')) {
                    this.updateGas(message.data.gas);
                } else if (message.data.hasOwnProperty('humidity')) {
                    this.updateHumidity(message.data.humidity);
                } else if (message.data.hasOwnProperty('color')) {
                    this.updateColor(message.data.color);
                }
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'event') {
                this.updateButton(message.data.button);
            } else if (message.hasOwnProperty('messageType') && message.messageType === 'error') {
                console.error(message);
            }
        };

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                'messageType': 'addSubscription',
                'data': {
                    'property': ['gas', 'humidity', 'color'],
                    'event': 'button'
                }
            }));

            this.ws.send(JSON.stringify({
                'messageType': 'getProperty',
                'data': {'gas': {}, 'humidity': {}, 'color': {}}
            }));
        };
    }

    updateGas(gas) {
        let co2 = gas.eco2;
        if (this.co2 !== co2) {
            this.co2 = co2;
            this.onChange('co2', co2);
        }
    }

    updateHumidity(humidity) {
        if (this.humidity !== humidity) {
            this.humidity = humidity;
            this.onChange('humidity', humidity);
        }
    }

    updateColor(color) {
        if (this.color !== color) {
            this.color = color;
            this.onChange('color', color);
        }
    }

    updateButton(button) {
        if (this.button !== button) {
            this.button = button;
            this.onChange('button', button);
        }
    }
}
