const socket = io('127.0.0.1:7420');

setCookie('tokens', '', 0)

/*
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
*/

$(['#regPass', '#regUsername', '#regPass_re']).on('keyup', function (e) {
    if (e.which == 13) {
        signUp();
    }
})

function calert(cnt) {
    let div = document.createElement('div')
    div.className = 'alert'
    div.textContent = cnt;
    $('body')[0].appendChild(div)
    setTimeout(function () {
        div.remove();
    }, 10000)
}

function signUp(e) {
    let pass = $('#regPass').value
    let pass_re = $('#regPass_re').value
    if (pass == pass_re) {
        register($('#regUsername').value, $('#regPass').value)
        console.log('registe')
    } else if (pass != pass_re) {
        $('#regPass_re').value = ''
        $('#regPass_re').placeholder = 'Password not match!'
        calert('Password not match!')
        $('#regPass_re').focus();
    }
}

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
        } else {
            calert(dat.message)
            exitLogin();
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
            avatar: $('#img-compress').toDataURL(),
            high_res_avatar: $('#avatar').css().backgroundImage,
        })
    }).then(res => {
        return res.json();
    }).then(dat => {
        if (dat.response == 'register_success') {
            login(username, password)
        } else if (dat.response == 'register_fail_password_short') {
            $('#regPass').value = ''
            $('#regPass_re').value = ''
            calert(dat.message)
            $('#regPass').placeholder = dat.message
            $('#regPass_re').placeholder = dat.message
            $('#regPass').focus();
        } else {
            $('#regUsername').value = ''
            calert(dat.message)
            $('#regUsername').placeholder = dat.message
            $('#regUsername').focus();
        }
    })
}