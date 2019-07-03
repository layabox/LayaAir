import { Vector4 } from "./Vector4";
import { Quaternion } from "./Quaternion";
import { Matrix4x4 } from "./Matrix4x4";
import { IClone } from "../core/IClone";
/**
 * <code>Vector3</code> 类用于创建三维向量。
 */
export declare class Vector3 implements IClone {
    /**
     * 两个三维向量距离的平方。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离的平方。
     */
    static distanceSquared(value1: Vector3, value2: Vector3): number;
    /**
     * 两个三维向量距离。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离。
     */
    static distance(value1: Vector3, value2: Vector3): number;
    /**
     * 分别取两个三维向量x、y、z的最小值计算新的三维向量。
     * @param	a。
     * @param	b。
     * @param	out。
     */
    static min(a: Vector3, b: Vector3, out: Vector3): void;
    /**
     * 分别取两个三维向量x、y、z的最大值计算新的三维向量。
     * @param	a a三维向量。
     * @param	b b三维向量。
     * @param	out 结果三维向量。
     */
    static max(a: Vector3, b: Vector3, out: Vector3): void;
    /**
     * 根据四元数旋转三维向量。
     * @param	source 源三维向量。
     * @param	rotation 旋转四元数。
     * @param	out 输出三维向量。
     */
    static transformQuat(source: Vector3, rotation: Quaternion, out: Vector3): void;
    /**
     * 计算标量长度。
     * @param	a 源三维向量。
     * @return 标量长度。
     */
    static scalarLength(a: Vector3): number;
    /**
     * 计算标量长度的平方。
     * @param	a 源三维向量。
     * @return 标量长度的平方。
     */
    static scalarLengthSquared(a: Vector3): number;
    /**
     * 归一化三维向量。
     * @param	s 源三维向量。
     * @param	out 输出三维向量。
     */
    static normalize(s: Vector3, out: Vector3): void;
    /**
     * 计算两个三维向量的乘积。
     * @param	a left三维向量。
     * @param	b right三维向量。
     * @param	out 输出三维向量。
     */
    static multiply(a: Vector3, b: Vector3, out: Vector3): void;
    /**
     * 缩放三维向量。
     * @param	a 源三维向量。
     * @param	b 缩放值。
     * @param	out 输出三维向量。
     */
    static scale(a: Vector3, b: number, out: Vector3): void;
    /**
     * 插值三维向量。
     * @param	a left向量。
     * @param	b right向量。
     * @param	t 插值比例。
     * @param	out 输出向量。
     */
    static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): void;
    /**
     * 通过矩阵转换一个三维向量到另外一个三维向量。
     * @param	vector 源三维向量。
     * @param	transform  变换矩阵。
     * @param	result 输出三维向量。
     */
    static transformV3ToV3(vector: Vector3, transform: Matrix4x4, result: Vector3): void;
    /**
     * 通过矩阵转换一个三维向量到另外一个四维向量。
     * @param	vector 源三维向量。
     * @param	transform  变换矩阵。
     * @param	result 输出四维向量。
     */
    static transformV3ToV4(vector: Vector3, transform: Matrix4x4, result: Vector4): void;
    /**
     * 通过法线矩阵转换一个法线三维向量到另外一个三维向量。
     * @param	normal 源法线三维向量。
     * @param	transform  法线变换矩阵。
     * @param	result 输出法线三维向量。
     */
    static TransformNormal(normal: Vector3, transform: Matrix4x4, result: Vector3): void;
    /**
     * 通过矩阵转换一个三维向量到另外一个归一化的三维向量。
     * @param	vector 源三维向量。
     * @param	transform  变换矩阵。
     * @param	result 输出三维向量。
     */
    static transformCoordinate(coordinate: Vector3, transform: Matrix4x4, result: Vector3): void;
    /**
     * 求一个指定范围的向量
     * @param	value clamp向量
     * @param	min  最小
     * @param	max  最大
     * @param   out 输出向量
     */
    static Clamp(value: Vector3, min: Vector3, max: Vector3, out: Vector3): void;
    /**
     * 求两个三维向量的和。
     * @param	a left三维向量。
     * @param	b right三维向量。
     * @param	out 输出向量。
     */
    static add(a: Vector3, b: Vector3, out: Vector3): void;
    /**
     * 求两个三维向量的差。
     * @param	a  left三维向量。
     * @param	b  right三维向量。
     * @param	o out 输出向量。
     */
    static subtract(a: Vector3, b: Vector3, o: Vector3): void;
    /**
     * 求两个三维向量的叉乘。
     * @param	a left向量。
     * @param	b right向量。
     * @param	o 输出向量。
     */
    static cross(a: Vector3, b: Vector3, o: Vector3): void;
    /**
     * 求两个三维向量的点积。
     * @param	a left向量。
     * @param	b right向量。
     * @return   点积。
     */
    static dot(a: Vector3, b: Vector3): number;
    /**
     * 判断两个三维向量是否相等。
     * @param	a 三维向量。
     * @param	b 三维向量。
     * @return  是否相等。
     */
    static equals(a: Vector3, b: Vector3): boolean;
    /**X轴坐标*/
    x: number;
    /**Y轴坐标*/
    y: number;
    /**Z轴坐标*/
    z: number;
    /**
     * 创建一个 <code>Vector3</code> 实例。
     * @param	x  X轴坐标。
     * @param	y  Y轴坐标。
     * @param	z  Z轴坐标。
     */
    constructor(x?: number, y?: number, z?: number, nativeElements?: Float32Array);
    /**
     * 设置xyz值。
     * @param	x X值。
     * @param	y Y值。
     * @param	z Z值。
     */
    setValue(x: number, y: number, z: number): void;
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
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
    toDefault(): void;
    forNativeElement(nativeElements?: Float32Array): void;
}
