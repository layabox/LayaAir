import { IClone } from "../core/IClone";
/**
 * <code>Vector2</code> 类用于创建二维向量。
 */
export declare class Vector2 implements IClone {
    /**零向量,禁止修改*/
    static ZERO: Vector2;
    /**一向量,禁止修改*/
    static ONE: Vector2;
    /**X轴坐标*/
    x: number;
    /**Y轴坐标*/
    y: number;
    /**
     * 创建一个 <code>Vector2</code> 实例。
     * @param	x  X轴坐标。
     * @param	y  Y轴坐标。
     */
    constructor(x?: number, y?: number);
    /**
     * 设置xy值。
     * @param	x X值。
     * @param	y Y值。
     */
    setValue(x: number, y: number): void;
    /**
     * 缩放二维向量。
     * @param	a 源二维向量。
     * @param	b 缩放值。
     * @param	out 输出二维向量。
     */
    static scale(a: Vector2, b: number, out: Vector2): void;
    /**
     * 从Array数组拷贝值。
     * @param  array 数组。
     * @param  offset 数组偏移。
     */
    fromArray(array: any[], offset?: number): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 求两个二维向量的点积。
     * @param	a left向量。
     * @param	b right向量。
     * @return   点积。
     */
    static dot(a: Vector2, b: Vector2): number;
    /**
     * 归一化二维向量。
     * @param	s 源三维向量。
     * @param	out 输出三维向量。
     */
    static normalize(s: Vector2, out: Vector2): void;
    /**
     * 计算标量长度。
     * @param	a 源三维向量。
     * @return 标量长度。
     */
    static scalarLength(a: Vector2): number;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
    forNativeElement(nativeElements?: Float32Array): void;
    static rewriteNumProperty(proto: any, name: string, index: number): void;
}
