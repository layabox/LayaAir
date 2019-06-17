import { Matrix4x4 } from "../math/Matrix4x4";
import { Ray } from "../math/Ray";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Viewport } from "../math/Viewport";
/**
 * <code>Picker</code> 类用于创建拾取。
 */
export declare class Picker {
    private static _tempVector30;
    private static _tempVector31;
    private static _tempVector32;
    private static _tempVector33;
    private static _tempVector34;
    /**
     * 创建一个 <code>Picker</code> 实例。
     */
    constructor();
    /**
     * 计算鼠标生成的射线。
     * @param	point 鼠标位置。
     * @param	viewPort 视口。
     * @param	projectionMatrix 透视投影矩阵。
     * @param	viewMatrix 视图矩阵。
     * @param	world 世界偏移矩阵。
     * @return  out  输出射线。
     */
    static calculateCursorRay(point: Vector2, viewPort: Viewport, projectionMatrix: Matrix4x4, viewMatrix: Matrix4x4, world: Matrix4x4, out: Ray): void;
    /**
     * 计算射线和三角形碰撞并返回碰撞距离。
     * @param	ray 射线。
     * @param	vertex1 顶点1。
     * @param	vertex2 顶点2。
     * @param	vertex3 顶点3。
     * @return   射线距离三角形的距离，返回Number.NaN则不相交。
     */
    static rayIntersectsTriangle(ray: Ray, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3): number;
}
