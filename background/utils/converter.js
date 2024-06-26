class Converter {
    static bytesToHex(byteArray) {
        return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2)
        }).join('')
    }

    static hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2){
            var i = parseInt(hex.substr(c, 2), 16)
            if (isNaN(i)) throw 'given string is not hexadecimal!'
            bytes.push(i)
        }

        return bytes
    }

    static hexToInt(hex) {
        return parseInt(hex, 16);
    }

    static utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while(i < len) {
            c = array[i++];
            switch(c >> 4)
            {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
                case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }

        return out;
    }

    static hexToUint8Array(hexString) {
        // Remove the '0x' prefix if present
        if (hexString.slice(0, 2) === '0x') {
            hexString = hexString.slice(2);
        }

        // Create a Uint8Array to hold the result
        const uint8Array = new Uint8Array(hexString.length / 2);

        // Loop through the hex string, two characters at a time
        for (let i = 0; i < hexString.length; i += 2) {
            // Convert each pair of characters to a byte and store it in the Uint8Array
            uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }

        return uint8Array;
    }
}
