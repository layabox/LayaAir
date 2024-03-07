import { ByteEx } from "./ByteEx";
/**
	 * base64编码解码类
	 * @author ww
	 */
export class Base64Tool {

	constructor() {

	}
	static chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	// Use a lookup table to find the index.
	static lookup: Uint8Array = null;

	static init(): void {
		if (Base64Tool.lookup)
			return;
		Base64Tool.lookup = new Uint8Array(256)
		for (var i: number = 0; i < Base64Tool.chars.length; i++) {
			Base64Tool.lookup[Base64Tool.chars.charCodeAt(i)] = i;
		}
	}

	/**
	 * 编码ArrayBuffer 
	 * @param arraybuffer
	 * @return 
	 * 
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
	 * 编码字符串 
	 * 编码时会在最前面加上字符串长度
	 * @param str
	 * @return 
	 * 
	 */
	static encodeStr(str: string): string {
		var byte: ByteEx;
		byte = new ByteEx();
		byte.writeUTFString(str);
		return Base64Tool.encodeByte(byte);
	}

	/**
	 * 编码字符串 
	 * @param str
	 * @return 
	 * 
	 */
	static encodeStr2(str: string): string {
		var byte: ByteEx;
		byte = new ByteEx();
		byte.writeUTFBytes(str);
		return Base64Tool.encodeByte(byte);
	}
	/**
	 * 编码Byte 
	 * @param byte
	 * @param start
	 * @param end
	 * @return 
	 * 
	 */
	static encodeByte(byte: ByteEx, start: number = 0, end: number = -1): string {
		if (end < 0) {
			end = byte.length;
		}
		return Base64Tool.encode(byte.buffer.slice(start, end));
	}

	/**
	 * 解码成Byte 
	 * @param base64
	 * @return 
	 * 
	 */
	static decodeToByte(base64: string): ByteEx {
		return new ByteEx(Base64Tool.decode(base64));
	}
	/**
	 * 解码成ArrayBuffer 
	 * @param base64
	 * @return 
	 * 
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

			if (p + 1 > bufferLength) continue;
			bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
			if (p + 1 > bufferLength) continue;
			bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
			if (p + 1 > bufferLength) continue;
			bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
		}

		return arraybuffer;
	}
	;
}


