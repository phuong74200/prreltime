const socket = io('ws://localhost:7420');

setCookie('tokens', '', 0)

$(['#loginUsername', '#loginPassword']).on('keyup', function (e) {
    if (e.which == 13) {
        login($('#loginUsername').value, $('#loginPassword').value)
    }
})

$(['#registerUsername', '#registerPassword']).on('keyup', function (e) {
    if (e.which == 13) {
        register($('#registerUsername').value, $('#registerPassword').value)
    }
})

function login(username, password) {
    fetch('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            username: username,
            password: password,
        })
    }).then(res => {
        return res.json();
    }).then(dat => {
        console.log(dat)
        if (dat.response == 'login_success') {
            setCookie('tokens', dat.tokens, 365, '/room')
            window.location = '/room'
        }
    })
}

function register(username, password) {
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            username: username,
            password: password,
        })
    }).then(res => {
        return res.json();
    }).then(dat => {
        console.log(dat)
        login(username, password)
    })
}