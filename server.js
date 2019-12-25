const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let clients = {};

wss.on('connection', ws => {
    let currentUserNick;

    ws.on('message', data => {
        let message = JSON.parse(data);

        if (message.type === 'new_user') {
            clients[message.nick] = {
                name: message.name,
                img: 'img/no_photo.jpg',
                nick: message.nick
            }

            let msgToSend = {
                type: 'new-client',
                members: clients
            };

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(msgToSend));
                }
            })
            currentUserNick = message.nick;
        } else if (message.type === 'new-message') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            })
        } else if (message.type === 'upload-photo') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'photo-changed',
                        img: message.img,
                        nick: message.nick
                    }));
                }
            })
        }
    });

    ws.on('close', () => {
        delete clients[currentUserNick];
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'new-client',
                    members: clients
                }));
            }
        });
    });
});
