document.addEventListener('changedLanguage', rebuildSelects);

window.apiURL = '/api/';
window.localisation = new L10n({localizeOnInit: true});

bindLocalisationButtons();

function bindLocalisationButtons(targetNode = document) {
    let enLangButton = targetNode.querySelector('#lang-en');
    let ruLangButton = targetNode.querySelector('#lang-ru');
    if (enLangButton) enLangButton.addEventListener('click', changeLanguage);
    if (ruLangButton) ruLangButton.addEventListener('click', changeLanguage);
}

function rebuildSelects(selectId = false, customOptions = false) {
    if (window.selections) {
        window.selections.forEach(function (select) {
            if (selectId && select.node.id !== selectId) return;
            let variants = [];
            // let dictonary = window.localisation.getDictonary();
            let targetOptions = customOptions ? customOptions : select.options;
            targetOptions.forEach((option, count) => variants.push({
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
}

function changeLanguage(event) {
    return localisation.changeLanguage(event.target.value);
}

function serialize(obj, prefix) {
    let str = [], p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            let k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

function checkTimeValue(targetNode = document) {
    let value = parseInt(targetNode.querySelector('#time').value);
    targetNode.querySelector('#timeFall').disabled = value <= 1;
}

function mask(event, node) {
    node = node ? node : event.target;
    node.value = node.value.replace(/[^a-z0-9]+/gi, '').replace(/(.{3})/g, '$1 ');
    return true;
}

function disableSubmit(form) {
    let submitNode = form.querySelector(`button[type=submit]`);
    if (!submitNode) return false;
    submitNode.disabled = true;
    return true;
}

function enableSubmit(form) {
    let submitNode = form.querySelector(`button[type=submit]`);
    if (!submitNode) return false;
    submitNode.disabled = false;
    return true;
}

function splitDate(dateString) {
    return dateString.split(' ');
}