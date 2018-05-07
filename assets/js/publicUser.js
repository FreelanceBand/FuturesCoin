class User {
    static auth(login = null, password = null) {
        if (typeof login !== 'string' || typeof password !== 'string') return false;
        return fetch(apiURL + 'users/login', {
            method: 'POST',
            body: serialize({user_name: login, user_pass: password}),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
            .then(function (response) {
                return response.json();
            }).then(function (result) {
                if (!result.status || result.status !== 'ok') return User.showFormError(result.msg ? result.msg : `Error code: ${result.code}`);
                if (result.data) localStorage.setItem('userData', JSON.stringify(result.data));
                location.href = 'profile.html';
            })
    }

    static reg(login = null, email = null, password = null) {
        if (typeof login !== 'string' || typeof password !== 'string' || typeof email !== 'string') return false;
        return fetch(apiURL + 'users/create', {
            method: 'POST',
            body: serialize({user_name: login, email, user_pass: password}),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
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