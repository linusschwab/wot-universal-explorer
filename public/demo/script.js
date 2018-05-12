const myStrom = new MyStromSwitch(onPowerChange, onRelayChange);


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector("#mystrom-switch").addEventListener('click', () => myStrom.toggle());
});

function onPowerChange(power) {
    document.querySelector("#mystrom-switch .power").textContent = (power === 0 ? '' : power);
}

function onRelayChange(relay) {
    document.querySelector("#mystrom-switch .relay").style.background = (relay ? '#76FF03' : '#d50000');
}
