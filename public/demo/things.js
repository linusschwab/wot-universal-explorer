const base = 'ws://localhost:5000';

class MyStromSwitch {
    constructor(onPowerChange, onRelayChange) {
        const ws = new WebSocket(base + '/mystrom-switch');
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.hasOwnProperty('messageType') && message.messageType === 'event') {
                const power = Math.round(message.data.change.power * 100) / 100;
                if (this.power !== power) {
                    this.power = power;
                    onPowerChange(power);
                }

                const relay = message.data.change.relay;
                if (this.relay !== relay) {
                    this.relay = relay;
                    onRelayChange(relay);
                }
            } else {
                console.log(message);
            }
        };

        ws.onopen = () => {
            ws.send(JSON.stringify({
                'messageType': 'addSubscription',
                'data': {'event': 'change'}
            }));
        };
    }
}
