const {copyArray} = require('./util');

module.exports = class Protocol {
    /**
     * pomele client encode
     * id message id;
     * route message route
     * msg message body
     * socketio current support string
     */
    static strencode(str) {
        var buffer = new Uint8Array(str.length * 3);
        var offset = 0;
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            var codes = null;
            if (charCode <= 0x7f) {
                codes = [charCode];
            } else if (charCode <= 0x7ff) {
                codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)];
            } else {
                codes = [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)];
            }
            for (var j = 0; j < codes.length; j++) {
                buffer[offset] = codes[j];
                ++offset;
            }
        }
        var _buffer = new Uint8Array(offset);
        copyArray(_buffer, 0, buffer, 0, offset);
        return _buffer;
    };

    /**
     * client decode
     * msg String data
     * return Message Object
     */
    static strdecode(buffer) {
        var bytes = new Uint8Array(buffer);
        var array = [];
        var offset = 0;
        var charCode = 0;
        var end = bytes.length;
        while (offset < end) {
            if (bytes[offset] < 128) {
                charCode = bytes[offset];
                offset += 1;
            } else if (bytes[offset] < 224) {
                charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f);
                offset += 2;
            } else if (bytes[offset] < 240) {
                charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
                offset += 3;
            } else if (bytes[offset] < 256) {
                charCode = ((bytes[offset] & 0x07) << 18) + ((bytes[offset + 1] & 0x3f) << 12) + ((bytes[offset + 2] & 0x3f) << 6) + (bytes[offset + 3] & 0x3f);
                offset += 4;
            }
            array.push(charCode);
        }
        // 分片处理避免无法解析过大的数据（原因暂未确认 #8）
        var charDecoder = String.fromCodePoint ? String.fromCodePoint : String.fromCharCode;
        var result = '';
        var chunk = 8 * 1024;
        var i;
        for (i = 0; i < array.length / chunk; i++) {
            result += charDecoder.apply(null, array.slice(i * chunk, (i + 1) * chunk));
        }
        result += charDecoder.apply(null, array.slice(i * chunk));
        return result;
    };
}