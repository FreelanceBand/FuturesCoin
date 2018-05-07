class User {
    static auth(form = null, login = null, password = null) {
        // if (typeof login !== 'string' || typeof password !== 'string') return false;
        if (typeof form !== 'object') return false;
        return fetch(apiURL + 'users/login', {
            method: 'POST',
            body: new FormData(form),//serialize({user_name: login, user_pass: password}),
            /*headers: {
                "Content-Type": "multipart/form-data"//"application/x-www-form-urlencoded"
            },*/
            credentials: "same-origin"
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (!result.status || result.status !== 'ok') return User.showFormError(result.msg ? result.msg : `Error code: ${result.code}`);
            if (result.data) localStorage.setItem('userData', JSON.stringify(result.data));
            location.href = '/panel';
            return true;
        }).result;
    }

    static reg(login = null, email = null, password = null) {
        if (typeof login !== 'string' || typeof password !== 'string' || typeof email !== 'string') return false;
        return fetch(apiURL + 'users/create', {
            method: 'POST',
            body: serialize({user_name: login, email, user_pass: password}),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: "same-origin"
        })
            .then(function (response) {
                return response.json();
            }).then(function (result) {
                if (!result.status || result.status !== 'ok') return User.showFormError(result.msg ? result.msg : `Error code: ${result.code}`);
                if (result.data) localStorage.setItem('userData', JSON.stringify(result.data));
                User.auth(login, password);
            })
    }

    static showFormError(message) {
        alert(message);
        return false;
    }
}