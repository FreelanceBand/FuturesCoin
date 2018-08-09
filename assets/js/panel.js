class Panel {

    constructor() {
        this.onceinit = 0;
        if (!User.getUserData()) return User.logout();
        // this.renderPage.call(this);
    }


    renderPage(page = 'bet') {
        if (this.onceinit == 0) {
            this.onceinit = 1;
            localStorage.removeItem('cryptoData');
        }
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
                document.querySelector('.icon.bet.active').className = "icon bet";
                document.querySelector('.icon.profile').className = "icon profile active";
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
                try {
                    var scroll_section = document.querySelector(".scroll-section").querySelector(".active");
                    scroll_section.click();
                } catch (e) {
                }

                document.querySelector('.icon.bet').className = "icon bet active";
                document.querySelector('.icon.profile').className = "icon profile";
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
            {title: 'Bets', l10nTitle: 'text_finance', class: 'icon bet active', page: 'bet'},
            {title: 'Profile', l10nTitle: 'text_personal_area', class: 'icon profile', page: 'profile'},
            {title: 'Instructions', l10nTitle: 'text_instruction', class: 'icon about', href: '#about'},
            {title: 'Log out', l10nTitle: 'exit', class: 'icon logout', action: User.logout},
        ];
        menuItems.forEach(function (item) {
            let itemNode = document.createElement('a');
            let itemNodeText = document.createElement('p');
            let itemNodeSpan = document.createElement('span');
            itemNodeSpan.className = "red_count_bet_unclarified";
            var countUncl = this.getCountUnclarified();
            itemNodeSpan.innerHTML = countUncl;
            let title = item.title ? item.title : null;
            if (item.l10nTitle) {
                itemNodeText.dataset.l10nContent = item.l10nTitle;
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
                    var page;
                    if (event.target.tagName == 'A') {
                        page = event.target.dataset.page;
                    } else {
                        page = event.target.parentElement.dataset.page;
                    }
                    this.renderPage(page);
                    return true;
                }.bind(this));
            }
            if (item.action) itemNode.addEventListener('click', item.action);
            itemNodeText.innerHTML = title;
            itemNode.appendChild(itemNodeText);
            if (item.class == 'icon profile' && countUncl > 0)
                itemNode.appendChild(itemNodeSpan);
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
        <a href="https://coinmarketcap.com" target="_blank">coinmarketcap.com</a>
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
        modalContentNode.innerHTML = modalSource + `<a class="close" href="#" data-l10n-content="close" > ${localisation.getField('close')} </a>`;
        modalNode.appendChild(modalContentNode);

        document.body.appendChild(modalNode);

        localisation.replaceStrings(false, modalNode);
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
                {id: 'price_btc', l10nTitle: 'price'},
                {id: 'h24_ratio_change', l10nTitle: 'changes_in_24_hours'}
            ];
            tableSource = `<li>`;
            fields.forEach(function (field) {
                tableSource += `<div data-l10n-content="${field.l10nTitle}">${localisation.getField(field.l10nTitle)}</div>`;
            }, this);
            tableSource += `</li><div class="scroll-section">`;
            data.forEach(function (item) {
                if (item.symbol.toLowerCase() == "btc") {
                }
                else {
                    tableSource += `<li onclick="return User.selectBaseCoin(this);" data-coin-symbol="${item.symbol}">`;
                    fields.forEach(function (field) {
                        switch (field.id) {
                            case 'name':
                                tableSource += `<div><img src="//futurescoin.pro/assets/images/coins/${item.symbol.toLowerCase()}.png"><span>${item[field.id]}</span></div>`;
                                break;
                            case 'h24_ratio_change':
                                tableSource += `<div class="${item[field.id] < 0 ? `red` : (item[field.id] > 0 ? `green` : ``)}">${item[field.id]}%</div>`;
                                break;
                            case 'price_btc':
                                var value = this.number_format(item[field.id], 9, ",", " ");
                                tableSource += `<div>Ƀ ${value}</div>`;
                                break;
                            default:
                                var value = this.number_format(item[field.id], 0, ",", " ");
                                tableSource += `<div>$ ${value}</div>`;
                                break;
                        }
                    }, this);
                    tableSource += `</li>`;
                }
            }, this);
            tableSource += `</div>`;
        } else tableSource = 'Loading ...';

        cryptoInfoNode.innerHTML = tableSource;
        return cryptoInfoNode;
    }

    getCountUnclarified() {
        var historyData = User.getBetHistoryData();
        var count = 0;
        if (historyData) historyData.forEach(function (item, id) {
            if (item.status == 'UNCLARIFIED') {
                count++;
            }
        });

        return count;
    }

    getCryptoData() {
        if (localStorage.getItem('cryptoData') != null && localStorage.getItem('cryptoData').length > 0) {
            return JSON.parse(localStorage.getItem('cryptoData'));
        }
        fetch("/core/tokens.php", {
            method: 'GET',
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.errorWorker(result); // console.error(result.msg ? result.msg : `Error code: ${result.code}`);
            if (result.data) {
                localStorage.setItem('cryptoData', JSON.stringify(result.data));
            }
            // this.genCryptoInfo(false, result.data);
            // User.renderSelectOptions(result.data);
            panel.renderPage();
        }.bind(this));
        return false;
    }

    number_format(number, decimals, dec_point, thousands_sep) {	// Format a number with grouped thousands
        //
        // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +	 bugfix by: Michael White (http://crestidg.com)

        var i, j, kw, kd, km;

        // input sanitation & defaults
        if (isNaN(decimals = Math.abs(decimals))) {
            decimals = 2;
        }
        if (dec_point == undefined) {
            dec_point = ",";
        }
        if (thousands_sep == undefined) {
            thousands_sep = ".";
        }

        i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

        if ((j = i.length) > 3) {
            j = j % 3;
        } else {
            j = 0;
        }

        km = (j ? i.substr(0, j) + thousands_sep : "");
        kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
        //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
        kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");


        return km + kw + kd;
    }

    getDaysCaptionId(days) {
        switch (days % 10) {
            case 1:
                return days === 11 ? 'days' : 'day';
            case 2:
            case 3:
            case 4:
                return days > 10 && days < 20 ? 'days' : 'days2';
            default:
                return 'days';
        }
    }

}