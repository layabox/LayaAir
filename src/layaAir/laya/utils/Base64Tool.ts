/**
 * @en A utility class for Base64 encoding and decoding operations.
 * @zh Base64 编码和解码操作的实用工具类。
 */
export class Base64Tool {

    /**
     * @en The character set used for Base64 encoding.
     * @zh 用于 Base64 编码的字符集。
     */
    static chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    /**
     * @en Regular expression for validating Base64 encoded strings, including data URIs.
     * @zh 用于验证 Base64 编码字符串（包括数据 URI）的正则表达式。
     */
    static reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
    /**
     * @en Regular expression for matching the header of a data URI.
     * @zh 用于匹配数据 URI 头部的正则表达式。
     */
    static reghead = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,/i;

    /**
     * @en Use a lookup table to find the index.
     * @zh 使用查找表查找索引。
     */
    static lookup: Uint8Array = null;

    /**
     * @en Initializes the lookup table for Base64 decoding.
     * @zh 初始化用于 Base64 解码的查找表。
     */
    static init(): void {
        if (Base64Tool.lookup)
            return;
        Base64Tool.lookup = new Uint8Array(256)
        for (var i: number = 0; i < Base64Tool.chars.length; i++) {
            Base64Tool.lookup[Base64Tool.chars.charCodeAt(i)] = i;
        }
    }

    /**
     * @en Determines if a string is a base64 encoded string.
     * @param str The string to check.
     * @zh 判断字符串是否是 base64 编码的字符串。
     * @param str 需要检查的字符串。
     */
    static isBase64String(str: string): boolean {
        return Base64Tool.reg.test(str);
    }

    /**
     * @en Encodes an ArrayBuffer to a base64 string.
     * @param arraybuffer The ArrayBuffer to encode.
     * @zh 对 ArrayBuffer 进行编码，返回 base64 字符串。
     * @param arraybuffer 需要编码的 ArrayBuffer。
     */
    static encode(arraybuffer: ArrayBuffer): string {
        var bytes: Uint8Array = new Uint8Array(arraybuffer), i: number, len: number = bytes["length"], base64: string = "";

        for (i = 0; i < len; i += 3) {
            base64 += Base64Tool.chars[bytes[i] >> 2];
            base64 += Base64Tool.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += Base64Tool.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += Base64Tool.chars[bytes[i + 2] & 63];
        }

        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
        }
        else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
        }

        return base64;
    }

    /**
     * @en Decodes a base64 string to an ArrayBuffer.
     * @param base64 The base64 string to decode.
     * @zh 对 base64 字符串进行解码，返回 ArrayBuffer。
     * @param base64 需要解码的 base64 字符串。
     */
    static decode(base64: string): ArrayBuffer {
        Base64Tool.init();
        var bufferLength: number = base64.length * 0.75, len: number = base64.length, i: number, p: number = 0, encoded1: number, encoded2: number, encoded3: number, encoded4: number;

        if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
                bufferLength--;
            }
        }

        var arraybuffer: ArrayBuffer = new ArrayBuffer(bufferLength), bytes: Uint8Array = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = Base64Tool.lookup[base64.charCodeAt(i)];
            encoded2 = Base64Tool.lookup[base64.charCodeAt(i + 1)];
            encoded3 = Base64Tool.lookup[base64.charCodeAt(i + 2)];
            encoded4 = Base64Tool.lookup[base64.charCodeAt(i + 3)];

            if(p + 1 > bufferLength) continue;
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            if(p + 1 > bufferLength) continue;
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            if(p + 1 > bufferLength) continue;
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
    }

}