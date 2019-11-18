/**
 * 二阶球谐函数。
 */
export class SphericalHarmonicsL2 {
    /** @internal */
    static _default: SphericalHarmonicsL2 = new SphericalHarmonicsL2();

    /** @internal */
    private _coefficients: Float32Array = new Float32Array(27);

    /**
     * 获取颜色通道的系数。
     * @param i 通道索引，范围0到2。
     * @param j 系数索引，范围0到8。
     */
    getCoefficient(i: number, j: number): number {
        return this._coefficients[i * 3 + j];
    }

    /**
     * 设置颜色通道的系数。
     * @param i 通道索引，范围0到2。
     * @param j 系数索引，范围0到8。
     */
    setCoefficient(i: number, j: number, coefficient: number): void {
        this._coefficients[i * 3 + j] = coefficient;
    }
}