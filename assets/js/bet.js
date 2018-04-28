const choices = new Choices('.select-wrapper select', {searchEnabled: false, itemSelectText: ''});

checkTimeValue();

document.querySelector('#time').addEventListener('change', checkTimeValue);

document.querySelector('#timeFall').addEventListener('click', function () {
    let value = parseInt(document.querySelector('#time').value);
    document.querySelector('#time').value = --value;
    checkTimeValue();
});

document.querySelector('#timeRise').addEventListener('click', function () {
    let value = parseInt(document.querySelector('#time').value);
    document.querySelector('#time').value = ++value;
    checkTimeValue();
});

document.querySelectorAll('[data-input-mask]').forEach(function (node) {
    node.addEventListener('keypress', mask);
    node.addEventListener('change', mask);
    node.addEventListener('blur', mask);
    mask(false, node);
});

/*document.querySelector('.amount .custom-select').addEventListener('click', function () {
    this.blur();
    this.querySelectorAll('input:not(:checked) + label').forEach(function (node) {
        node.style.display = 'none';
    });
    let self = this;
    setTimeout(function () {
        // self.style.pointerEvents = 'initial';
        self.querySelectorAll('input:not(:checked) + label').forEach(function (node) {
            node.style.display = 'none';
        });
    }, 100);
});*/

/*document.querySelectorAll('.custom-select input[type="radio"]').forEach(function (node) {
    node.addEventListener('click', function (event) {
        this.wait = true;
        this.parentNode.parentNode.classList.add('hide');
        let self = this;∂
        setTimeout(function () {
            self.wait = false;
        }, 50);
    });
    document.documentElement.addEventListener('click', function (event) {
        if (node.wait) {
            setTimeout(function () {
                node.parentNode.parentNode.classList.remove('hide');
            })
        } else node.parentNode.parentNode.classList.remove('hide');
    });
    document.documentElement.addEventListener('mousemove', function (event) {
        if (node.wait) {
            setTimeout(function () {
                node.parentNode.parentNode.classList.remove('hide');
            })
        } else node.parentNode.parentNode.classList.remove('hide');
    });
});*/

function checkTimeValue() {
    let value = parseInt(document.querySelector('#time').value);
    document.querySelector('#timeFall').disabled = value <= 1;
}

function mask(event, node) {
    node = node ? node : event.target;
    node.value = node.value.replace(/[^a-z0-9]+/gi, '').replace(/(.{3})/g, '$1 ');
    return true;
}