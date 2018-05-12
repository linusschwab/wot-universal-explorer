const myStrom = new MyStromSwitch(onPowerChange, onRelayChange);


document.addEventListener('DOMContentLoaded', function() {

});

function onPowerChange(power) {
    document.querySelector("#mystrom-switch .power").textContent = power;
}

function onRelayChange(relay) {
    document.querySelector("#mystrom-switch .relay").style.background = (relay ? '#76FF03' : '#d50000');
}
