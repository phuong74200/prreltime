(function () {

    let socket = io('ws://127.0.0.1:7420');

    let storage = {
        username: '',
        notification: true,
    }

    //SOCKETs

    socket.on('connect', ws => {
        socket.on('user_multiple_login', res => {
            let client = md5(getCookie('tokens'))
            if (client == res) {
                window.location = '/index';
            }
        })

        $('#messageInput').on('keyup', e => {
            if (e.which == 13) {
                socket.emit('message', {
                    tokens: getCookie('tokens'),
                    message: e.target.value
                })
                selfMessage(storage.username, e.target.value)
                if (storage.notification) {
                    var audio = new Audio('../data/audio/deduction-588.mp3');
                    audio.volume = 1;
                    audio.play();
                }

                e.target.value = ''
            }
        })

        socket.on('new_user_online', res => {
            console.log(res)
            if ($(`#${md5(res.username)}`)) {
                $(`#${md5(res.username)}`).setAttribute('username', res.username + '_online')
                $(`#${md5(res.username)}`).querySelector('.avatar-container').style.border = '2px solid green'
            } else {
                let avatar = appendNewUser(res.username)
                fetch('/get/avatar/' + res.username)
                    .then(img => {
                        return img.json();
                    }).then(base64 => {
                        avatar.querySelector('.avatar').style.backgroundImage = `url(${base64.base64})`
                    })
            }
        })

        socket.on('new_user_leave', res => {
            $(`#${md5(res)}`).setAttribute('username', res + '_offline')
            $(`#${md5(res)}`).querySelector('.avatar-container').style.border = '2px solid red'
        })

        socket.on('message', data => {
            pushMessage(data.username, data.message)
            if (storage.notification) {
                var audio = new Audio('../data/audio/when-604.mp3');
                audio.volume = 0.7;
                audio.play();
            }
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
            for (let user of dat) {
                if (!$(`#${user.username}`)) {
                    let avatar = appendNewUser(user.username, user.status)
                    console.log(avatar)
                    fetch('/get/avatar/' + user.username)
                        .then(img => {
                            return img.json();
                        }).then(base64 => {
                            avatar.querySelector('.avatar').style.backgroundImage = `url(${base64.base64})`
                        })
                }
            }
        })

        /*
    setInterval(function() {
        console.log(localData)
    }, 1000)
    */

        fetch('/post/userdata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                tokens: getCookie('tokens'),

            })
        }).then(res => {
            return res.json();
        }).then(dat => {
            let username = dat.username;
            storage.username = username

            console.log(dat)

            $('#career').textContent = dat.career

            fetch('/get/image/' + dat.high_res_avatar)
                .then(img => {
                    return img.json();
                }).then(base64 => {
                    console.log(base64)
                    $('#inforAvatar').style.backgroundImage = base64.base64
                })

            $('#inforUsername').textContent = username
            fetch('/get/message', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
            }).then(res => {
                return res.json();
            }).then(dat => {
                console.log(dat)
                dat.sort(function (a, b) { return a.timeStamp - b.timeStamp });
                for (let mes of dat) {
                    if (mes.username == username) {
                        selfMessage(mes.username, mes.message)
                    } else {
                        pushMessage(mes.username, mes.message)
                    }
                }
            })
        })
    }

    function appendNewUser(username, status = 'online') {
        let online = document.createElement('div')
        let avatarContainer = document.createElement('div')
        let avatar = document.createElement('div')
        let name = document.createElement('div')
        online.className = 'online'
        online.id = md5(username);
        avatarContainer.className = 'avatar-container'
        avatar.className = 'avatar'
        name.className = 'name'
        name.textContent = username
        online.appendChild(avatarContainer)
        online.setAttribute('username', username + '_online')
        online.appendChild(name)
        avatarContainer.appendChild(avatar)
        $('#onlineUsers').appendChild(online)
        if (status == 'offline') {
            avatarContainer.style.border = '2px solid red'
            online.setAttribute('username', username + '_offline')
        }
        return online;
    }

    $('#chatDisplay').on("scroll", function (e) {
        console.log((e.target.scrollTop / e.target.scrollHeight) * 100)
        $('#scrollMeter').style.width = `${(e.target.scrollTop / e.target.scrollHeight) * 100}%`
    }, false);

    $('#notificationSwitch').on('click', e => {
        if (storage.notification) {
            e.target.className = 'far fa-bell'
            storage.notification = false;
        } else {
            e.target.className = 'fas fa-bell'
            storage.notification = true
        }
    })

})();

$('#searchBox').on('keyup', function (e) {
    let items = document.querySelectorAll('[username]')
    for (let item of items) {
        if (item.getAttribute('username').toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
            item.style.display = 'flex'
        } else {
            item.style.display = 'none'
        }
    }
})

function pushMessage(username, message) {
    if (message.trim().length > 0) {
        let chatPop = $('#chatPop').cloneNode(true)
        chatPop.querySelector('span').textContent = message
        chatPop.querySelector('.username-label').textContent = username
        $('#chatDisplay').appendChild(chatPop)
        $('#chatDisplay').scrollTop = $('#chatDisplay').scrollHeight;
        fetch('/get/avatar/' + username)
            .then(img => {
                return img.json();
            }).then(base64 => {
                chatPop.querySelector('.chat-avatar').style.backgroundImage = `url(${base64.base64})`
            })
    }
}

function selfMessage(username, message) {
    if (message.trim().length > 0) {
        let chatPop = $('#chatPop').cloneNode(true)
        chatPop.querySelector('.chat-message').textContent = message
        chatPop.querySelector('.chat-message').style.background = '#004DFC'
        chatPop.querySelector('.chat-message').style.color = 'white'
        let avatar = chatPop.querySelector('.chat-avatar');
        chatPop.querySelector('.chat-avatar').remove();
        fetch('/get/avatar/' + username)
            .then(img => {
                return img.json();
            }).then(base64 => {
                chatPop.querySelector('.chat-avatar').style.backgroundImage = `url(${base64.base64})`
            })
        chatPop.appendChild(avatar)
        $('#chatDisplay').appendChild(chatPop)
        $('#chatDisplay').scrollTop = $('#chatDisplay').scrollHeight;
    }
}