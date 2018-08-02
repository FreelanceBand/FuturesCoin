class L10n {

    constructor({sourcesPath = '/l10n', localizeOnInit = false} = {}) {
        this.parameters = {sourcesPath};
        this.languageData = {};
        this.selectedLanguage = this.getSelectedLanguage();
        this.changeLanguage(this.selectedLanguage);
    }

    defaultLanguage() {
        return 'en';
    }

    changeLanguage(language) {
        language = language ? language : 'en';
        return new Promise(function (resolve, reject) {
            if (!this.languageData[language]) return resolve(this.loadDictionary(language));
            return resolve(language);
        }.bind(this))
            .then(this.replaceStrings.bind(this))
            .then(this.saveSelectedLanguage.bind(this))
            .then(function () {
                document.body.dataset.language = language;
                let event = new CustomEvent('changedLanguage', {detail: {language}});
                document.dispatchEvent(event);
            });
    }

    loadDictionary(language) {
        return fetch(this.parameters.sourcesPath + '/' + language + '.json')
            .then(function (response) {
                return response.json();
            }.bind(this)).then(function (response) {
                if (!response || !response.locale) throw new Error(`Bad language data`);
                if (response.strings) this.languageData[response.locale] = response.strings;
                return language;
            }.bind(this));
    }

    replaceStrings(language, targetNode = document) {
        language = language ? language : this.selectedLanguage;
        if (!this.languageData[language]) throw new Error('Language data loading error');
        targetNode.querySelectorAll(`[data-l10n-content]`).forEach(function (node) {
            let stringData = this.languageData[language][node.dataset.l10nContent];
            if (!stringData) return false;
            if (typeof stringData === "string") node.innerHTML = stringData;
            else if (typeof stringData === "object") {
                let source = '';
                for (let i in stringData) {
                    if (node.dataset.l10nItemContainer) source += `<${node.dataset.l10nItemContainer}>`;
                    if (node.dataset.l10nItemTitle) source += `<${node.dataset.l10nItemTitle}>`;
                    if (stringData[i].title) source += stringData[i].title;
                    if (node.dataset.l10nItemTitle) source += `</${node.dataset.l10nItemTitle}>`;
                    if (stringData[i].content) source += stringData[i].content;
                    if (node.dataset.l10nItemContainer) source += `</${node.dataset.l10nItemContainer}>`;
                }
                node.innerHTML = source;
            }
        }, this);
        targetNode.querySelectorAll(`[data-l10n-placeholder]`).forEach(function (node) {
            let stringData = this.languageData[language][node.dataset.l10nPlaceholder];
            if (!stringData) return false;
            node.placeholder = stringData;
        }, this);
        return language;
    }

    saveSelectedLanguage(language) {
        this.selectedLanguage = language;
        return localStorage.setItem('l10n', language);
    }

    getSelectedLanguage() {
        return localStorage.getItem('l10n');
    }

    getDictonary(language = this.selectedLanguage) {
        return this.languageData[language];
    }

    getField(fieldId, language = this.selectedLanguage) {
        if (!this.getDictonary(language)) return '';
        return this.getDictonary(language)[fieldId];
    }
}