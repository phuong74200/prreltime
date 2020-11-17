function signIn() {
    $('#login').style.transform = 'rotateY(90deg)';
    $('#username').focus();
}

$('#username').onfocus = function (e) {
    $('#usernameBtnHolder').classList.add('usernameBtnHolderFocus')
}

$('#username').onblur = function (e) {
    if (e.currentTarget.value.length == 0) {
        $('#usernameBtnHolder').classList.remove('usernameBtnHolderFocus');
    }
}

$('#password').onfocus = function (e) {
    $('#passwordBtnHolder').classList.add('usernameBtnHolderFocus')
}

$('#password').onblur = function (e) {
    if (e.currentTarget.value.length == 0) {
        $('#passwordBtnHolder').classList.remove('usernameBtnHolderFocus');
        console.log()
    }
}

function usernameNext() {
    $('#login').style.transform = 'rotateY(90deg) rotateZ(180deg)';
    $('#usernameBtnHolder').classList.remove('usernameBtnHolderFocus');
    $('#password').focus();
}

$('#username').addEventListener('keyup', function (e) {
    if (e.which == 13) {
        usernameNext()
    }
})
$('#usernameNextBtn').onclick = function () {
    usernameNext()
}

//on user press BACK key
$('#password').addEventListener('keydown', function (e) {
    if (e.which == 8 && e.currentTarget.value.length == 0) {
        $('#password').blur();
        $('#login').style.transform = 'rotateY(90deg)';
        $('#username').focus();
    }
})

$('#username').addEventListener('keydown', function (e) {
    if (e.which == 8 && e.currentTarget.value.length == 0) {
        $('#login').style.transform = 'rotateY(0)';
        $('#username').blur();
    }
})

//press escape to exit

document.addEventListener('keyup', function (e) {
    if (e.which == 27) exitLogin()
})

function passwordNext() {
    login($('#username').value, $('#password').value)
    $('#login').style.transform = 'rotateY(-180deg)';
}

$('#password').addEventListener('keyup', function (e) {
    if (e.which == 13) {
        passwordNext()
    }
})
$('#passwordNextBtn').onclick = function () {
    passwordNext();
}

$('#closeBtn').onclick = function () {
    exitLogin();
}

function exitLogin() {
    $('#login').style.transform = '';
    $('#password').value = '';
    $('#passwordBtnHolder').classList.remove('usernameBtnHolderFocus');
    $('#username').value = '';
    $('#username').classList.remove('usernameBtnHolderFocus');
}

function registerForm() {
    $('#registerMenu').style.display = 'block'
    setTimeout(function () {
        $('#registerMenu').classList.add('register-menu_anim')
    }, 100)
}

$('#registerMenu').onclickout(function (e) {
    if ($('#registerMenu').css().display == 'block') {
        $('#registerMenu').classList.remove('register-menu_anim')
    }

})

let ctx = $('#img-compress').getContext('2d')
ctx.fillStyle = '#6f6cde'
ctx.fillRect(0, 0, 1000, 1000);

document.getElementById('avatarSelector').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

    console.log(files)

    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
            $('#avatar').style.backgroundImage = `url(${fr.result})`;
            var canvas = document.getElementById("img-compress");
            var ctx = canvas.getContext("2d");
            var image = new Image();
            image.onload = function () {
                let ratio = image.naturalHeight / image.naturalWidth

                canvas.height = (image.naturalHeight) / (image.naturalHeight * (image.naturalHeight / (image.naturalHeight * 60)));
                canvas.width = (image.naturalWidth * ratio) / (image.naturalWidth * (image.naturalWidth / (image.naturalWidth * 60)));

                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
            image.src = fr.result
        }
        fr.readAsDataURL(files[0]);
    } else {
        console.log('file reader not supported! please switch to chrome')
    }
}

let tagArr = document.getElementsByTagName("input");
for (let i = 0; i < tagArr.length; i++) {
    tagArr[i].autocomplete = 'off';
}