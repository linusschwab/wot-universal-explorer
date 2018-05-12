const base = 'ws://localhost:5000';

class MyStromSwitch {
    constructor(onChange) {
        this.ws = new WebSocket(base + '/mystrom-switch');
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'event') {
                const power = Math.round(message.data.change.power * 100) / 100;
                if (this.power !== power) {
                    this.power = power;
                    onChange('power', power);
                }

                const relay = message.data.change.relay;
                if (this.relay !== relay) {
                    this.relay = relay;
                    onChange('relay', relay);
                }
            } else {
                console.log(message);
            }
        };

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                'messageType': 'addSubscription',
                'data': {'event': 'change'}
            }));
        };
    }

    toggle() {
        this.ws.send(JSON.stringify({
            'messageType': 'requestAction',
            'data': {'toggle': {}}
        }));
    }
}
