import { EventDispatcher } from "../../events/EventDispatcher";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Sprite3D } from "./Sprite3D";
/**
 * <code>Transform3D</code> 类用于实现3D变换。
 */
export declare class Transform3D extends EventDispatcher {
    /**
     * 获取所属精灵。
     */
    readonly owner: Sprite3D;
    /**
     * 获取世界矩阵是否需要更新。
     * @return	世界矩阵是否需要更新。
     */
    readonly worldNeedUpdate: boolean;
    /**
     * 获取局部位置X轴分量。
     * @return	局部位置X轴分量。
     */
    /**
    * 设置局部位置X轴分量。
    * @param x	局部位置X轴分量。
    */
    localPositionX: number;
    /**
     * 获取局部位置Y轴分量。
     * @return	局部位置Y轴分量。
     */
    /**
    * 设置局部位置Y轴分量。
    * @param y	局部位置Y轴分量。
    */
    localPositionY: number;
    /**
     * 获取局部位置Z轴分量。
     * @return	局部位置Z轴分量。
     */
    /**
    * 设置局部位置Z轴分量。
    * @param z	局部位置Z轴分量。
    */
    localPositionZ: number;
    /**
     * 获取局部位置。
     * @return	局部位置。
     */
    /**
    * 设置局部位置。
    * @param value	局部位置。
    */
    localPosition: Vector3;
    /**
     * 获取局部旋转四元数X分量。
     * @return	局部旋转四元数X分量。
     */
    /**
    * 设置局部旋转四元数X分量。
    * @param x	局部旋转四元数X分量。
    */
    localRotationX: number;
    /**
     * 获取局部旋转四元数Y分量。
     * @return	局部旋转四元数Y分量。
     */
    /**
    * 设置局部旋转四元数Y分量。
    * @param y	局部旋转四元数Y分量。
    */
    localRotationY: number;
    /**
     * 获取局部旋转四元数Z分量。
     * @return	局部旋转四元数Z分量。
     */
    /**
    * 设置局部旋转四元数Z分量。
    * @param z	局部旋转四元数Z分量。
    */
    localRotationZ: number;
    /**
     * 获取局部旋转四元数W分量。
     * @return	局部旋转四元数W分量。
     */
    /**
    * 设置局部旋转四元数W分量。
    * @param w	局部旋转四元数W分量。
    */
    localRotationW: number;
    /**
     * 获取局部旋转。
     * @return	局部旋转。
     */
    /**
    * 设置局部旋转。
    * @param value	局部旋转。
    */
    localRotation: Quaternion;
    /**
     * 获取局部缩放X。
     * @return	局部缩放X。
     */
    /**
    * 设置局部缩放X。
    * @param	value 局部缩放X。
    */
    localScaleX: number;
    /**
     * 获取局部缩放Y。
     * @return	局部缩放Y。
     */
    /**
    * 设置局部缩放Y。
    * @param	value 局部缩放Y。
    */
    localScaleY: number;
    /**
     * 获取局部缩放Z。
     * @return	局部缩放Z。
     */
    /**
    * 设置局部缩放Z。
    * @param	value 局部缩放Z。
    */
    localScaleZ: number;
    /**
     * 获取局部缩放。
     * @return	局部缩放。
     */
    /**
    * 设置局部缩放。
    * @param	value 局部缩放。
    */
    localScale: Vector3;
    /**
     * 获取局部空间的X轴欧拉角。
     * @return	局部空间的X轴欧拉角。
     */
    /**
    * 设置局部空间的X轴欧拉角。
    * @param	value 局部空间的X轴欧拉角。
    */
    localRotationEulerX: number;
    /**
     * 获取局部空间的Y轴欧拉角。
     * @return	局部空间的Y轴欧拉角。
     */
    /**
    * 设置局部空间的Y轴欧拉角。
    * @param	value 局部空间的Y轴欧拉角。
    */
    localRotationEulerY: number;
    /**
     * 获取局部空间的Z轴欧拉角。
     * @return	局部空间的Z轴欧拉角。
     */
    /**
    * 设置局部空间的Z轴欧拉角。
    * @param	value 局部空间的Z轴欧拉角。
    */
    localRotationEulerZ: number;
    /**
     * 获取局部空间欧拉角。
     * @return	欧拉角的旋转值。
     */
    /**
    * 设置局部空间的欧拉角。
    * @param	value 欧拉角的旋转值。
    */
    localRotationEuler: Vector3;
    /**
     * 获取局部矩阵。
     * @return	局部矩阵。
     */
    /**
    * 设置局部矩阵。
    * @param value	局部矩阵。
    */
    localMatrix: Matrix4x4;
    /**
     * 获取世界位置。
     * @return	世界位置。
     */
    /**
    * 设置世界位置。
    * @param	value 世界位置。
    */
    position: Vector3;
    /**
     * 获取世界旋转。
     * @return	世界旋转。
     */
    /**
    * 设置世界旋转。
    * @param value	世界旋转。
    */
    rotation: Quaternion;
    /**
     * 获取世界缩放。
     * @return	世界缩放。
     */
    /**
    * 设置世界缩放。
    * @param value	世界缩放。
    */
    scale: Vector3;
    /**
     * 获取世界空间的旋转角度。
     * @return	欧拉角的旋转值，顺序为x、y、z。
     */
    /**
    * 设置世界空间的旋转角度。
    * @param	欧拉角的旋转值，顺序为x、y、z。
    */
    rotationEuler: Vector3;
    /**
     * 获取世界矩阵。
     * @return	世界矩阵。
     */
    /**
    * 设置世界矩阵。
    * @param	value 世界矩阵。
    */
    worldMatrix: Matrix4x4;
    /**
     * 创建一个 <code>Transform3D</code> 实例。
     * @param owner 所属精灵。
     */
    constructor(owner: Sprite3D);
    /**
     * 平移变换。
     * @param 	translation 移动距离。
     * @param 	isLocal 是否局部空间。
     */
    translate(translation: Vector3, isLocal?: boolean): void;
    /**
     * 旋转变换。
     * @param 	rotations 旋转幅度。
     * @param 	isLocal 是否局部空间。
     * @param 	isRadian 是否弧度制。
     */
    rotate(rotation: Vector3, isLocal?: boolean, isRadian?: boolean): void;
    /**
     * 获取向前方向。
     * @param 前方向。
     */
    getForward(forward: Vector3): void;
    /**
     * 获取向上方向。
     * @param 上方向。
     */
    getUp(up: Vector3): void;
    /**
     * 获取向右方向。
     * @param 右方向。
     */
    getRight(right: Vector3): void;
    /**
     * 观察目标位置。
     * @param	target 观察目标。
     * @param	up 向上向量。
     * @param	isLocal 是否局部空间。
     */
    lookAt(target: Vector3, up: Vector3, isLocal?: boolean): void;
}
