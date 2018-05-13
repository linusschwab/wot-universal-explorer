const myStrom = new MyStromSwitch(onChangeMyStrom);
const hueLamp = new HueColorLamp(onChangeHueLamp);


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector("#mystrom-switch").addEventListener('click', () => myStrom.toggle());

    document.querySelector("#hue-color-lamp .click-toggle").addEventListener('click', () => hueLamp.toggle());

    const color = document.querySelector("#hue-color-lamp .color");
    color.addEventListener('change', () => {
        if (!hueLamp.on) {
            hueLamp.toggle();
        }
        hueLamp.setColor(color.value);
    });
});

function onChangeMyStrom(type, value) {
    if (type === 'power') {
        document.querySelector("#mystrom-switch .power").textContent = (value === 0 ? '' : value);
    } else if (type === 'relay') {
        document.querySelector("#mystrom-switch .relay").style.background = (value ? '#76FF03' : '#d50000');
    }
}

function onChangeHueLamp(type, value) {
    if (type === 'on') {
        document.querySelector("#hue-color-lamp .color").value = (value && hueLamp.color !== undefined ? hueLamp.color : '#000000');
    } else if (type === 'color' && hueLamp.on === true) {
        document.querySelector("#hue-color-lamp .color").value = value;
    }
}
