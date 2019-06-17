import { Vector3 } from "././Vector3";
import { Vector2 } from "././Vector2";
import { Matrix4x4 } from "././Matrix4x4";
import { IClone } from "../core/IClone";
/**
 * <code>Matrix3x3</code> 类用于创建3x3矩阵。
 */
export declare class Matrix3x3 implements IClone {
    /**默认矩阵,禁止修改*/
    static DEFAULT: Matrix3x3;
    /** @private */
    private static _tempV30;
    /** @private */
    private static _tempV31;
    /** @private */
    private static _tempV32;
    /**
     * 根据指定平移生成3x3矩阵
     * @param	tra 平移
     * @param	out 输出矩阵
     */
    static createFromTranslation(trans: Vector2, out: Matrix3x3): void;
    /**
     * 根据指定旋转生成3x3矩阵
     * @param	rad  旋转值
     * @param	out 输出矩阵
     */
    static createFromRotation(rad: number, out: Matrix3x3): void;
    /**
     * 根据制定缩放生成3x3矩阵
     * @param	scale 缩放值
     * @param	out 输出矩阵
     */
    static createFromScaling(scale: Vector2, out: Matrix3x3): void;
    /**
     * 从4x4矩阵转换为一个3x3的矩阵（原则为upper-left,忽略第四行四列）
     * @param	sou 4x4源矩阵
     * @param	out 3x3输出矩阵
     */
    static createFromMatrix4x4(sou: Matrix4x4, out: Matrix3x3): void;
    /**
     *  两个3x3矩阵的相乘
     * @param	left 左矩阵
     * @param	right  右矩阵
     * @param	out  输出矩阵
     */
    static multiply(left: Matrix3x3, right: Matrix3x3, out: Matrix3x3): void;
    /**矩阵元素数组*/
    elements: Float32Array;
    /**
     * 创建一个 <code>Matrix3x3</code> 实例。
     */
    constructor();
    /**
     * 计算3x3矩阵的行列式
     * @return    矩阵的行列式
     */
    determinant(): number;
    /**
     * 通过一个二维向量转换3x3矩阵
     * @param	tra 转换向量
     * @param	out 输出矩阵
     */
    translate(trans: Vector2, out: Matrix3x3): void;
    /**
     * 根据指定角度旋转3x3矩阵
     * @param	rad 旋转角度
     * @param	out 输出矩阵
     */
    rotate(rad: number, out: Matrix3x3): void;
    /**
     *根据制定缩放3x3矩阵
     * @param	scale 缩放值
     * @param	out 输出矩阵
     */
    scale(scale: Vector2, out: Matrix3x3): void;
    /**
     * 计算3x3矩阵的逆矩阵
     * @param	out 输出的逆矩阵
     */
    invert(out: Matrix3x3): void;
    /**
     * 计算3x3矩阵的转置矩阵
     * @param 	out 输出矩阵
     */
    transpose(out: Matrix3x3): void;
    /** 设置已有的矩阵为单位矩阵*/
    identity(): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
    /**
     * 计算观察3x3矩阵
     * @param	eye    观察者位置
     * @param	target 目标位置
     * @param	up     上向量
     * @param	out    输出3x3矩阵
     */
    static lookAt(eye: Vector3, target: Vector3, up: Vector3, out: Matrix3x3): void;
}
