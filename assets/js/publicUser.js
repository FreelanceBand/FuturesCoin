class User {
    static auth(form = null) {
        if (typeof form !== 'object') return false;
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
                return User.showFormError(result.msg ? result.msg : `Error code: ${result.code}`);
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
        if (typeof form !== 'object') return false;
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
                return User.showFormError(result.msg ? result.msg : `Error code: ${result.code}`);
            }
            if (result.data) localStorage.setItem('userData', JSON.stringify(result.data));
            User.auth(form);
        }).catch(function (error) {
            enableSubmit(form);
            throw error;
        })
    }

    static showFormError(message) {
        alert(message);
        return false;
    }
}