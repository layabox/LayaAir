/**
 * @internal
 * base64编码解码类
 * @author ww
 */
export class glTFBase64Tool {

	constructor() {

	}
	static chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	static reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
	static reghead = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,/i;

	// Use a lookup table to find the index.
	static lookup: Uint8Array = null;

	static init(): void {
		if (glTFBase64Tool.lookup)
			return;
		glTFBase64Tool.lookup = new Uint8Array(256)
		for (var i: number = 0; i < glTFBase64Tool.chars.length; i++) {
			glTFBase64Tool.lookup[glTFBase64Tool.chars.charCodeAt(i)] = i;
		}
	}

	/**
	 * 判断字符串是否是 base64
	 * @param str 
	 */
	static isBase64String(str: string): boolean {
		return glTFBase64Tool.reg.test(str);
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
			base64 += glTFBase64Tool.chars[bytes[i] >> 2];
			base64 += glTFBase64Tool.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
			base64 += glTFBase64Tool.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
			base64 += glTFBase64Tool.chars[bytes[i + 2] & 63];
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
	 * 解码成ArrayBuffer 
	 * @param base64
	 * @return 
	 * 
	 */
	static decode(base64: string): ArrayBuffer {
		glTFBase64Tool.init();
		var bufferLength: number = base64.length * 0.75, len: number = base64.length, i: number, p: number = 0, encoded1: number, encoded2: number, encoded3: number, encoded4: number;

		if (base64[base64.length - 1] === "=") {
			bufferLength--;
			if (base64[base64.length - 2] === "=") {
				bufferLength--;
			}
		}

		var arraybuffer: ArrayBuffer = new ArrayBuffer(bufferLength), bytes: Uint8Array = new Uint8Array(arraybuffer);

		for (i = 0; i < len; i += 4) {
			encoded1 = glTFBase64Tool.lookup[base64.charCodeAt(i)];
			encoded2 = glTFBase64Tool.lookup[base64.charCodeAt(i + 1)];
			encoded3 = glTFBase64Tool.lookup[base64.charCodeAt(i + 2)];
			encoded4 = glTFBase64Tool.lookup[base64.charCodeAt(i + 3)];

			bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
			bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
			bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
		}

		return arraybuffer;
	}
	;
}


