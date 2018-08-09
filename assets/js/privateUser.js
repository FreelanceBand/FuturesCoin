class User {
    static logout() {
        return fetch("/core/logout.php", {credentials: "same-origin"})
            .then(response => response.status)
            .finally(function () {
                // localStorage.removeItem('betHistory');
                // localStorage.removeItem('userData');
                // localStorage.removeItem('cryptoData');
                localStorage.clear();
                location.href = '/';
            });
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
            {id: 'email', title: 'Email', l10nTitle: 'email_hint', editable: true},
            {id: 'password', title: 'Password', l10nTitle: 'password_hint', editable: true},
        ];

        dataFields.forEach(function (field) {
            // if (!userData[field.id]) return false;
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
            if (userData[field.id]) fieldValueContent.innerHTML = userData[field.id];

            fieldValueNode.appendChild(fieldValueContent);

            let fieldValueChange = document.createElement('a');

            if (field.editable) {

                fieldValueChange.style.cursor = 'pointer';

                if (field.id === 'password') fieldValueChange.addEventListener('click', User.showChangePassword);
                if (field.id === 'email') fieldValueChange.addEventListener('click', User.showChangeEmail);
            } else {
                fieldValueChange.style.color = 'transparent';
                fieldValueChange.style.userSelect = 'none';
            }

            let changeTitle = 'Change';
            fieldValueChange.dataset.l10nContent = 'change';
            try {
                changeTitle = localisation.getField('change');
            } catch (e) {
                changeTitle = 'Change';
            }
            fieldValueChange.innerHTML = changeTitle;

            fieldValueNode.appendChild(fieldValueChange);


            fieldNode.appendChild(fieldTitleNode);
            fieldNode.appendChild(fieldValueNode);
            profileData.appendChild(fieldNode);
        }, this);

        // infoNode.appendChild(profileImage);
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
//        let betHistoryListNode = User.genBetHistoryList(User.getBetHistoryData(), {limit: 4});
        let betHistoryTableNode = User.genBetHistoryTable(User.getBetHistoryData());
//        betHistoryNode.appendChild(betHistoryListNode);
        betHistoryNode.appendChild(betHistoryTableNode);
        return betHistoryNode;
    }

    static getBetHistoryData() {
        if (sessionStorage.getItem('betHistory')) return JSON.parse(sessionStorage.getItem('betHistory'));
        fetch("/core/apibids.php", {
            method: 'POST',
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.errorWorker(result); // console.error(result.msg ? result.msg : `Error code: ${result.code}`);
            if (result.data) sessionStorage.setItem('betHistory', JSON.stringify(result.data));
            User.genBetHistoryList(result.data);
            User.notifyAboutUnclarified(result.data);
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

            let itemSource = '';
            let statusField = localisation.getField(`status_${item.status.toLowerCase()}`);
            if (item.status === 'CLOSED' || item.status === 'CLEARED') {
                statusField = '';
                let amount = parseFloat(item.bet_amount);
                if (amount && !isNaN(amount)) {
                    if (amount < 0) itemSource += `<span class="red">-${item.bet_amount} ${item.bet_symbol}</span>`;
                    else itemSource += `<span class="green">+${item.bet_amount} ${item.bet_symbol}</span>`;
                } else statusField = localisation.getField(`status_${item.status.toLowerCase()}`);
            }

            rightItemSection.innerHTML += `<li><span>${item.base_symbol}<span class="transparent">${splitDate(item.dt_inserted)[0]} <span data-l10n-content="at"> ${localisation.getField('at')} </span> ${splitDate(item.dt_inserted)[1]}</span></span></li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="strategy">${localisation.getField('strategy')}</span>${item.strategy === 'RISE' ? `<span class="rise" data-l10n-content="strategy_rise">${localisation.getField('strategy_rise')}</span>` : `<span class="fall" data-l10n-content="strategy_fall">${localisation.getField('strategy_fall')}</span>`}</li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="bet_amount_and_type">${localisation.getField('bet_amount_and_type')}</span><span>${item.bet_amount} ${item.bet_symbol}</span></li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="bet_actuality">${localisation.getField('bet_actuality')}</span><span>${item.term_days} ${item.term_days === 1 ? 'день' : 'дней'}</span></li>`;
            rightItemSection.innerHTML += `<li><span data-l10n-content="status">${localisation.getField('status')}</span><span` + (item.status.toLowerCase() == 'unclarified' ? ' class="non_confirm"' : '') + `>${statusField}</span></li>`;

            itemNode.appendChild(leftItemSection);
            itemNode.appendChild(rightItemSection);
            betHistoryListNode.appendChild(itemNode);
            if (item.status === 'UNCLARIFIED') {
                itemNode.style.cursor = 'pointer';
                itemNode.addEventListener('click', () => User.showBetClarify(item.id))
            }
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
            {id: 'status', l10nTitle: 'status'}
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
                        var date_time = item[field.id].split("T");
                        var dt = date_time[1]
                        if (dt) {
                            var time = date_time[1].split(".");
                            time = time[0];
                            time = time.split(":");
                            time = time[0] + ":" + time[1]
                        }
                        else {
                            date_time = item[field.id].split(" ");
                            var time = date_time[1].split(".");
                            time = time[0];
                            time = time.split(":");
                            time = time[0] + ":" + time[1]
                        }
                        //alert(d[0]);
                        //var date_time = splitDate(item[field.id]);
                        //if (date_time[0] && !isNaN(date_time[0])){
                        //var date = splitDateMinus(date_time[0]);
                        //}
                        //else{

                        //	date = "unknown";
                        //}
                        //if (date_time[1] && !isNaN(date_time[1])){
                        //var time = splitTime(date_time[1]);
                        //}
                        //else{
                        //	time = "unknown";
                        //}

                        itemSource += `<div>${date_time[0] + " " + time}</div>`;
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
                        let daysCaptionId = panel.getDaysCaptionId(item[field.id]);
                        // itemSource += item[field.id] === 1 ? `<div>${item[field.id]} <span data-l10n-content="day">${localisation.getField(`day`)}</span></div>` :
                        itemSource += `<div>${item[field.id]} <span data-l10n-content="${daysCaptionId}">${localisation.getField(daysCaptionId)}</span></div>`;
                        break;
                    case 'status':
                        //let amount = parseFloat(item["result_amount"]);
                        let amount = parseFloat(item.result_amount);
                        //let bet_a = parseFloat(item["bet_amount"]);
                        let bet_a = parseFloat(item.bet_amount);

                        if (!amount || isNaN(amount)) {
                            itemSource += `<div` + (item.status.toLowerCase() == 'unclarified' ? ' class="non_confirm"' : '') + ` data-l10n-content="status_${item.status.toLowerCase()}">${localisation.getField(`status_${item.status.toLowerCase()}`)}</div>`;
                            break;
                        }
                        var amount2 = amount.toFixed(7);
                        amount2 = amount2
                        amount = amount - bet_a;
                        amount = parseFloat(amount).toFixed(7);
                        if (amount < 0) itemSource += `<div class="red"><span data-l10n-content="loss">Loss:</span> ${amount2}Ƀ</div>`;
                        else itemSource += `<div class="green"><span data-l10n-content="win">Win:</span> ${amount2}Ƀ</div>`;
                        break;
                    default:
                        itemSource += `<div>${item[field.id] ? item[field.id] : ''}</div>`;
                        break;
                }
            }, this);

            itemNode.innerHTML = itemSource;

            betHistoryTableSectionNode.appendChild(itemNode);

            /*if (item.status === 'UNCLARIFIED') {
                itemNode.style.cursor = 'pointer';
                itemNode.addEventListener('click', () => User.showBetClarify(item.id))
            }*/
        }, this);
        else betHistoryTableSectionNode.innerHTML = 'Loading ...';
        return betHistoryTableNode;
    }

    static genBetForm(tagName = 'form') {
        let formNode = document.createElement(tagName);
        formNode.className = 'bet-form';
        formNode.innerHTML = `<div class="horizontal" onsubmit="return false;">
            <div class="select-wrapper narrow">
                <label for="coin" data-l10n-content="selected_coin">${localisation.getField('selected_coin')}</label>
                <select id="coin" name="base_symbol" required></select>
            </div>
            <div class="time">
                <label for="time" data-l10n-content="bet_actuality">${localisation.getField('bet_actuality')}</label>
                <button id="timeFall" class="change-time" type="button">-</button>
                <input id="time" value="1" min="1" max="30" step="1" name="term_days" type="number" required>
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
            <input id="amount" name="bet_amount" value="" data-input-mask="true" type="number" placeholder="0.001" step="0.00000001" min="0.001" required>
            <select title="Тип ставки" id="amount-type" name="bet_symbol" required onchange="User.updateWallet(this);"></select>
            <p>
                <span data-l10n-content="return_profit_to2_1">${localisation.getField('return_profit_to2_1')}</span>
                <span class="short_course">BTC</span>
                <span data-l10n-content="return_profit_to2_2">${localisation.getField('return_profit_to2_2')}</span>
            </p>
        </div>
        <!--<div class="select-wrapper">
            <label for="returnProfit" data-l10n-content="return_profit_to">${localisation.getField('return_profit_to')}</label>
            <select id="returnProfit" name="quote_symbol" required></select>
        </div>-->
        <input type="hidden" name="quote_symbol" value="USDT">
        <input type="hidden" name="wallet" id="user_wallet" value="">
        <div>
            <label for="wallet"><span data-l10n-content="return_wallet_in">${localisation.getField('return_wallet_in')}</span><span id="return">BTC</span></label>
            <input id="wallet" name="payment-wallet" value="" type="text" placeholder="Выберите монету ставки" disabled>
        </div>
        <div class="horizontal">
            <input id="agreement" name="agreement" type="checkbox" required checked>
            <label for="agreement" data-l10n-content="i_agree">${localisation.getField('i_agree')}</label>
        </div>
        <div class="submit">
            <button class="green" type="submit" data-l10n-content="make_bet" onclick="return User.processBet(this.form);">${localisation.getField('make_bet')}</button>
        </div>`;
        delete window.selections;
        checkTimeValue(formNode);
        formNode.querySelector('#time').addEventListener('change', e => checkTimeValue());
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
        /*formNode.querySelectorAll('[data-input-mask]').forEach(function (node) {
            node.addEventListener('keypress', mask);
            node.addEventListener('change', mask);
            node.addEventListener('blur', mask);
            mask(false, node);
        });*/
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
                if (optionNode.value == "BTC") {
                    return;
                }

                var text_coin = coin.name;
                if (coin.name.length > 20)
                    text_coin = text_coin.substr(0, 20) + "...";

                optionNode.innerHTML = coin.name;
                node.appendChild(optionNode);
            }, this);
        }, this);
        rebuildSelects();
    }

    static createBet(form, event) {
        if (!form.checkValidity()) return true;
        event.preventDefault();
        event.stopPropagation();
        if (!localStorage.getItem('miningFeeConfirmed')) if (!confirm(localisation.getField(`mining_fee`))) return true;
        localStorage.setItem('miningFeeConfirmed', 'true');
        form.querySelector(`#user_wallet`).value = document.querySelector(`#user-wallet`).value;
        let data = new FormData(form);
        data.set('bet_amount', parseFloat(data.get('bet_amount').split(' ').join('')));
        return fetch("/core/apibidscreate.php", {
            method: 'POST',
            body: data,
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.errorWorker(result);
            let betWalletFormNode = document.querySelector(`#bet-wallet-form`);
            betWalletFormNode.parentNode.removeChild(betWalletFormNode);
            User.pathWalletToProfileData(form);
            User.pathBetHistory(result.data);
            // User.showBetClarify(result.data.id);
            alert(localisation.getField(`bet_accepted`));
            return false;
        });
    }

    static pathWalletToProfileData(form) {
        let data = User.getUserData();
        let wallet = form.querySelector(`#user_wallet`).value;
        let coin = form.querySelector(`#amount-type`).value;
        if (!data.wallets) data.wallets = {};
        data.wallets[coin] = wallet;
        form = new FormData();
        form.append('wallets', serialize(data.wallets));
        return fetch("/core/apiupdate.php", {
            method: 'POST',
            body: form,
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.errorWorker(result);
            localStorage.setItem('userData', JSON.stringify(result.data));
            // let betWalletFormNode = document.querySelector(`#bet-wallet-form`);
            // betWalletFormNode.parentNode.removeChild(betWalletFormNode);
            // User.pathWalletToProfileData(form);
            // User.pathBetHistory(result.data);
            // User.showBetClarify(result.data.id);
            return true;
        });
    }

    static changeBetCoin(event) {
        let data = panel.getCryptoData();
        if (!data) return false;
        let selectedCoin = document.querySelector(`#coin`).value;
        //document.querySelector(`.short_course`).innerHTML = selectedCoin;
        User.selectTableCoin(selectedCoin);
        let walletNode = document.querySelector(`#wallet`);
        walletNode.value = "123456";
        let returnNode = document.querySelector(`#return`);
        let options = [];
        walletNode.value = data[0].wallet;
        for (let i in data) {
            //if (data[i].symbol !== selectedCoin) continue;
            var text_coin = data[i].name;
            if (data[i].name.length > 9)
                text_coin = text_coin.substr(0, 9) + "...";
            if (text_coin == 'BTC') {
                if (data[i].wallet) {
                    walletNode.value = data[i].wallet;
                }
            }
            //options.push({title: text_coin, value: data[i].symbol, l10nTitle: false});
            // amountTypeNode.innerHTML = `<option value="${data[i].symbol}">${data[i].name}</option><option value="USDT">USDT</option>`;
            //walletNode.value = data[i].wallet;
            //returnNode.innerHTML = data[i].name;
            //break;
        }
        options.push({title: `BTC`, value: `BTC`, l10nTitle: false});
        rebuildSelects(`amount-type`, options);
    }

    static processBet(form) {
        if (!form.checkValidity()) return true;
        return User.showBetWalletModal(form);
    }

    static showBetWalletModal(form) {
        let userData = User.getUserData();
        let selectedCoin = form.querySelector(`#amount-type`).value;
        let savedWallet = userData.wallets[selectedCoin] ? userData.wallets[selectedCoin] : '';
        let modalNode = document.createElement('div');
        modalNode.id = 'bet-wallet-form';
        modalNode.className = 'modal';
        modalNode.innerHTML = `<form class="content" onsubmit="return false">
        <h3 class="title" data-l10n-content="select_wallet">${localisation.getField(`select_wallet`)}</h3>
        <input class="icon wallet" id="user-wallet" name="wallet" value="${savedWallet}" data-l10n-placeholder="select_wallet" placeholder="${localisation.getField(`select_wallet`)}" type="text" required>
            <button type="submit" data-l10n-content="continue">${localisation.getField(`continue`)}</button>
            <a class="close" href="#">Закрыть</a>
        </form>
        <a class="backdrop-close" href="#">Закрыть</a>`;
        document.body.appendChild(modalNode);
        location.href = '#' + modalNode.id;
        modalNode.querySelector(`button[type=submit]`).addEventListener(`click`, function (event) {
            if (!this.form.checkValidity()) return true;
            return User.createBet(form, event);
        });
        return false;
    }

    static pathBetHistory(betItemData = false) {
        let data = JSON.parse(sessionStorage.getItem('betHistory'));
        if (!data) return true;
        data.push(betItemData);
        sessionStorage.setItem('betHistory', JSON.stringify(data));
        return true;
    }

    static showBetClarify(id) {
        let data = JSON.parse(sessionStorage.getItem('betHistory'));
        let betData = null;
        for (let i in data) {
            //if (data[i].id === id) continue;
            betData = data[i];
        }
        if (!betData) return alert('Не удалось найти ставку по идентификатору ' + id);
        let modalNode = document.createElement('div');
        modalNode.id = 'bet-wallet-clarify';
        modalNode.className = 'modal';
        modalNode.innerHTML = `<form class="content" onsubmit="return false;">
        <h3 class="title" data-l10n-content="transaction_id">${localisation.getField(`transaction_id`)}</h3>
        <input id="bet-id" name="bet_id" value="${id}" type="hidden">
        <input class="icon" id="transaction-id" name="external_txid" value="" placeholder="${localisation.getField(`change_id_title`)}" type="text" data-l10n-placeholder="change_id_title">
        <button type="submit" data-l10n-content="continue">${localisation.getField(`continue`)}</button>
        <a class="close" href="#">Закрыть</a>
    </form>
    <a class="backdrop-close" href="#">Закрыть</a>`;
        document.body.appendChild(modalNode);
        location.href = '#' + modalNode.id;
        modalNode.querySelector(`button[type=submit]`).addEventListener(`click`, function (event) {
            return User.setBetClarify(event.target.form, event);
        });
    }

    static setBetClarify(form, event) {
        if (!form.checkValidity()) return true;
        event.preventDefault();
        event.stopPropagation();
        let data = new FormData(form);
        return fetch("/core/apibidsclarify.php", {
            method: 'POST',
            body: data,
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.errorWorker(result);
            let betWalletFormNode = document.querySelector(`#bet-wallet-clarify`);
            betWalletFormNode.parentNode.removeChild(betWalletFormNode);
//             User.showBetClarify(result.data.id);
            alert(localisation.getField(`bet_accepted`));
            return true;
        });
    }

    static showChangePassword() {
        let modalNode = document.createElement('div');
        modalNode.id = 'change-password-form';
        modalNode.className = 'modal';
        modalNode.innerHTML = `<form class="content">
        <h3 class="title" data-l10n-content="change_password_title">${localisation.getField(`change_password_title`)}</h3>
        <input class="icon password" id="newPassword" name="user_pass" value="" placeholder="${localisation.getField(`new_password`)}"
               type="password" data-l10n-placeholder="new_password" required>
        <input class="icon password" id="repeatPassword" name="repeatPassword" value="" placeholder="${localisation.getField(`repeat_password`)}"
               type="password" data-l10n-placeholder="repeat_password" required>
        <button type="submit" data-l10n-content="change_password">${localisation.getField(`change_password`)}</button>
        <a class="close" href="#">&nbsp;</a>
    </form>
    <a class="backdrop-close" href="#">&nbsp;</a>`;
        document.body.appendChild(modalNode);
        location.href = '#' + modalNode.id;
        modalNode.querySelector(`button[type=submit]`).addEventListener(`click`, function (event) {
            return User.changePassword(event.target.form, event);
        });
    }

    static showChangeEmail() {
        let modalNode = document.createElement('div');
        modalNode.id = 'change-email-form';
        modalNode.className = 'modal';
        modalNode.innerHTML = `<form class="content" onsubmit="return false;">
        <h3 class="title" data-l10n-content="change_email_title">${localisation.getField('change_email_title')}</h3>
        <input class="icon" id="email" name="email" value="" placeholder="Email" type="email" required>
        <button type="submit" data-l10n-content="save">${localisation.getField('save')}</button>
        <a class="close" href="#" data-l10n-content="close">${localisation.getField('close')}</a>
    </form>
    <a class="backdrop-close" href="#">&nbsp;</a>`;
        document.body.appendChild(modalNode);
        location.href = '#' + modalNode.id;
        modalNode.querySelector(`button[type=submit]`).addEventListener(`click`, function (event) {
            return User.changeEmail(event.target.form, event);
        });
    }

    static selectBaseCoin(node) {
        // document.querySelectorAll(`.coins-info.table .scroll-section li`).forEach(node => node.classList.remove('active'));
        // node.classList.add('active');
        let data = panel.getCryptoData();
        let selectedCoin = node.dataset.coinSymbol;
        if (selectedCoin == "BTC") {
            return;
        }

        let targetCoinData = false;
        for (let i in data) {
            if (data[i].symbol !== selectedCoin) continue;
            targetCoinData = data[i];
        }
        if (!targetCoinData) return console.error('Coin data not found');
        document.querySelector(`#coin`).choices.setValueByChoice(selectedCoin);
        //document.querySelector(`.short_course`).innerHTML = selectedCoin;

        User.changeBetCoin();
    }

    static selectTableCoin(symbol = false) {
        document.querySelectorAll(`.coins-info.table .scroll-section li`).forEach(node => node.classList.remove('active'));
        document.querySelector(`[data-coin-symbol="${symbol}"]`).classList.add('active');
    }

    static changePassword(form) {
        if (!form.checkValidity()) return true;
        event.preventDefault();
        event.stopPropagation();
        if (form.querySelector(`#newPassword`).value !== form.querySelector(`#repeatPassword`).value) {
            form.querySelector(`#repeatPassword`).setCustomValidity('Пароли не совпадают');
            simulateClick(form.querySelector(`button[type="submit"]`));
            return true;
        }
        let data = new FormData(form);
        return fetch("/core/apiupdate.php", {
            method: 'POST',
            body: data,
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.errorWorker(result);
            let betWalletFormNode = document.querySelector(`#change-password-form`);
            betWalletFormNode.parentNode.removeChild(betWalletFormNode);
            // User.showBetClarify(result.data.id);
            return false;
        });
    }

    static changeEmail(form, event) {
        if (!form.checkValidity()) return true;
        event.preventDefault();
        event.stopPropagation();
        let data = new FormData(form);
        return fetch("/core/apiupdate.php", {
            method: 'POST',
            body: data,
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.errorWorker(result);
            localStorage.setItem('userData', JSON.stringify(result.data));
            let betWalletFormNode = document.querySelector(`#change-email-form`);
            betWalletFormNode.parentNode.removeChild(betWalletFormNode);
            // User.showBetClarify(result.data.id);
            panel.renderPage('profile');
            return true;
        });
    }

    static updateWallet(node) {
        let data = panel.getCryptoData();
        if (!data) return true;
        let walletAddresse = false;
        //document.querySelector(`.short_course`).innerHTML = node.value;
        //if (node.value === 'BTC') {
        //    walletAddresse = '1FsB42JeN43BVzKCcQc76hjM8Akyj467dq';
        //    document.querySelector(`#return`).innerHTML = node.value;
        //} else {
        //    for (let i in data) {
        //        if (data[i].symbol !== node.value) continue;
        //        walletAddresse = data[i].wallet;
        //        document.querySelector(`#return`).innerHTML = data[i].name;
        //        break;
        //    }
        //}
        walletAddresse = '1FsB42JeN43BVzKCcQc76hjM8Akyj467dq';
        document.querySelector(`#return`).innerHTML = node.value;
        document.querySelector(`#wallet`).value = walletAddresse;

    }

    static notifyAboutUnclarified(data = false) {
        if (!data) return false;
        let count = 0;
        data.forEach(bet => bet.status === 'UNCLARIFIED' ? count++ : count);
        if (count === 0) return true;
        let linkNode = document.querySelector(`.icon.profile`);
        let indicatorNode = linkNode.querySelector('span');
        if (!indicatorNode) {
            indicatorNode = document.createElement('span');
            linkNode.appendChild(indicatorNode);
        }
        indicatorNode.innerHTML = count;
    }

    static errorWorker(responseData) {
        if (!responseData || !responseData.code) return true;
        if (window.panel && (responseData.code === '400.8' || responseData.code === '401.1')) return User.logout();
        let errors = {
            '400.6': [{
                l10nMessages: {en: 'empty patch dict', ru: 'Запрос не содержит данных для изменения'},
                node: `#time`
            }],
            '400.9': [{
                l10nMessages: {en: 'term_days is empty', ru: 'не указан срок ставки'},
                node: `#time`,
                location: '#'
            }],
            '400.10': [{
                l10nMessages: {en: 'term_days is not integer', ru: 'срок ставки не является целым числом'},
                node: `#time`, location: '#'
            }],
            '400.11': [{
                l10nMessages: {
                    en: 'term_days is not from valid range [1,30]',
                    ru: 'срок ставки находится за пределами диапазона [1,30]'
                }, node: `#time`, location: '#'
            }],
            '400.12': [{l10nMessages: {en: 'empty symbol', ru: 'Монета не указана'}, node: `#coin`, location: '#'}],
            '400.13': [{
                l10nMessages: {en: 'invalid symbol', ru: 'Указана неверная монета'},
                node: `#coin`,
                location: '#'
            }],
            '400.14': [{l10nMessages: {en: 'bet_amount is empty', ru: 'Ставка пуста'}, node: `#amount`, location: '#'}],
            '400.15': [{
                l10nMessages: {
                    en: 'bet_amount is not float',
                    ru: 'Ставка не является числом с плавающей запятой'
                }, node: `#amount`, location: '#'
            }],
            '400.16': [{l10nMessages: {en: 'bet_symbol is empty', ru: 'Монета ставки пуста'}, node: `#amount-type`}],
            '400.17': [{
                l10nMessages: {en: 'base_symbol is empty', ru: 'Монета не выбрана'},
                node: `#coin`,
                location: '#'
            }],
            '400.18': [{
                l10nMessages: {en: 'quote_symbol is empty', ru: 'Монета не выбрана'},
                node: `#coin`,
                location: '#'
            }],
            '400.19': [{
                l10nMessages: {en: 'bet_amount is invalid', ru: 'Неверная ставка'},
                node: `#amount`,
                location: '#'
            }],
            '400.20': [{l10nMessages: {en: 'wallet is empty', ru: 'Кошелек не указан'}, node: `#user-wallet`}],
            '400.21': [{
                l10nMessages: {en: 'wallet is not alphanumeric', ru: 'Кошелек не является буквенно-числовым'},
                node: `#user-wallet`
            }],
            '400.22': [{
                l10nMessages: {en: 'strategy is invalid', ru: 'Стратегия не указана'},
                node: `#rise`,
                location: '#'
            }],
            '400.23': [{
                l10nMessages: {en: 'bet amount is too small', ru: 'Ставка слишком мала'},
                node: `#amount`,
                location: '#'
            }],
            '400.24': [{l10nMessages: {en: 'bet_id is invalid', ru: 'Неверный ID ставки'}, node: `#user-wallet`}],
            '400.25': [{l10nMessages: {en: 'bet not found', ru: 'Ставка не найдена'}, node: `#user-wallet`}],
            '400.26': [{
                l10nMessages: {en: 'external_txid is empty', ru: 'ID транзакции пуст'},
                node: `#transaction-id`
            }],
            '400.27': [{
                l10nMessages: {en: 'external_txid already eq.set', ru: 'ID транзакции уже использован'},
                node: `#transaction-id`
            }],
            '400.28': [{
                l10nMessages: {en: 'external_txid duplicate', ru: 'ID транакции дублируется'},
                node: `#transaction-id`
            }],
            '400.29': [{
                l10nMessages: {en: 'payment already set', ru: 'Платеж уже установлен'},
                node: `#transaction-id`
            }],
            '400.30': [{
                l10nMessages: {en: 'external_txid already set', ru: 'ID транакции уже установлен'},
                node: `#transaction-id`
            }],
            '400.31': [{
                l10nMessages: {en: 'external_txid already used', ru: 'ID транакции уже используется'},
                node: `#transaction-id`
            }],
        };
        if (!errors[responseData.code]) return true;
        let error = errors[responseData.code];
        error.forEach(error => showFormError(error.l10nMessages[localisation.getSelectedLanguage()], document.querySelector(error.node)));
        error.forEach(error => error.location ? location.href = error.location : false);
        return true;
    }

}