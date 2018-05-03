window.localisation = new L10n();
let enLangButton = document.querySelector('#lang-en');
let ruLangButton = document.querySelector('#lang-ru');
if (enLangButton) enLangButton.addEventListener('click', changeLanguage);
if (ruLangButton) ruLangButton.addEventListener('click', changeLanguage);

function changeLanguage(event) {
    return localisation.changeLanguage(event.target.value);
}