const Protocol = require('./Protocal');
const {copyArray} = require('./util');

const TYPE_REQUEST = 0;
const TYPE_NOTIFY = 1;
const TYPE_RESPONSE = 2;
const TYPE_PUSH = 3;

const MSG_FLAG_BYTES = 1;
const MSG_ROUTE_CODE_BYTES = 2;
const MSG_ID_MAX_BYTES = 5;
const MSG_ROUTE_LEN_BYTES = 1;

const MSG_ROUTE_CODE_MAX = 0xffff;

const MSG_COMPRESS_ROUTE_MASK = 0x1;
const MSG_TYPE_MASK = 0x7;

module.exports = class Message {
    static get TYPE_REQUEST() {
        return TYPE_REQUEST;
    }
    static get TYPE_NOTIFY() {
        return TYPE_NOTIFY;
    }
    static get TYPE_RESPONSE() {
        return TYPE_RESPONSE;
    }
    static get TYPE_PUSH() {
        return TYPE_PUSH;
    }
    /**
     * Message protocol encode.
     *
     * @param  {Number} id            message id
     * @param  {Number} type          message type
     * @param  {Number} compressRoute whether compress route
     * @param  {Number|String} route  route code or route string
     * @param  {Buffer} msg           message body bytes
     * @return {Buffer}               encode result
     */
    static encode(id, type, compressRoute, route, msg) {
        // caculate message max length
        var idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
        var msgLen = MSG_FLAG_BYTES + idBytes;

        if (msgHasRoute(type)) {
            if (compressRoute) {
                if (typeof route !== 'number') {
                    throw new Error('error flag for number route!');
                }
                msgLen += MSG_ROUTE_CODE_BYTES;
            } else {
                msgLen += MSG_ROUTE_LEN_BYTES;
                if (route) {
                    route = Protocol.strencode(route);
                    if (route.length > 255) {
                        throw new Error('route maxlength is overflow');
                    }
                    msgLen += route.length;
                }
            }
        }
        if (msg) {
            msgLen += msg.length;
        }

        var buffer = new Uint8Array(msgLen);
        var offset = 0;

        // add flag
        offset = encodeMsgFlag(type, compressRoute, buffer, offset);

        // add message id
        if (msgHasId(type)) {
            offset = encodeMsgId(id, buffer, offset);
        }

        // add route
        if (msgHasRoute(type)) {
            offset = encodeMsgRoute(compressRoute, route, buffer, offset);
        }

        // add body
        if (msg) {
            offset = encodeMsgBody(msg, buffer, offset);
        }

        return buffer;
    }

    /**
     * Message protocol decode.
     *
     * @param  {Buffer|Uint8Array} buffer message bytes
     * @return {Object}            message object
     */
    static decode(buffer) {
        var bytes = new Uint8Array(buffer);
        var bytesLen = bytes.length || bytes.byteLength;
        var offset = 0;
        var id = 0;
        var route = null;

        // parse flag
        var flag = bytes[offset++];
        var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
        var type = (flag >> 1) & MSG_TYPE_MASK;

        // parse id
        if (msgHasId(type)) {
            var m = parseInt(bytes[offset]);
            var i = 0;
            do {
                var m = parseInt(bytes[offset]);
                id = id + ((m & 0x7f) * Math.pow(2, (7 * i)));
                offset++;
                i++;
            } while (m >= 128);
        }

        // parse route
        if (msgHasRoute(type)) {
            if (compressRoute) {
                route = (bytes[offset++]) << 8 | bytes[offset++];
            } else {
                var routeLen = bytes[offset++];
                if (routeLen) {
                    route = new Uint8Array(routeLen);
                    copyArray(route, 0, bytes, offset, routeLen);
                    route = Protocol.strdecode(route);
                } else {
                    route = '';
                }
                offset += routeLen;
            }
        }

        // parse body
        var bodyLen = bytesLen - offset;
        var body = new Uint8Array(bodyLen);

        copyArray(body, 0, bytes, offset, bodyLen);

        return {
            'id': id, 'type': type, 'compressRoute': compressRoute,
            'route': route, 'body': body
        };
    }
}

var msgHasId = function (type) {
    return type === TYPE_REQUEST || type === TYPE_RESPONSE;
};

var msgHasRoute = function (type) {
    return type === TYPE_REQUEST || type === TYPE_NOTIFY ||
        type === TYPE_PUSH;
};

var caculateMsgIdBytes = function (id) {
    var len = 0;
    do {
        len += 1;
        id >>= 7;
    } while (id > 0);
    return len;
};

var encodeMsgFlag = function (type, compressRoute, buffer, offset) {
    if (type !== TYPE_REQUEST && type !== TYPE_NOTIFY &&
        type !== TYPE_RESPONSE && type !== TYPE_PUSH) {
        throw new Error('unkonw message type: ' + type);
    }

    buffer[offset] = (type << 1) | (compressRoute ? 1 : 0);

    return offset + MSG_FLAG_BYTES;
};

var encodeMsgId = function (id, buffer, offset) {
    do {
        var tmp = id % 128;
        var next = Math.floor(id / 128);

        if (next !== 0) {
            tmp = tmp + 128;
        }
        buffer[offset++] = tmp;

        id = next;
    } while (id !== 0);

    return offset;
};

var encodeMsgRoute = function (compressRoute, route, buffer, offset) {
    if (compressRoute) {
        if (route > MSG_ROUTE_CODE_MAX) {
            throw new Error('route number is overflow');
        }

        buffer[offset++] = (route >> 8) & 0xff;
        buffer[offset++] = route & 0xff;
    } else {
        if (route) {
            buffer[offset++] = route.length & 0xff;
            copyArray(buffer, offset, route, 0, route.length);
            offset += route.length;
        } else {
            buffer[offset++] = 0;
        }
    }

    return offset;
};

var encodeMsgBody = function (msg, buffer, offset) {
    copyArray(buffer, offset, msg, 0, msg.length);
    return offset + msg.length;
};