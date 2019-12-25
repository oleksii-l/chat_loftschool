let ws; //WebSocket

let enterBtn = document.querySelector('#enterchat');
let autorizationWnd = document.querySelector('#autorization');
let chatWnd = document.querySelector('#chat');
let autoForm = document.querySelector('#autorization-form');
let sendMessageBtn = document.querySelector('#send-message');
let memberList = document.querySelector('#member-list');
let userInfoBtn = document.querySelector('#user-info-btn');
let userInfoWnd = document.querySelector('#user-info');


let lastUserNick = '';

let currentUser = {
    nick: '',
    img: 'img/no_photo.jpg',
}

const chatMsgTemplate = Handlebars.compile(document.querySelector('#chatMessage').innerHTML);
const chatMembersTemplate = Handlebars.compile(document.querySelector('#chatMembers').innerHTML);
const profileTemplate = Handlebars.compile(document.querySelector('#profileTemplate').innerHTML);
const userInfoTemplate = Handlebars.compile(document.querySelector('#userInfoTemplate').innerHTML);

autoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let [name, nick] = [autoForm.elements['name'].value, autoForm.elements['nick'].value];
    currentUser.nick = nick;
    currentUser.name = name;

    initSocketConnection({
        type: 'new_user',
        name: name,
        nick: nick
    });

    autorizationWnd.style.display = 'none';
    chatWnd.style.visibility = 'visible';
})

userInfoBtn.addEventListener('click', () => {
    let html = userInfoTemplate({
        name: currentUser.name,
        img: currentUser.img === 'img/no_photo.jpg' ? 'img/photo-camera.png' : currentUser.img,
        nick: currentUser.nick
    });
    userInfoWnd.innerHTML = html;
    userInfoWnd.style.display = 'block';

    let closeBtn = document.querySelector('#close');
    let uploadPhotoBtn = document.querySelector('#photo-upload-btn');
    let profileWnd = document.querySelector('#upload-photo');
    let profileImg = document.querySelector('#profile__img');

    closeBtn.addEventListener('click', () => {
        userInfoWnd.style.display = 'none';
    })

    uploadPhotoBtn.addEventListener('click', () => {
        let html = profileTemplate({
            img: currentUser.img,
            nick: currentUser.nick
        });
        profileWnd.innerHTML = html;
        profileWnd.style.display = 'block';

        let fileBtn = document.querySelector('#file');
        let profileImg = document.querySelector('#profile__img');
        let profileBtnSave = document.querySelector('#profile-btn-save');
        let profileBtnCancel = document.querySelector('#profile-btn-cancel');

        profileImg.addEventListener('click', () => {
            fileBtn.click();
        })

        profileBtnCancel.addEventListener('click', () => {
            profileWnd.style.display = 'none';
            userInfoWnd.style.display = 'none';
        })

        profileBtnSave.addEventListener('click', (e) => {
            profileWnd.style.display = 'none';
            currentUser.img = profileImg.src;
            sendPhotoToServer(ws);
        });

        fileBtn.addEventListener('change', function () {
            const file = this.files[0];
            if (Math.floor(file.size / 1024) <= 512 && file.type === 'image/jpeg') {
                previewFile(file, profileImg);
            } else {
                alert('Файл должен быть изображением формата jpg с размером менее 512кб')
            }
        });

        profileWnd.addEventListener('drop', function (e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            const file = files[0];
            if (Math.floor(file.size / 1024) <= 512 && file.type === 'image/jpeg') {
                previewFile(file, profileImg);
            } else {
                alert('Файл должен быть изображением формата jpg с размером менее 512кб')
            }
        });

        /** Drag & Frop support */
        ['drop', 'dragenter', 'dragover', 'dragleave'].forEach(eventName => {
            profileWnd.addEventListener(eventName, function (e) {
                e.preventDefault();
                e.stopPropagation()
            })
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            profileWnd.addEventListener(eventName, function () {
                this.classList.add('highlight')
            })
        });

        ['dragleave', 'drop'].forEach(eventName => {
            profileWnd.addEventListener(eventName, function () {
                this.classList.remove('highlight')
            })
        });
    })

});


function previewFile(file, profileImg) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
        profileImg.src = reader.result;
    }
};

function sendPhotoToServer(webSocket) {
    webSocket.send(JSON.stringify({
        type: 'upload-photo',
        nick: currentUser.nick,
        img: currentUser.img
    }
    ));
};

function updateAllPhoto(nick, img) {
    let allImgToUpdate = document.querySelectorAll(`img[data-nick='${nick}']`);

    allImgToUpdate.forEach(elem => elem.src = img);
}

function initSocketConnection(message) {
    ws = new WebSocket('ws://127.0.0.1:3000');

    ws.onopen = () => {
        ws.send(JSON.stringify(message));
    };

    window.onunload = () => {
        ws.close(1000);
    };

    ws.onmessage = data => {
        let message = JSON.parse(data.data);

        if (message.type === 'new-message') {
            let html = chatMsgTemplate({
                name: message.name,
                nick: message.nick,
                time: message.time,
                text: message.text,
                img: message.img,
                first: lastUserNick !== message.nick ? 'messages__item--first' : '',
                right: currentUser.nick === message.nick ? 'messages__item--right' : ''
            });
            document.querySelector('#chat-messages').innerHTML += html;

            lastUserNick = message.nick;
        } else if (message.type === 'new-client') {
            let html = chatMembersTemplate({
                members: message.members
            });
            memberList.innerHTML = html;
            document.querySelector('#chat_mem_num').textContent = `${Object.keys(message.members).length} участника`

        } else if (message.type === 'photo-changed') {
            updateAllPhoto(message.nick, message.img);
        }
    };

    sendMessageBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const date = new Date();

        let messageInput = document.querySelector('#chat_message');
        let text = messageInput.value;
        let data = {
            type: "new-message",
            name: currentUser.name,
            nick: currentUser.nick,
            time: `${date.getHours()}:${date.getMinutes()}`,
            text: text,
            img: currentUser.img,
        };
        ws.send(JSON.stringify(data));
        messageInput.value = '';
    });
}
