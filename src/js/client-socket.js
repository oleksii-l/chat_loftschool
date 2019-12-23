const ws = new WebSocket('ws://127.0.0.1:3000');

let enterBtn = document.querySelector('#enterchat');
let autorizationWnd = document.querySelector('#autorization');
let chatWnd = document.querySelector('#chat');
let autoForm = document.querySelector('#autorization-form');
let sendMessageBtn = document.querySelector('#send-message');

let currentUser = {
    nick: '',
    img: '',
}

const chatMsgTemplate = Handlebars.compile(document.querySelector('#chatMessage').innerHTML);

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
})

autoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let [name, nick] = [autoForm.elements['name'].value, autoForm.elements['nick'].value];

    initSocketConnection({
        type: 'new_user',
        name: name,
        nick: nick
    });

    autorizationWnd.style.display = 'none';
    chatWnd.style.visibility = 'visible';
})

function initSocketConnection(message) {

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
                first: '',
                right: ''
            });
            document.querySelector('#chat-messages').innerHTML += html;
        }
    };
}

