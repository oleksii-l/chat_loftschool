let enterBtn = document.querySelector('#enterchat');
let autorizationWnd = document.querySelector('#autorization');
let chatWnd = document.querySelector('#chat');
let autoForm = document.querySelector('#autorization-form');
let sendMessageBtn = document.querySelector('#send-message');
let memberList = document.querySelector('#member-list');
let userInfoBtn = document.querySelector('#user-info-btn');
let userInfoWnd = document.querySelector('#user-info');
let closeBtn = document.querySelector('#close');
let uploadPhotoBtn = document.querySelector('#photo-upload-btn');
let profileWnd = document.querySelector('#upload-photo');

let lastUserNick = '';

let currentUser = {
    nick: '',
    img: 'img/no_photo.jpg',
}

const chatMsgTemplate = Handlebars.compile(document.querySelector('#chatMessage').innerHTML);
const chatMembersTemplate = Handlebars.compile(document.querySelector('#chatMembers').innerHTML);
const profileTemplate = Handlebars.compile(document.querySelector('#profileTemplate').innerHTML);

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
    userInfoWnd.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    userInfoWnd.style.display = 'none';
})

uploadPhotoBtn.addEventListener('click', ()=>{
    let html = profileTemplate({
        img: currentUser.img
    });
    profileWnd.innerHTML = html;
    profileWnd.style.display = 'block';
})

function initSocketConnection(message) {

    const ws = new WebSocket('ws://127.0.0.1:3000');

    ws.onopen = () => {
        ws.send(JSON.stringify(message));
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

            lastUserNick =  message.nick;
        } else if(message.type === 'new-client') {

            let html= chatMembersTemplate({
                members: message.members
            });
            memberList.innerHTML = html;
        }
    };

    sendMessageBtn.addEventListener('click', (event) => {
        event.preventDefault();
    
        let text = document.querySelector('#chat_message').value;
        let data = {
            type: "new-message",
            name: currentUser.name,
            nick: currentUser.nick,
            time: (new Date).toTimeString(),
            text: text,
            img: currentUser.img,
        };
        ws.send(JSON.stringify(data));
    });
}
