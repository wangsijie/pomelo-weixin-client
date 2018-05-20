module.exports.copyArray = function (dest, doffset, src, soffset, length) {
    if ('function' === typeof src.copy) {
        // Buffer
        src.copy(dest, doffset, soffset, soffset + length);
    } else {
        // Uint8Array
        for (var index = 0; index < length; index++) {
            dest[doffset++] = src[soffset++];
        }
    }
};