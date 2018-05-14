class User {
    static auth(form = null) {
        if (typeof form !== 'object') return true;
        if (!form.checkValidity()) return true;
        disableSubmit(form);
        return fetch(apiURL + 'users/login', {
            method: 'POST',
            body: new FormData(form),
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') {
                enableSubmit(form);
                return User.errorWorker(result);
            }
            if (result.data) localStorage.setItem('userData', JSON.stringify(result.data));
            location.href = '/panel';
            return true;
        }).catch(function (error) {
            enableSubmit(form);
            throw error;
        });
    }

    static reg(form = null) {
        if (typeof form !== 'object') return true;
        if (!form.checkValidity()) return true;
        disableSubmit(form);
        return fetch(apiURL + 'users/create', {
            method: 'POST',
            body: new FormData(form),
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') {
                enableSubmit(form);
                return User.errorWorker(result);
            }
            if (result.data) localStorage.setItem('userData', JSON.stringify(result.data));
            User.auth(form);
        }).catch(function (error) {
            enableSubmit(form);
            throw error;
        })
    }

    static errorWorker(responseData) {
        if (!responseData || !responseData.code) return false;
        if (window.panel && (responseData.code === '400.8' || responseData.code === '401.1')) return User.logout();
        let errors = {
            '400.1': [{l10nMessages: {en: 'user name is empty', ru: 'пустой логин'}, node: `#login`}],
            '400.2': [{l10nMessages: {en: 'user pass is empty', ru: 'пустой пароль'}, node: `#password`}],
            '400.3': [{l10nMessages: {en: 'email is empty', ru: 'пустой email'}, node: `#email`}],
            '400.5': [{l10nMessages: {en: 'invalid password', ru: 'неверный пароль'}, node: `#password`}],
            '400.7': [{l10nMessages: {en: 'email is invalid', ru: 'неверный email'}, node: `#email`}],
            '404.1': [{
                l10nMessages: {en: 'User with same name does not exists', ru: 'Пользователь не найден'},
                node: `#login`
            }],
            '409.2': [{
                l10nMessages: {en: 'Email already taken', ru: 'Email уже используется'},
                node: `#email`
            }],
        };
        if (!errors[responseData.code]) return false;
        let error = errors[responseData.code];
        error.forEach(error => showFormError(error.l10nMessages[localisation.getSelectedLanguage()], document.querySelector(error.node)));
        return true;
    }

}