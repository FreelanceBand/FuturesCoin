class Panel {

    constructor() {
        if (!User.getUserData()) return User.logout();
        this.renderPage.call(this);
    }

    renderPage(page = 'profile') {
        this.resetDocument();
        switch (page) {
            case 'profile':
                this.prepareWrapper({header: true, modals: ['about']});
                let profileInfo = null;
                try {
                    profileInfo = User.genProfileInfo('section');
                } catch (e) {
                    console.error(e);
                    profileInfo = document.createElement('section');
                    profileInfo.innerHTML = 'Error';
                }
                let betHistory = null;
                try {
                    betHistory = User.genBetHistory('section');
                } catch (e) {
                    console.error(e);
                    betHistory = document.createElement('section');
                    betHistory.innerHTML = 'Error';
                }
                document.querySelector('main').className = 'vertical-responsive';
                document.querySelector('main').appendChild(profileInfo);
                document.querySelector('main').appendChild(betHistory);
                break;
            case 'bet':
                this.prepareWrapper({header: true, footer: true, modals: ['about']});
                break;
        }
    }

    resetDocument() {
        document.body.innerHTML = '';
    }

    prepareWrapper({header = false, footer = false, modals = [], wrapperNode = document.body} = {}) {
        wrapperNode.className = 'panel';
        if (header) wrapperNode.appendChild(this.genHeader());
        let mainNode = document.createElement('main');
        wrapperNode.appendChild(mainNode);
        if (modals.length > 0) modals.forEach(function (modal) {
            this.loadModalSource(modal).then(function (source) {
                return this.renderModal(modal, source);
            }.bind(this));
        }, this);
        if (footer) wrapperNode.appendChild(this.genFooter());
    }

    genHeader() {
        let headerNode = document.createElement('header');
        let leftSection = document.createElement('div');
        leftSection.appendChild(this.genLogo());
        let rightSection = document.createElement('div');
        rightSection.appendChild(this.genMenu());
        headerNode.appendChild(leftSection);
        headerNode.appendChild(rightSection);
        return headerNode;
    }

    genLogo() {
        let logoNode = document.createElement('figure');
        logoNode.classList.add('logo');
        logoNode.innerHTML = `Futures<span>Coin</span>`;
        return logoNode;
    }

    genMenu() {
        let menuNode = document.createElement('nav');
        let menuItems = [
            {title: 'Bets', l10nTitle: 'text_finance', class: 'icon bet', page: 'bet'},
            {title: 'Profile', l10nTitle: 'text_personal_area', class: 'icon profile', page: 'profile'},
            {title: 'Instructions', l10nTitle: 'text_instruction', class: 'icon about', href: '#about'},
            {title: 'Log out', l10nTitle: 'exit', class: 'icon logout', action: User.logout},
        ];
        menuItems.forEach(function (item) {
            let itemNode = document.createElement('a');
            let title = item.title ? item.title : null;
            if (item.l10nTitle) {
                itemNode.dataset.l10nContent = item.l10nTitle;
                try {
                    title = localisation.getField(item.l10nTitle);
                } catch (e) {
                    if (item.title) title = item.title;
                }
            }
            if (item.class) itemNode.className = item.class;
            if (item.href) itemNode.href = item.href;
            if (item.page) {
                itemNode.dataset.page = item.page;
                itemNode.addEventListener('click', function (event) {
                    this.renderPage(event.target.dataset.page);
                    return true;
                }.bind(this));
            }
            if (item.action) itemNode.addEventListener('click', item.action);
            itemNode.innerHTML = title;
            menuNode.appendChild(itemNode);
        }, this);
        return menuNode;
    }

    genFooter() {
        return document.createElement('footer');
    }

    loadModalSource(modal = null) {
        return fetch('/modal/' + modal + '.html').then(function (response) {
            return response.text();
        }).then(function (result) {
            return result;
        }).catch(function () {
            return false;
        })
    }

    renderModal(modalId = false, modalSource = false) {
        if (!modalSource) return false;
        let modalNode = document.createElement('div');
        modalNode.id = modalId;
        modalNode.className = 'modal';
        if (modalId === 'about') modalNode.classList.add('full-screen');
        let modalContentNode = document.createElement('div');
        modalContentNode.className = 'content';
        modalContentNode.innerHTML = modalSource + `<a class="close" href="#" data-l10n-content="close">${localisation.getField('close')}</a>`;
        modalNode.appendChild(modalContentNode);
        document.body.appendChild(modalNode);
        localisation.replaceStrings(false, modalNode);
    }
}