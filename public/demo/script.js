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
            co2.style.background = '#FFC107';
        } else {
            co2.style.background = '#d50000';
        }
    } else if (type === 'humidity') {
        document.querySelector('#thingy-52 .humidity').textContent = value + '%';
    } else if (type === 'color') {
        // Set hue color from thingy sensor if button pressed
        if (thingy.button === 'Pressed') {
            if (!hueLamp.on) {
                hueLamp.toggle();
            }
            hueLamp.setColor(value);
        }
    } else if (type === 'button') {
        document.querySelector('#thingy-52 .button').style.background = (value === 'Pressed' ? '#d50000' : '');
    }
}
