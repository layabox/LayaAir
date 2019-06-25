/**
	 * <code>Rand</code> 类用于通过128位整型种子创建随机数,算法来自:https://github.com/AndreasMadsen/xorshift。
	 */
export class RandX {
	/**@internal */
	private static _CONVERTION_BUFFER: DataView = new DataView(new ArrayBuffer(8));

	/**@internal */
	private _state0U: number;
	/**@internal */
	private _state0L: number;
	/**@internal */
	private _state1U: number;
	/**@internal */
	private _state1L: number;

	/**基于时间种子的随机数。*/
	static defaultRand: RandX = new RandX([0, Date.now() / 65536, 0, Date.now() % 65536]);

	/**
	 * 创建一个 <code>Rand</code> 实例。
	 * @param	seed  随机种子。
	 */
	constructor(seed: any[]) {
		if (!(seed instanceof Array) || seed.length !== 4)
			throw new Error('Rand:Seed must be an array with 4 numbers');

		this._state0U = seed[0] | 0;
		this._state0L = seed[1] | 0;
		this._state1U = seed[2] | 0;
		this._state1L = seed[3] | 0;
	}

	/**
	 * 通过2x32位的数组，返回64位的随机数。
	 * @return 64位的随机数。
	 */
	randomint(): any[] {
		// uint64_t s1 = s[0]
		var s1U: number = this._state0U, s1L: number = this._state0L;
		// uint64_t s0 = s[1]
		var s0U: number = this._state1U, s0L: number = this._state1L;

		// result = s0 + s1
		var sumL: number = (s0L >>> 0) + (s1L >>> 0);
		var resU: number = (s0U + s1U + (sumL / 2 >>> 31)) >>> 0;
		var resL: number = sumL >>> 0;

		// s[0] = s0
		this._state0U = s0U;
		this._state0L = s0L;

		// - t1 = [0, 0]
		var t1U: number = 0, t1L: number = 0;
		// - t2 = [0, 0]
		var t2U: number = 0, t2L: number = 0;

		// s1 ^= s1 << 23;
		// :: t1 = s1 << 23
		var a1: number = 23;
		var m1: number = 0xFFFFFFFF << (32 - a1);
		t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
		t1L = s1L << a1;
		// :: s1 = s1 ^ t1
		s1U = s1U ^ t1U;
		s1L = s1L ^ t1L;

		// t1 = ( s1 ^ s0 ^ ( s1 >> 17 ) ^ ( s0 >> 26 ) )
		// :: t1 = s1 ^ s0
		t1U = s1U ^ s0U;
		t1L = s1L ^ s0L;
		// :: t2 = s1 >> 18
		var a2: number = 18;
		var m2: number = 0xFFFFFFFF >>> (32 - a2);
		t2U = s1U >>> a2;
		t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
		// :: t1 = t1 ^ t2
		t1U = t1U ^ t2U;
		t1L = t1L ^ t2L;
		// :: t2 = s0 >> 5
		var a3: number = 5;
		var m3: number = 0xFFFFFFFF >>> (32 - a3);
		t2U = s0U >>> a3;
		t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
		// :: t1 = t1 ^ t2
		t1U = t1U ^ t2U;
		t1L = t1L ^ t2L;

		// s[1] = t1
		this._state1U = t1U;
		this._state1L = t1L;

		// return result
		return [resU, resL];
	}

	/**
	 * 返回[0,1)之间的随机数。
	 * @return
	 */
	random(): number {
		// :: t2 = randomint()
		var t2: any[] = this.randomint();
		var t2U: number = t2[0];
		var t2L: number = t2[1];

		// :: e = UINT64_C(0x3FF) << 52
		var eU: number = 0x3FF << (52 - 32);
		var eL: number = 0;

		// :: s = t2 >> 12
		var a1: number = 12;
		var m1: number = 0xFFFFFFFF >>> (32 - a1);
		var sU: number = t2U >>> a1;
		var sL: number = (t2L >>> a1) | ((t2U & m1) << (32 - a1));

		// :: x = e | s
		var xU: number = eU | sU;
		var xL: number = eL | sL;

		// :: double d = *((double *)&x)
		RandX._CONVERTION_BUFFER.setUint32(0, xU, false);
		RandX._CONVERTION_BUFFER.setUint32(4, xL, false);
		var d: number = RandX._CONVERTION_BUFFER.getFloat64(0, false);

		// :: d - 1
		return d - 1;
	}
}


