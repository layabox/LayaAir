/**
     * <code>Rand</code> 类用于通过128位整型种子创建随机数,算法来自:https://github.com/AndreasMadsen/xorshift。
     */
export class RandX {
    /**
     * 创建一个 <code>Rand</code> 实例。
     * @param	seed  随机种子。
     */
    constructor(seed) {
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
    randomint() {
        // uint64_t s1 = s[0]
        var s1U = this._state0U, s1L = this._state0L;
        // uint64_t s0 = s[1]
        var s0U = this._state1U, s0L = this._state1L;
        // result = s0 + s1
        var sumL = (s0L >>> 0) + (s1L >>> 0);
        var resU = (s0U + s1U + (sumL / 2 >>> 31)) >>> 0;
        var resL = sumL >>> 0;
        // s[0] = s0
        this._state0U = s0U;
        this._state0L = s0L;
        // - t1 = [0, 0]
        var t1U = 0, t1L = 0;
        // - t2 = [0, 0]
        var t2U = 0, t2L = 0;
        // s1 ^= s1 << 23;
        // :: t1 = s1 << 23
        var a1 = 23;
        var m1 = 0xFFFFFFFF << (32 - a1);
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
        var a2 = 18;
        var m2 = 0xFFFFFFFF >>> (32 - a2);
        t2U = s1U >>> a2;
        t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
        // :: t1 = t1 ^ t2
        t1U = t1U ^ t2U;
        t1L = t1L ^ t2L;
        // :: t2 = s0 >> 5
        var a3 = 5;
        var m3 = 0xFFFFFFFF >>> (32 - a3);
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
    random() {
        // :: t2 = randomint()
        var t2 = this.randomint();
        var t2U = t2[0];
        var t2L = t2[1];
        // :: e = UINT64_C(0x3FF) << 52
        var eU = 0x3FF << (52 - 32);
        var eL = 0;
        // :: s = t2 >> 12
        var a1 = 12;
        var m1 = 0xFFFFFFFF >>> (32 - a1);
        var sU = t2U >>> a1;
        var sL = (t2L >>> a1) | ((t2U & m1) << (32 - a1));
        // :: x = e | s
        var xU = eU | sU;
        var xL = eL | sL;
        // :: double d = *((double *)&x)
        RandX._CONVERTION_BUFFER.setUint32(0, xU, false);
        RandX._CONVERTION_BUFFER.setUint32(4, xL, false);
        var d = RandX._CONVERTION_BUFFER.getFloat64(0, false);
        // :: d - 1
        return d - 1;
    }
}
/**@internal */
RandX._CONVERTION_BUFFER = new DataView(new ArrayBuffer(8));
/**基于时间种子的随机数。*/
RandX.defaultRand = new RandX([0, Date.now() / 65536, 0, Date.now() % 65536]);
