document.addEventListener('changedLanguage', rebuildSelects);

window.apiURL = '/api/';
window.localisation = new L10n({localizeOnInit: true});

bindLocalisationButtons();

if (document.querySelector(`#l10n-indicator`)) document.querySelector(`#l10n-indicator`).innerHTML = genL10nIndicator();

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
            let itemData = {
                node, options: function () {
                    let optionsList = [];
                    node.querySelectorAll('option').forEach(option => optionsList.push({
                        title: option.innerHTML,
                        value: option.value,
                        l10nTitle: option.dataset.l10nContent ? option.dataset.l10nContent : false
                    }));
                    return optionsList;
                }(), choices: new Choices(node, {searchEnabled: false, itemSelectText: ''})
            };
            node.choices = itemData.choices;
            window.selections.push(itemData);
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
    if (isNaN(value)) targetNode.querySelector('#time').value = 1;
    else if (value > 30) targetNode.querySelector('#time').value = 30;
    else if (value < 1) targetNode.querySelector('#time').value = 1;

    targetNode.querySelector('#timeFall').disabled = value <= 1;
    targetNode.querySelector('#timeRise').disabled = value >= 30;
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

function splitTime(dateString) {
    return dateString.split(':');
}

function splitDateMinus(dateString) {
    return dateString.split('-');
}

function showFormError(message, inputNode) {
    if (!inputNode) return alert(message);
    inputNode.setCustomValidity(message);
    simulateClick(inputNode.form.querySelector(`button[type="submit"]`));
    inputNode.addEventListener('change', e => e.target.setCustomValidity(''));
    return false;
}

var simulateClick = function (elem) {
    // Create our event (with options)
    var evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    // If cancelled, don't dispatch our event
    var canceled = !elem.dispatchEvent(evt);
};

function genL10nIndicator() {
    let source = `<div class="change-language custom-select">`;
    let selectedLanguage = localisation.getSelectedLanguage();
    let languagesList = [
        {id: 'en', title: 'EN', icon: '/assets/images/eng-icon.svg'},
        {id: 'ru', title: 'RU', icon: '/assets/images/ru-icon.svg'},
    ];
    languagesList.forEach(lang => source += `<div><input id="lang-${lang.id}" value="${lang.id}" name="lang" type="radio" ${selectedLanguage === lang.id ? `checked` : ``} onclick="return changeLanguage(event)"><label for="lang-${lang.id}"><img src="${lang.icon}">${lang.title}</label></div>`);
    source += `</div>`;
    return source;
}