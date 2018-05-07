window.apiURL = '/api/';
window.localisation = new L10n({localizeOnInit: true});

let enLangButton = document.querySelector('#lang-en');
let ruLangButton = document.querySelector('#lang-ru');
if (enLangButton) enLangButton.addEventListener('click', changeLanguage);
if (ruLangButton) ruLangButton.addEventListener('click', changeLanguage);

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