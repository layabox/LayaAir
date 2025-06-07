/**
 * 伪随机数生成器
 * 使用线性同余法(LCG)实现
 */
export class PseudoRandom {
    private seed: number;
    private readonly m: number = 2147483647; // 2^31 - 1
    private readonly a: number = 16807;      // 7^5
    private readonly c: number = 0;          // 增量

    constructor(seed: number = Date.now()) {
        this.seed = seed;
        console.log("seed", seed);
    }

    /**
     * 生成[0,1)范围内的随机数
     */
    public random(): number {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed / this.m;
    }

    /**
     * 生成[min,max)范围内的随机数
     */
    public range(min: number, max: number): number {
        return min + this.random() * (max - min);
    }

    /**
     * 生成[0,max)范围内的随机整数
     */
    public int(max: number): number {
        return Math.floor(this.random() * max);
    }

    /**
     * 生成[min,max)范围内的随机整数
     */
    public intRange(min: number, max: number): number {
        return Math.floor(this.range(min, max));
    }
} 