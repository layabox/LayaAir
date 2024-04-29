import { IClone } from "../../../../utils/IClone";

//兼容WGSL
/**
 * <code>GradientDataInt</code> 类用于创建整形渐变。
 */
export class GradientDataInt implements IClone {
    private _currentLength: number = 0;
    /**@internal 开发者禁止修改。*/
    _elements: Float32Array;//TODO:是否用int

    /**整形渐变数量。*/
    get gradientCount(): number {
        return this._currentLength / 4;
    }

    /**
     * 创建一个 <code>GradientDataInt</code> 实例。
     */
    constructor() {
        this._elements = new Float32Array(16);
    }

    /**
     * 增加整形渐变。
     * @param	key 生命周期，范围为0到1。
     * @param	value 整形值。
     */
    add(key: number, value: number): void {
        if (this._currentLength < 16) {
            if ((this._currentLength === 12) && ((key !== 1))) {
                key = 1;
                console.log("Warning: the fourth key is forced set to 1");
            }
            this._elements[this._currentLength++] = key;
            this._elements[this._currentLength++] = value;
            this._elements[this._currentLength++] = 0;
            this._elements[this._currentLength++] = 0;
        } else {
            console.log("Warning: warning: data count must be not bigger than 4");
        }
    }

    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        var destGradientDataInt: GradientDataInt = <GradientDataInt>destObject;
        destGradientDataInt._currentLength = this._currentLength;
        var destElements: Float32Array = destGradientDataInt._elements;
        for (var i: number = 0, n: number = this._elements.length; i < n; i++) {
            destElements[i] = this._elements[i];
        }
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var destGradientDataInt: GradientDataInt = new GradientDataInt();
        this.cloneTo(destGradientDataInt);
        return destGradientDataInt;
    }
}