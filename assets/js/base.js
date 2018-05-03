window.localisation = new L10n();
let changeLangButton = document.querySelector('.change-language');
if (changeLangButton) changeLangButton.addEventListener('click', event => localisation.changeLanguage(event.target.dataset.targetLanguage));
