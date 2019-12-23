const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let clients = {};

wss.on('connection', ws => {
    ws.on('message', data => {

        let message = JSON.parse(data);

        if(message.type === 'new_user') {
            clients[message.nick] = {
                name: message.name
            }
        } else if (message.type === 'new-message') {
            console.log(data);
            console.log(JSON.parse(data));
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            })
        }

        console.log(clients);
    });

    ws.send('something from server');
});