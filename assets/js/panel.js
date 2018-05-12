class Panel {

    constructor() {
        if (!User.getUserData()) return User.logout();
        // this.renderPage.call(this);
    }

    renderPage(page = 'bet') {
        this.resetDocument();
        switch (page) {
            case 'profile':
                this.prepareWrapper({header: true, footer: true, modals: ['about']});
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
                let cryptoInfo = null;
                try {
                    cryptoInfo = this.genCryptoInfo('ul');
                } catch (e) {
                    console.error(e);
                    cryptoInfo = document.createElement('ul');
                    cryptoInfo.innerHTML = 'Error';
                }
                let betForm = null;
                try {
                    betForm = User.genBetForm('form');
                } catch (e) {
                    console.error(e);
                    betForm = document.createElement('form');
                    betForm.innerHTML = 'Error';
                }
                document.querySelector('main').className = 'bet';
                document.querySelector('main').appendChild(cryptoInfo);
                document.querySelector('main').appendChild(betForm);
                User.renderSelectOptions();
                User.changeBetCoin();
                rebuildSelects();
                User.getBetHistoryData();
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
        let footerNode = document.createElement('footer');
        footerNode.innerHTML = `<div style="display: flex;">
        <div class="select-wrapper">
            ${genL10nIndicator()}
        </div>
        <span><span data-l10n-content="rights_reserved">${localisation.getField('rights_reserved')}</span>, 2017–2018.</span>
    </div>
    <div>
        <span data-l10n-content="relevance_data">${localisation.getField('relevance_data')}</span>
        <img src="/assets/images/heart.svg">
        <a href="https://coinmarketcup.com" target="_blank">coinmarketcup.com</a>
    </div>`;
        bindLocalisationButtons(footerNode);
        return footerNode;
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
        modalContentNode.innerHTML = modalSource + `<
    a
    class = "close"
    href = "#"
    data
-
    l10n
-
    content = "close" > ${localisation.getField('close')} < /a>`;
        modalNode
            .appendChild(modalContentNode);

        document
            .body
            .appendChild(modalNode);

        localisation
            .replaceStrings(
                false
                ,
                modalNode
            )
        ;
    }

    genCryptoInfo(tagName = 'div', data = false) {
        let cryptoInfoNode = document.querySelector(`.coins-info.table`);
        if (!cryptoInfoNode) {
            cryptoInfoNode = document.createElement(tagName);
            cryptoInfoNode.className = 'coins-info table';
        }
        let tableSource = '';
        data = data ? data : this.getCryptoData();
        if (data) {
            let fields = [
                {id: 'name', l10nTitle: 'currency'},
                {id: 'market_cap', l10nTitle: 'market_capitalization'},
                {id: 'price_usd', l10nTitle: 'price'},
                {id: 'h24_ratio_change', l10nTitle: 'changes_in_24_hours'}
            ];
            tableSource = `<li>`;
            fields.forEach(function (field) {
                tableSource += `<div data-l10n-content="${field.l10nTitle}">${localisation.getField(field.l10nTitle)}</div>`;
            }, this);
            tableSource += `</li><div class="scroll-section">`;
            data.forEach(function (item) {
                tableSource += `<li onclick="return User.selectBaseCoin(this);" data-coin-symbol="${item.symbol}">`;
                fields.forEach(function (field) {
                    switch (field.id) {
                        case 'name':
                            tableSource += `<div><img src="/assets/images/coins/${item.symbol.toLowerCase()}.png"><span>${item[field.id]}</span></div>`;
                            break;
                        case 'h24_ratio_change':
                            tableSource += `<div class="${item[field.id] < 0 ? `red` : (item[field.id] > 0 ? `green` : ``)}">${item[field.id]}%</div>`;
                            break;
                        default:
                            tableSource += `<div>${item[field.id]} $</div>`;
                            break;
                    }
                }, this);
                tableSource += `</li>`;
            }, this);
            tableSource += `</div>`;
        } else tableSource = 'Loading ...';
        cryptoInfoNode.innerHTML = tableSource;
        return cryptoInfoNode;
    }

    getCryptoData() {
        if (localStorage.getItem('cryptoData')) return JSON.parse(localStorage.getItem('cryptoData'));
        fetch(apiURL + 'tokens', {
            method: 'GET',
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return alert(result.msg ? result.msg : `Error code: ${result.code}`);
            if (result.data) localStorage.setItem('cryptoData', JSON.stringify(result.data));
            // this.genCryptoInfo(false, result.data);
            // User.renderSelectOptions(result.data);
            panel.renderPage();
        }.bind(this));
        return false;
    }
}