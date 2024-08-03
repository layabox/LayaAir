/**
 * 二进制简易哈希计算以及二进制相等判断
 * @author LaoXie
 */
export class BinHashUtils {

	constructor() {

	}

	/**
	 * 计算哈希值
	 * @param	buffer 数据
	 * @param	start 起始位置
	 * @param	len 长度
	 * @param	magic 大质数
	 * @return
	 */
	static getHash(buffer: Uint8Array, start: number, len: number, magic: number = 9191891): number {
		var i: number;
		var rst: number = 0;
		for (i = 0; i < len; i++) {
			rst = (rst * 2 + buffer[start + i]) % magic;
		}
		return rst;
	}

	/**
	 * 判断两段数据是否相等
	 * @param	buffer1
	 * @param	start1
	 * @param	len1
	 * @param	buffer2
	 * @param	start2
	 * @param	len2
	 * @return
	 */
	static isSame(buffer1: Uint8Array, start1: number, len1: number, buffer2: Uint8Array, start2: number, len2: number): boolean {
		if (len1 != len2) return false;
		var i: number, len: number;
		len = len1;
		for (i = 0; i < len; i++) {
			if (buffer1[start1 + i] != buffer2[start2 + i]) return false;
		}
		return true;
	}
}


