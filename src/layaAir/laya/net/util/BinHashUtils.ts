/**
 * @en Utility class for basic binary hash calculation and binary equality comparison.
 * @zh 用于基本的二进制哈希计算和二进制相等性判断的工具类。
 */
export class BinHashUtils {
	/**
	 * @en Calculates the hash value of a binary buffer.
	 * @param buffer The binary data to hash.
	 * @param start The starting position within the buffer.
	 * @param len The length of data to consider for the hash calculation.
	 * @param magic A large prime number used as the modulus in the hash calculation, defaults to 9191891.
	 * @return The calculated hash value as a number.
	 * @zh 计算二进制缓冲区的哈希值。
	 * @param buffer 要进行哈希的数据。
	 * @param start 缓冲区中的起始位置。
	 * @param len 要用于哈希计算的数据长度。
	 * @param magic 哈希计算中使用的模数，大质数，默认为9191891。
	 * @return 返回计算得到的哈希值。
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
	 * @en Compares two binary data segments for equality.
	 * @param buffer1 The first binary data buffer.
	 * @param start1 The starting position within the first buffer.
	 * @param len1 The length of data to compare in the first buffer.
	 * @param buffer2 The second binary data buffer.
	 * @param start2 The starting position within the second buffer.
	 * @param len2 The length of data to compare in the second buffer.
	 * @return True if the data segments are equal, false otherwise.
	 * @zh 比较两段二进制数据是否相等。
	 * @param buffer1 第一个二进制数据缓冲区。
	 * @param start1 第一个缓冲区中的起始位置。
	 * @param len1 要比较的第一个缓冲区的数据长度。
	 * @param buffer2 第二个二进制数据缓冲区。
	 * @param start2 第二个缓冲区中的起始位置。
	 * @param len2 要比较的第二个缓冲区的数据长度。
	 * @return 如果数据段相等则返回true，否则返回false。
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


