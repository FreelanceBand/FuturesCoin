document.addEventListener('changedLanguage', function () {
    if (window.selections) {
        window.selections.forEach(function (select) {
            let variants = [];
            // let dictonary = window.localisation.getDictonary();
            select.options.forEach((option, count) => variants.push({
                value: option.value,
                label: option.l10nTitle && localisation.getField(option.l10nTitle) ? localisation.getField(option.l10nTitle) : (option.title ? option.title : `Error`),
                selected: count === 0
            }), this);

            select.choices.setChoices(variants, 'value', 'label', true);
        });
        window.selections.forEach(select => select.choices.init());
    } else {
        window.selections = [];
        document.querySelectorAll('.select-wrapper select').forEach(function (node) {
            window.selections.push({
                node, options: function () {
                    let optionsList = [];
                    node.querySelectorAll('option').forEach(option => optionsList.push({
                        title: option.innerHTML,
                        value: option.value,
                        l10nTitle: option.dataset.l10nContent ? option.dataset.l10nContent : false
                    }));
                    return optionsList;
                }(), choices: new Choices(node, {searchEnabled: false, itemSelectText: ''})
            });
        }, this)
    }
});

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

function checkTimeValue() {
    let value = parseInt(document.querySelector('#time').value);
    document.querySelector('#timeFall').disabled = value <= 1;
}

function mask(event, node) {
    node = node ? node : event.target;
    node.value = node.value.replace(/[^a-z0-9]+/gi, '').replace(/(.{3})/g, '$1 ');
    return true;
}