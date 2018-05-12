const myStrom = new MyStromSwitch(onChangeMyStrom);


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector("#mystrom-switch").addEventListener('click', () => myStrom.toggle());
});

function onChangeMyStrom(type, value) {
    if (type === 'power') {
        document.querySelector("#mystrom-switch .power").textContent = (value === 0 ? '' : value);
    } else if (type === 'relay') {
        document.querySelector("#mystrom-switch .relay").style.background = (value ? '#76FF03' : '#d50000');
    }
}
