(function () {

    let socket = io('ws://127.0.0.1:7420');

    //SOCKETs

    socket.on('connect', ws => {
        socket.on('user_multiple_login', res => {
            let client = md5(getCookie('tokens'))
            if (client == res) {
                window.location = '/index';
            }
        })

        socket.on('new_user_online', res => {
            if ($(`#${res}`)) {
                $(`#${res}`).style.color = 'green'
            } else {
                let li = document.createElement('li')
                li.textContent = res
                $('#list').appendChild(li);
                li.id = res
                console.log('new user ' + res)
            }
        })

        socket.on('new_user_leave', res => {
            $(`#${res}`).style.color = 'red'
        })
        
    })

    //API methods

    fetch('/check/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            tokens: getCookie('tokens'),
        })
    }).then(res => {
        return res.json();
    }).then(dat => {
        console.log(dat)
        if (dat.response == 'tokens_true' && dat.status == 'offline') {
            socket.emit('user_alive', getCookie('tokens'));
            main();
        } else if (dat.status == 'online') {
            socket.emit('user_multiple_login', getCookie('tokens'));
        } else {
            window.location = '/index'
        }
    })

    //PAGE

    function main() {
        fetch('/get/userList', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
        }).then(res => {
            return res.json();
        }).then(dat => {
            console.log(dat)
            for (let user of dat) {
                let li = document.createElement('li')
                li.textContent = user.username
                li.style.color = (user.status == 'offline') ? 'red' : 'green'
                li.id = user.username
                $('#list').appendChild(li);
            }
        })
    }

})();