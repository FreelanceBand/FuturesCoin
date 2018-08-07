class User {

    static auth(form = null) {
        if (typeof form !== 'object') return true;
        if (!form.checkValidity()) return true;
        disableSubmit(form);
        return fetch("/core/apilogin.php", {
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
            location.href = '../../panel';
            return true;
        }).catch(function (error) {
            enableSubmit(form);
            throw error;
        });
    }

    static reg(form = null) {
        if (typeof form !== 'object') return true;
        if (!form.checkValidity()) return true;

        User.changePassword(form);

        disableSubmit(form);
        return fetch("/core/apireg.php", {
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
            if (result.data) {
                localStorage.setItem('userData', JSON.stringify(result.data));
                User.auth(form);
            }
        }).catch(function (error) {
            enableSubmit(form);
            throw error;
        })


    }

    static changePassword(form) {
        if (!form.checkValidity()) return true;
//        event.preventDefault();
//        event.stopPropagation();
        if (form.querySelector(`#password`).value !== form.querySelector(`#repeatPassword`).value) {
            var text = 'Пароли не совпадают';
            console.log(text);
            console.log(form.querySelector(`#password`).value + " - " + form.querySelector(`#repeatPassword`).value);
            form.querySelector(`#repeatPassword`).setCustomValidity(text);
            simulateClick(form.querySelector(`button[type="submit"]`));
            form.querySelector(`#repeatPassword`).value = '';
            form.querySelector(`#password`).value = '';
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
            if (!result.status || result.status !== 'ok') {
                return User.errorWorker(result);
            }
            let betWalletFormNode = document.querySelector(`#change-password-form`);
            betWalletFormNode.parentNode.removeChild(betWalletFormNode);
            // User.showBetClarify(result.data.id);
            return false;
        });
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
            '409.1': [{
                l10nMessages: {en: 'Name already taken', ru: 'Логин уже используется'},
                node: `#login`
            }],
        };
        if (!errors[responseData.code]) return false;
        let error = errors[responseData.code];
        error.forEach(error => showFormError(error.l10nMessages[localisation.getSelectedLanguage()], document.querySelector(error.node)));
        return true;
    }

    static logout() {
        return fetch("/core/logout.php", {credentials: "same-origin"}).then(response => response.status);
    }

}