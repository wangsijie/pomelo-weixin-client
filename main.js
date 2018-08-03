const Pomelo = require('./lib/Pomelo');
// const WebSocket = require('ws');

function wsCreator({url, onError, onOpen, onMessage, onClose}) {
    const ws = wx.connectSocket({url:url});
    ws.onError(onError);
    ws.onOpen(onOpen);
    ws.onMessage(onMessage);
    ws.onClose(onClose);
    return ws;
}

// function wsCreator({url, onError, onOpen, onMessage, onClose}) {
//     const ws = new WebSocket(url);
//     ws.onerror = onError;
//     ws.onopen = onOpen;
//     ws.onmessage = onMessage;
//     ws.onclose = onClose;
//     return ws;
// }

function urlGenerator(host, port) {
    let url = 'wss://' + host;
    if (port) {
        url += '/ws/' + port + '/';
    }
    return url;
}

module.exports = new Pomelo({
    wsCreator,
    urlGenerator
});