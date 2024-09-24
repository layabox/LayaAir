/**
 * @en The Rand class is used to create random numbers using a 32-bit unsigned integer seed.
 * @zh Rand 类用于通过32位无符号整型随机种子创建随机数。
 */
export class Rand {
	/**
	 * @en Obtain unsigned 32-bit floating-point random numbers through unsigned 32-bit shaping
	 * @param v The unsigned 32-bit integer random number.
	 * @returns The 32-bit floating-point random number.
	 * @zh 通过无符号32位整形，获取32位浮点随机数。
	 * @param v 无符号32位整数随机数。
	 * @returns 32位浮点随机数。
	 */
	static getFloatFromInt(v: number): number {
		// take 23 bits of integer, and divide by 2^23-1
		return (v & 0x007FFFFF) * (1.0 / 8388607.0)
	}

	/**
	 * @en Obtain an unsigned 8-bit byte random number through unsigned 32-bit shaping.
	 * @param v The unsigned 32-bit integer random number.
	 * @returns The unsigned 8-bit byte random number.
	 * @zh 通过无符号32位整形，获取无符号8位字节随机数。
	 * @param v 无符号32位整数随机数。
	 * @returns 无符号8位字节随机数。
	 */
	static getByteFromInt(v: number): number {//TODO：待验证函数
		// take the most significant byte from the 23-bit value
		return (v & 0x007FFFFF) >>> 15/*(23-8)*/;
	}

	/**@internal */
	private _temp: Uint32Array = new Uint32Array(1);

	/**
	 * @en Obtain random seeds
	 * @zh 获取随机种子。
	 */
	seeds: Uint32Array = new Uint32Array(4);

	/**
	 * @en The random seed.
	 * @zh 随机种子。
	 */
	get seed(): number {
		return this.seeds[0];
	}

	set seed(seed: number) {
		this.seeds[0] = seed;
		this.seeds[1] = this.seeds[0] * 0x6C078965/*1812433253U*/ + 1;
		this.seeds[2] = this.seeds[1] * 0x6C078965/*1812433253U*/ + 1;
		this.seeds[3] = this.seeds[2] * 0x6C078965/*1812433253U*/ + 1;
	}

	/**
	 * @en Constructor method.
	 * @param	seed  32bit unsigned integer random seed.
	 * @zh 构造方法。
	 * @param	seed  32位无符号整型随机种子。
	 */
	constructor(seed: number) {
		this.seeds[0] = seed;
		this.seeds[1] = this.seeds[0] * 0x6C078965/*1812433253U*/ + 1;
		this.seeds[2] = this.seeds[1] * 0x6C078965/*1812433253U*/ + 1;
		this.seeds[3] = this.seeds[2] * 0x6C078965/*1812433253U*/ + 1;
	}

	/**
	 * @en Gets an unsigned 32-bit integer random number.
	 * @returns The unsigned 32-bit integer random number.
	 * @zh 获取无符号32位整数随机数
	 * @returns 无符号32位整数随机数。
	 */
	getUint(): number {
		this._temp[0] = this.seeds[0] ^ (this.seeds[0] << 11);
		this.seeds[0] = this.seeds[1];
		this.seeds[1] = this.seeds[2];
		this.seeds[2] = this.seeds[3];
		this.seeds[3] = (this.seeds[3] ^ (this.seeds[3] >>> 19)) ^ (this._temp[0] ^ (this._temp[0] >>> 8));
		return this.seeds[3];
	}

	/**
	 * @en Gets a floating-point random number between 0 and 1.
	 * @returns The floating-point random number between 0 and 1.
	 * @zh 获取0到1之间的浮点随机数。
	 * @returns 0到1之间的浮点随机数。
	 */
	getFloat(): number {
		this.getUint();
		return (this.seeds[3] & 0x007FFFFF) * (1.0 / 8388607.0);
	}

	/**
	 * @en Gets a floating-point random number between -1 and 1.
	 * @returns The floating-point random number between -1 and 1.
	 * @zh 获取-1到1之间的浮点随机数。
	 * @returns -1到1之间的浮点随机数。
	 */
	getSignedFloat(): number {
		return this.getFloat() * 2.0 - 1.0;
	}

}

