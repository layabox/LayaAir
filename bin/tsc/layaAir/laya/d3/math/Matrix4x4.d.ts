import { Vector3 } from "././Vector3";
import { Quaternion } from "././Quaternion";
import { IClone } from "../core/IClone";
/**
 * <code>Matrix4x4</code> 类用于创建4x4矩阵。
 */
export declare class Matrix4x4 implements IClone {
    /**@private */
    private static _tempMatrix4x4;
    /**@private */
    static TEMPMatrix0: Matrix4x4;
    /**@private */
    static TEMPMatrix1: Matrix4x4;
    /**@private */
    private static _tempVector0;
    /**@private */
    private static _tempVector1;
    /**@private */
    private static _tempVector2;
    /**@private */
    private static _tempVector3;
    /**@private */
    private static _tempQuaternion;
    /**默认矩阵,禁止修改*/
    static DEFAULT: Matrix4x4;
    /**默认矩阵,禁止修改*/
    static ZERO: Matrix4x4;
    /**
     * 绕X轴旋转
     * @param	rad  旋转角度
     * @param	out 输出矩阵
     */
    static createRotationX(rad: number, out: Matrix4x4): void;
    /**
     *
     * 绕Y轴旋转
     * @param	rad  旋转角度
     * @param	out 输出矩阵
     */
    static createRotationY(rad: number, out: Matrix4x4): void;
    /**
     * 绕Z轴旋转
     * @param	rad  旋转角度
     * @param	out 输出矩阵
     */
    static createRotationZ(rad: number, out: Matrix4x4): void;
    /**
     * 通过yaw pitch roll旋转创建旋转矩阵。
     * @param	yaw
     * @param	pitch
     * @param	roll
     * @param	result
     */
    static createRotationYawPitchRoll(yaw: number, pitch: number, roll: number, result: Matrix4x4): void;
    /**
     * 通过旋转轴axis和旋转角度angle计算旋转矩阵。
     * @param	axis 旋转轴,假定已经归一化。
     * @param	angle 旋转角度。
     * @param	result 结果矩阵。
     */
    static createRotationAxis(axis: Vector3, angle: number, result: Matrix4x4): void;
    setRotation(rotation: Quaternion): void;
    setPosition(position: Vector3): void;
    /**
     * 通过四元数创建旋转矩阵。
     * @param	rotation 旋转四元数。
     * @param	result 输出旋转矩阵
     */
    static createRotationQuaternion(rotation: Quaternion, result: Matrix4x4): void;
    /**
     * 根据平移计算输出矩阵
     * @param	trans  平移向量
     * @param	out 输出矩阵
     */
    static createTranslate(trans: Vector3, out: Matrix4x4): void;
    /**
     * 根据缩放计算输出矩阵
     * @param	scale  缩放值
     * @param	out 输出矩阵
     */
    static createScaling(scale: Vector3, out: Matrix4x4): void;
    /**
     * 计算两个矩阵的乘法
     * @param	left left矩阵
     * @param	right  right矩阵
     * @param	out  输出矩阵
     */
    static multiply(left: Matrix4x4, right: Matrix4x4, out: Matrix4x4): void;
    static multiplyForNative(left: Matrix4x4, right: Matrix4x4, out: Matrix4x4): void;
    /**
     * 从四元数计算旋转矩阵
     * @param	rotation 四元数
     * @param	out 输出矩阵
     */
    static createFromQuaternion(rotation: Quaternion, out: Matrix4x4): void;
    /**
     * 计算仿射矩阵
     * @param	trans 平移
     * @param	rot 旋转
     * @param	scale 缩放
     * @param	out 输出矩阵
     */
    static createAffineTransformation(trans: Vector3, rot: Quaternion, scale: Vector3, out: Matrix4x4): void;
    /**
     *  计算观察矩阵
     * @param	eye 视点位置
     * @param	center 视点目标
     * @param	up 向上向量
     * @param	out 输出矩阵
     */
    static createLookAt(eye: Vector3, target: Vector3, up: Vector3, out: Matrix4x4): void;
    /**
     * 通过FOV创建透视投影矩阵。
     * @param	fov  视角。
     * @param	aspect 横纵比。
     * @param	near 近裁面。
     * @param	far 远裁面。
     * @param	out 输出矩阵。
     */
    static createPerspective(fov: number, aspect: number, znear: number, zfar: number, out: Matrix4x4): void;
    /**
     * 创建透视投影矩阵。
     * @param	left 视椎左边界。
     * @param	right 视椎右边界。
     * @param	bottom 视椎底边界。
     * @param	top 视椎顶边界。
     * @param	znear 视椎近边界。
     * @param	zfar 视椎远边界。
     * @param	out 输出矩阵。
     */
    static createPerspectiveOffCenter(left: number, right: number, bottom: number, top: number, znear: number, zfar: number, out: Matrix4x4): void;
    /**
     * 计算正交投影矩阵。
     * @param	left 视椎左边界。
     * @param	right 视椎右边界。
     * @param	bottom 视椎底边界。
     * @param	top 视椎顶边界。
     * @param	near 视椎近边界。
     * @param	far 视椎远边界。
     * @param	out 输出矩阵。
     */
    static createOrthoOffCenter(left: number, right: number, bottom: number, top: number, znear: number, zfar: number, out: Matrix4x4): void;
    /**矩阵元素数组*/
    elements: Float32Array;
    /**
     * 创建一个 <code>Matrix4x4</code> 实例。
     * @param	4x4矩阵的各元素
     */
    constructor(m11?: number, m12?: number, m13?: number, m14?: number, m21?: number, m22?: number, m23?: number, m24?: number, m31?: number, m32?: number, m33?: number, m34?: number, m41?: number, m42?: number, m43?: number, m44?: number, elements?: Float32Array);
    getElementByRowColumn(row: number, column: number): number;
    setElementByRowColumn(row: number, column: number, value: number): void;
    /**
     * 判断两个4x4矩阵的值是否相等。
     * @param	other 4x4矩阵
     */
    equalsOtherMatrix(other: Matrix4x4): boolean;
    /**
     * 分解矩阵为平移向量、旋转四元数、缩放向量。
     * @param	translation 平移向量。
     * @param	rotation 旋转四元数。
     * @param	scale 缩放向量。
     * @return 是否分解成功。
     */
    decomposeTransRotScale(translation: Vector3, rotation: Quaternion, scale: Vector3): boolean;
    /**
     * 分解矩阵为平移向量、旋转矩阵、缩放向量。
     * @param	translation 平移向量。
     * @param	rotationMatrix 旋转矩阵。
     * @param	scale 缩放向量。
     * @return 是否分解成功。
     */
    decomposeTransRotMatScale(translation: Vector3, rotationMatrix: Matrix4x4, scale: Vector3): boolean;
    /**
     * 分解旋转矩阵的旋转为YawPitchRoll欧拉角。
     * @param	out float yaw
     * @param	out float pitch
     * @param	out float roll
     * @return
     */
    decomposeYawPitchRoll(yawPitchRoll: Vector3): void;
    /**归一化矩阵 */
    normalize(): void;
    /**计算矩阵的转置矩阵*/
    transpose(): Matrix4x4;
    /**
     * 计算一个矩阵的逆矩阵
     * @param	out 输出矩阵
     */
    invert(out: Matrix4x4): void;
    /**
     * 计算BlillBoard矩阵
     * @param	objectPosition 物体位置
     * @param	cameraPosition 相机位置
     * @param	cameraUp       相机上向量
     * @param	cameraForward  相机前向量
     * @param	mat            变换矩阵
     */
    static billboard(objectPosition: Vector3, cameraPosition: Vector3, cameraRight: Vector3, cameraUp: Vector3, cameraForward: Vector3, mat: Matrix4x4): void;
    /**设置矩阵为单位矩阵*/
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
    static translation(v3: Vector3, out: Matrix4x4): void;
    /**
     * 获取平移向量。
     * @param	out 平移向量。
     */
    getTranslationVector(out: Vector3): void;
    /**
     * 设置平移向量。
     * @param	translate 平移向量。
     */
    setTranslationVector(translate: Vector3): void;
    /**
     * 获取前向量。
     * @param	out 前向量。
     */
    getForward(out: Vector3): void;
    /**
     * 设置前向量。
     * @param	forward 前向量。
     */
    setForward(forward: Vector3): void;
}
