class User {
    static logout() {
        // TODO: Request for delete cookie

        localStorage.removeItem('betHistory');
        localStorage.removeItem('userData');
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
        let betHistoryListNode = User.genBetHistoryList(User.getBetHistoryData());
        betHistoryNode.appendChild(betHistoryListNode);
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

    static genBetHistoryList(historyData = false) {
        let betHistoryListNode = document.querySelector(`.bet-history.detailed.grid`);
        if (betHistoryListNode) betHistoryListNode.innerHTML = ''; else betHistoryListNode = document.createElement('ul');
        betHistoryListNode.className = 'bet-history detailed grid';
        if (historyData) {
            historyData.forEach(function (item, id) {
                let itemNode = document.createElement('li');
                let leftItemSection = document.createElement('div');
                let itemCoinIcon = document.createElement('img');
                itemCoinIcon.src = `/assets/images/${item.base_symbol.toLowerCase()}.svg`;
                let itemOrder = document.createElement('span');
                itemOrder.className = 'order';
                itemOrder.innerHTML = '#' + (id + 1);
                leftItemSection.appendChild(itemCoinIcon);
                leftItemSection.appendChild(itemOrder);
                let rightItemSection = document.createElement('ul');

                rightItemSection.innerHTML += `<li><span>${item.base_symbol}</span></li>`;
                rightItemSection.innerHTML += `<li><span data-l10n-content="strategy">${localisation.getField('strategy')}</span>${item.strategy === 'RISE' ? `<span class="rise" data-l10n-content="strategy_rise">${localisation.getField('strategy_rise')}</span>` : `<span class="fall" data-l10n-content="strategy_fall">${localisation.getField('strategy_fall')}</span>`}</li>`;
                rightItemSection.innerHTML += `<li><span data-l10n-content="bet_amount_and_type">${localisation.getField('bet_amount_and_type')}</span><span>${item.bet_amount} ${item.bet_symbol}</span></li>`;
                rightItemSection.innerHTML += `<li><span data-l10n-content="bet_actuality">${localisation.getField('bet_actuality')}</span><span>${item.dt_confirmed}</span></li>`;
                rightItemSection.innerHTML += `<li><span data-l10n-content="result">${localisation.getField('result')}</span><span class="green">+${item.bet_amount} ${item.bet_symbol}</span></li>`;

                itemNode.appendChild(leftItemSection);
                itemNode.appendChild(rightItemSection);
                betHistoryListNode.appendChild(itemNode);
            })
        } else betHistoryListNode.innerHTML = 'Loading ...';
        return betHistoryListNode;
    }
}