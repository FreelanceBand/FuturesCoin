class User {
    static logout() {
        // TODO: Request for delete cookie

        localStorage.removeItem('betHistory');
        localStorage.removeItem('userData');
        localStorage.removeItem('cryptoData');
        location.href = '/';
    }

    static getUserData() {
        if (localStorage.getItem('userData')) return JSON.parse(localStorage.getItem('userData'));
        return false;
    }

    static genProfileInfo(tagName = 'div') {
        let infoNode = document.createElement(tagName);
        let userData = User.getUserData();
        let profileImage = document.createElement('div');
        profileImage.className = 'profile-image';

        let profileData = document.createElement('ul');
        profileData.className = 'profile-data table';

        let dataFields = [
            {id: 'user_name', title: 'Login', l10nTitle: 'login_hint'},
            {id: 'email', title: 'Email', l10nTitle: 'email_hint'},
            {id: 'password', title: 'Password', l10nTitle: 'password_hint'},
        ];

        dataFields.forEach(function (field) {
            if (!userData[field.id]) return false;
            let fieldNode = document.createElement('li');
            let fieldTitleNode = document.createElement('div');

            let title = field.title ? field.title : null;
            if (field.l10nTitle) {
                fieldTitleNode.dataset.l10nContent = field.l10nTitle;
                try {
                    title = localisation.getField(field.l10nTitle);
                } catch (e) {
                    if (field.title) title = field.title;
                }
            }
            fieldTitleNode.innerHTML = title;

            let fieldValueNode = document.createElement('div');
            let fieldValueContent = document.createElement('span');
            fieldValueContent.innerHTML = userData[field.id];

            let fieldValueChange = document.createElement('a');

            let changeTitle = 'Change';
            fieldValueChange.dataset.l10nContent = 'change';
            try {
                changeTitle = localisation.getField('change');
            } catch (e) {
                changeTitle = 'Change';
            }
            fieldValueChange.innerHTML = changeTitle;

            fieldValueNode.appendChild(fieldValueContent);
            fieldValueNode.appendChild(fieldValueChange);

            fieldNode.appendChild(fieldTitleNode);
            fieldNode.appendChild(fieldValueNode);
            profileData.appendChild(fieldNode);
        }, this);

        infoNode.appendChild(profileImage);
        infoNode.appendChild(profileData);
        return infoNode;
    }

    static genBetHistory(tagName = 'div') {
        let betHistoryNode = document.createElement(tagName);
        betHistoryNode.className = 'vertical';
        let betHistoryTitle = document.createElement('h2');
        betHistoryTitle.className = 'title';
        betHistoryTitle.dataset.l10nContent = 'rate_history';
        let title = 'Bet history';
        try {
            title = localisation.getField('rate_history');
        } catch (e) {
            title = 'Bet history';
        }
        betHistoryTitle.innerHTML = title;
        betHistoryNode.appendChild(betHistoryTitle);

        // let betHistoryData = User.getBetHistoryData();
        let betHistoryListNode = User.genBetHistoryList(User.getBetHistoryData(), {limit: 4});
        let betHistoryTableNode = User.genBetHistoryTable(User.getBetHistoryData());
        betHistoryNode.appendChild(betHistoryListNode);
        betHistoryNode.appendChild(betHistoryTableNode);
        return betHistoryNode;
    }

    static getBetHistoryData() {
        if (localStorage.getItem('betHistory')) return JSON.parse(localStorage.getItem('betHistory'));
        fetch(apiURL + 'bids', {
            method: 'POST',
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return alert(result.msg ? result.msg : `Error code: ${result.code}`);
            if (result.data) localStorage.setItem('betHistory', JSON.stringify(result.data));
            User.genBetHistoryList(result.data);
        });
        return false;
    }

    static genBetHistoryList(historyData = false, {limit = false} = {}) {
        let betHistoryListNode = document.querySelector(`.bet-history.detailed.grid`);
        if (betHistoryListNode) betHistoryListNode.innerHTML = ''; else betHistoryListNode = document.createElement('ul');
        betHistoryListNode.className = 'bet-history detailed grid';
        if (historyData) historyData.forEach(function (item, id) {
            if (limit && id >= limit) return;

            let itemNode = document.createElement('li');
            let leftItemSection = document.createElement('div');
            let itemCoinIcon = document.createElement('img');
            itemCoinIcon.src = `/assets/images/coins/${item.base_symbol.toLowerCase()}.png`;
            let itemOrder = document.createElement('span');
            itemOrder.className = 'order';
            itemOrder.innerHTML = '#' + (id + 1);
            leftItemSection.appendChild(itemCoinIcon);
            leftItemSection.appendChild(itemOrder);
            let rightItemSection = document.createElement('ul');

            rightItemSection.innerHTML += `<li><span>${item.base_symbol}<span class="transparent">${splitDate(item.dt_inserted)[0]} <span data-l10n-content="at"> ${localisation.getField('at')} </span> ${splitDate(item.dt_inserted)[1]}</span></span></li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="strategy">${localisation.getField('strategy')}</span>${item.strategy === 'RISE' ? `<span class="rise" data-l10n-content="strategy_rise">${localisation.getField('strategy_rise')}</span>` : `<span class="fall" data-l10n-content="strategy_fall">${localisation.getField('strategy_fall')}</span>`}</li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="bet_amount_and_type">${localisation.getField('bet_amount_and_type')}</span><span>${item.bet_amount} ${item.bet_symbol}</span></li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="bet_actuality">${localisation.getField('bet_actuality')}</span><span>${item.term_days} дней</span></li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="result">${localisation.getField('result')}</span><span class="green">+${item.bet_amount} ${item.bet_symbol}</span></li>`;

            itemNode.appendChild(leftItemSection);
            itemNode.appendChild(rightItemSection);
            betHistoryListNode.appendChild(itemNode);
        }, this);
        else betHistoryListNode.innerHTML = 'Loading ...';
        return betHistoryListNode;
    }

    static genBetHistoryTable(historyData = false, {limit = false} = {}) {
        let betHistoryTableNode = document.querySelector(`.bet-history.table`);
        if (betHistoryTableNode) betHistoryTableNode.innerHTML = ''; else betHistoryTableNode = document.createElement('ul');
        betHistoryTableNode.className = 'bet-history table';
        let fields = [
            {id: 'dt_inserted', l10nTitle: 'date'},
            {id: 'base_symbol', l10nTitle: 'coin'},
            {id: 'strategy', l10nTitle: 'strategy'},
            {id: 'bet_amount', l10nTitle: 'bet_amount_and_type'},
            {id: 'term_days', l10nTitle: 'time'},
            {id: 'result_amount', l10nTitle: 'result'}
        ];
        let tableSource = `<li>`;
        fields.forEach(function (field) {
            tableSource += `<div data-l10n-content="${field.l10nTitle}">${localisation.getField(field.l10nTitle)}</div>`;
        }, this);
        tableSource += `</li><div class="scroll-section"></div>`;
        betHistoryTableNode.innerHTML = tableSource;
        let betHistoryTableSectionNode = betHistoryTableNode.querySelector('.scroll-section');
        if (historyData) historyData.forEach(function (item, id) {
            if (limit && id >= limit) return;

            let itemNode = document.createElement('li');
            let itemSource = '';

            fields.forEach(function (field) {
                switch (field.id) {
                    case 'dt_inserted':
                        itemSource += `<div>${splitDate(item[field.id])[0]}</div>`;
                        break;
                    case 'base_symbol':
                        itemSource += `<div><img src="/assets/images/coins/${item[field.id].toLowerCase()}.png"><span>${item[field.id]}</span></div>`;
                        break;
                    case 'strategy':
                        let state = item[field.id] === 'RISE' ? `rise` : `fall`;
                        itemSource += `<div class="${state}" data-l10n-content="strategy_${state}">${localisation.getField(`strategy_` + state)}</div>`;
                        break;
                    case 'bet_amount':
                        itemSource += `<div>${item[field.id] ? item[field.id] : ''} ${item.bet_symbol}</div>`;
                        break;
                    case 'term_days':
                        itemSource += `<div>${item[field.id]} дней</div>`;
                        break;
                    case 'result_amount':
                        let amount = parseFloat(item[field.id]);
                        if (!amount || isNaN(amount)) {
                            itemSource += `<div></div>`;
                            break;
                        }
                        if (amount < 0) itemSource += `<div class="red">-${amount} ${item.bet_symbol}</div>`;
                        else itemSource += `<div class="green">+${amount} ${item.bet_symbol}</div>`;
                        break;
                    default:
                        itemSource += `<div>${item[field.id] ? item[field.id] : ''}</div>`;
                        break;
                }
            }, this);

            itemNode.innerHTML = itemSource;

            betHistoryTableSectionNode.appendChild(itemNode);
        }, this);
        else betHistoryTableSectionNode.innerHTML = 'Loading ...';
        return betHistoryTableNode;
    }

    static genBetForm(tagName = 'form') {
        let formNode = document.createElement(tagName);
        formNode.className = 'bet-form';
        formNode.innerHTML = `<div class="horizontal">
            <div class="select-wrapper narrow">
                <label for="coin" data-l10n-content="selected_coin">${localisation.getField('selected_coin')}</label>
                <select id="coin" name="base_symbol" required></select>
            </div>
            <div class="time">
                <label for="time" data-l10n-content="bet_actuality">${localisation.getField('bet_actuality')}</label>
                <button id="timeFall" class="change-time" type="button">-</button>
                <input id="time" value="1" min="1" name="term_days" type="number" required>
                <button id="timeRise" class="change-time" type="button">+</button>
            </div>
        </div>
        <div class="strategy horizontal">
            <input placeholder="${localisation.getField('strategy_rise')}" id="rise" value="rise" name="strategy" type="radio"
                   data-l10n-placeholder="strategy_rise" required>
            <input placeholder="${localisation.getField('strategy_fall')}" id="fall" value="fall" name="strategy" type="radio"
                   data-l10n-placeholder="strategy_fall" required>
        </div>
        <div class="select-wrapper amount">
            <label for="amount" data-l10n-content="bet_amount">${localisation.getField('bet_amount')}</label>
            <input id="amount" name="bet_amount" value="" data-input-mask="true" type="text" placeholder="100" required>
            <select title="Тип ставки" id="amount-type" name="bet_symbol" required></select>
        </div>
        <!--<div class="select-wrapper">
            <label for="returnProfit" data-l10n-content="return_profit_to">${localisation.getField('return_profit_to')}</label>
            <select id="returnProfit" name="quote_symbol" required></select>
        </div>-->
        <input type="hidden" name="quote_symbol" value="USDT">
        <input type="hidden" name="wallet" id="user_wallet" value="">
        <div>
            <label for="wallet"><span data-l10n-content="return_wallet_in">${localisation.getField('return_wallet_in')}</span><span id="return">USDT</span></label>
            <input id="wallet" name="payment-wallet" value="" type="text" placeholder="Выберите монету ставки" disabled>
        </div>
        <div class="horizontal">
            <input id="agreement" name="agreement" type="checkbox" required>
            <label for="agreement" data-l10n-content="i_agree">${localisation.getField('i_agree')}</label>
        </div>
        <div class="submit">
            <button class="green" type="submit" data-l10n-content="make_bet" onclick="User.processBet(this.form);return false;">${localisation.getField('make_bet')}</button>
        </div>`;
        delete window.selections;
        checkTimeValue(formNode);
        formNode.querySelector('#time').addEventListener('change', checkTimeValue);
        formNode.querySelector('#timeFall').addEventListener('click', function () {
            let value = parseInt(formNode.querySelector('#time').value);
            formNode.querySelector('#time').value = --value;
            checkTimeValue();
        });
        formNode.querySelector('#timeRise').addEventListener('click', function () {
            let value = parseInt(formNode.querySelector('#time').value);
            formNode.querySelector('#time').value = ++value;
            checkTimeValue();
        });
        formNode.querySelectorAll('[data-input-mask]').forEach(function (node) {
            node.addEventListener('keypress', mask);
            node.addEventListener('change', mask);
            node.addEventListener('blur', mask);
            mask(false, node);
        });
        formNode.querySelector(`#coin`).addEventListener(`change`, User.changeBetCoin);
        return formNode;
    }

    static renderSelectOptions(data = false) {
        data = data ? data : panel.getCryptoData();
        if (!data) return false;
        document.querySelectorAll(`#coin,#amount-type,#returnProfit`).forEach(function (node) {
            node.innerHTML = '';
            data.forEach(function (coin) {
                let optionNode = document.createElement('option');
                optionNode.value = coin.symbol;
                optionNode.innerHTML = coin.name;
                node.appendChild(optionNode);
            }, this);
        }, this);
        rebuildSelects();
    }

    static createBet(form) {
        if (!form.checkValidity()) return false;
        let data = new FormData(form);
        return fetch(apiURL + 'bids/create', {
            method: 'POST',
            body: data,
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.showFormError(result.msg ? result.msg : `Error code: ${result.code}`);
            let betWalletFormNode = document.querySelector(`#bet-wallet-form`);
            betWalletFormNode.parentNode.removeChild(betWalletFormNode);
            User.showBetClarify(result.data.id);
            return false;
        });
    }

    static showFormError(message) {
        alert(message);
        return false;
    }

    static changeBetCoin(event) {
        let data = panel.getCryptoData();
        if (!data) return false;
        let selectedCoin = event.target.value;
        let walletNode = event.target.form.querySelector(`#wallet`);
        let returnNode = event.target.form.querySelector(`#return`);
        let options = [];
        for (let i in data) {
            if (data[i].symbol !== selectedCoin) continue;
            options.push({title: data[i].name, value: data[i].symbol, l10nTitle: false});
            // amountTypeNode.innerHTML = `<option value="${data[i].symbol}">${data[i].name}</option><option value="DSDT">DSDT</option>`;
            walletNode.value = data[i].wallet;
            returnNode.innerHTML = data[i].name;
            break;
        }
        options.push({title: `DSDT`, value: `DSDT`, l10nTitle: false});
        rebuildSelects(`amount-type`, options);
    }

    static processBet(form) {
        return User.showBetWalletModal(form);
    }

    static showBetWalletModal(form) {
        let modalNode = document.createElement('div');
        modalNode.id = 'bet-wallet-form';
        modalNode.className = 'modal';
        modalNode.innerHTML = `<form class="content">
        <h3 class="title">Адрес кошелька</h3>
        <input class="icon" id="user-wallet" name="wallet" value="" placeholder="Адрес кошелька" type="text">
        <button type="submit">Продолжить</button>
        <a class="close" href="#">Закрыть</a>
    </form>
    <a class="backdrop-close" href="#">Закрыть</a>`;
        document.body.appendChild(modalNode);
        location.href = '#' + modalNode.id;
        modalNode.querySelector(`button[type=submit]`).addEventListener(`click`, function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (confirm('Пожалуйста, учитывайте minig free при отправке транзакции. Т.е. данная сумма должна прийти в указанный кошелек целиком')) {
                form.querySelector(`#user_wallet`).value = document.querySelector(`#user-wallet`).value;
                User.createBet(form);
            } else return false;
        });
    }

    static showBetClarify(id) {
        let data = JSON.parse(localStorage.getItem('betHistory'));
        let betData = null;
        for (let i in data) {
            if (data[i].id === id) continue;
            betData = data[i];
        }
        if (!betData) return alert('Не удалось найти ставку по идентификатору ' + id);
        let modalNode = document.createElement('div');
        modalNode.id = 'bet-wallet-clarify';
        modalNode.className = 'modal';
        modalNode.innerHTML = `<form class="content">
        <h3 class="title">ID транзакции</h3>
        <input class="icon" id="transaction-id" name="wallet" value="" placeholder="ID транзакции" type="text">
        <button type="submit">Продолжить</button>
        <a class="close" href="#">Закрыть</a>
    </form>
    <a class="backdrop-close" href="#">Закрыть</a>`;
        document.body.appendChild(modalNode);
        location.href = '#' + modalNode.id;
    }

}