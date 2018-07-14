const Pomelo = require('./lib/Pomelo');

function wsCreator({url, onError, onOpen, onMessage, onClose}) {
    const ws = wx.connectSocket({url:url});
    ws.onError(onError);
    ws.onOpen(onOpen);
    ws.onMessage(onMessage);
    ws.onClose(onClose);
    return ws;
}

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