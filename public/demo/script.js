const myStrom = new MyStromSwitch(onChangeMyStrom);
const hueLamp = new HueColorLamp(onChangeHueLamp);
const hueMotion = new HueMotionSensor(onChangeHueMotion);
const hueTemperature = new HueTemperatureSensor(onChangeHueTemperature);
const thingy = new Thingy52(onChangeThingy);


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#mystrom-switch').addEventListener('click', () => myStrom.toggle());

    document.querySelector('#hue-color-lamp .click-toggle').addEventListener('click', () => hueLamp.toggle());

    const color = document.querySelector('#hue-color-lamp .color');
    color.addEventListener('change', () => {
        if (!hueLamp.on) {
            hueLamp.toggle();
        }
        hueLamp.setColor(color.value);
    });
});

// Change listeners
function onChangeMyStrom(type, value) {
    if (type === 'power') {
        document.querySelector('#mystrom-switch .power').textContent = (value === 0 ? '' : value + ' W');
    } else if (type === 'relay') {
        document.querySelector('#mystrom-switch .relay').style.background = (value ? '#76FF03' : '#d50000');
    }
}

function onChangeHueLamp(type, value) {
    if (type === 'on') {
        document.querySelector('#hue-color-lamp .color').value = (value && hueLamp.color !== undefined ? hueLamp.color : '#000000');
    } else if (type === 'color' && hueLamp.on === true) {
        document.querySelector('#hue-color-lamp .color').value = value;
    }
}

function onChangeHueMotion(type, value) {
    document.querySelector('#hue-motion-sensor .motion').style.background = (value ? '#d50000' : '#d3d3d3');
    turnOnHueLampIfMotion(value);
}

function onChangeHueTemperature(type, value) {
    document.querySelector('#hue-motion-sensor .temperature').textContent = value + ' °C';
}

function onChangeThingy(type, value) {
    if (type === 'co2') {
        const co2 = document.querySelector('#thingy-52 .co2');
        co2.textContent = value;
        if (value < 800) {
            co2.style.background = '#76FF03';
        } else if (value < 1400) {
            co2.style.background = '#FFEA00';
        } else {
            co2.style.background = '#d50000';
        }
        turnOnFanIfHighCo2(value);
    } else if (type === 'color') {
        setHueColorFromThingy(value);
    } else if (type === 'button') {
        document.querySelector('#thingy-52 .button').style.background = (value === 'Pressed' ? '#d50000' : '');
    }
}

// Scenario
let turnedOnMotion = false;
function turnOnHueLampIfMotion(motion) {
    if (motion && !hueLamp.on) {
        hueLamp.toggle();
        turnedOnMotion = true;
        displayMessage('Motion detected, turning on Hue lamp');
    } else if (turnedOnMotion) {
        hueLamp.toggle();
        turnedOnMotion = false;
        displayMessage('No motion detected anymore, turning off Hue lamp');
    }
}

let turnedOnCo2 = false;
function turnOnFanIfHighCo2(co2) {
    if (co2 >= 1400 && !myStrom.relay) {
        myStrom.setRelay(true);
        turnedOnCo2 = true;
        displayMessage('CO2 above 1400 ppm, turning on fan');
    } else if (turnedOnCo2 && co2 < 1400) {
        myStrom.setRelay(false);
        turnedOnCo2 = false;
        displayMessage('CO2 no longer above 1400 ppm, turning off fan');
    }
}

function setHueColorFromThingy(color) {
    if (thingy.button === 'Pressed') {
        if (!hueLamp.on) {
            hueLamp.toggle();
        }
        hueLamp.setColor(color);
        displayMessage('Setting Hue lamp color to: ' + color);
    }
}

let messageTimeoutMs, timerId;
function displayMessage(text) {
    const message = document.querySelector('#message .text');
    messageTimeoutMs = 5000;

    message.textContent = text;

    clearTimeout(timerId);
    timerId = setInterval(() => {
        message.textContent = '';
    }, messageTimeoutMs);
}
