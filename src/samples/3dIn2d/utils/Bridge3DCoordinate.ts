import { ILaya } from "../../../layaAir/ILaya";
import { RenderState2D } from "../../../layaAir/laya/webgl/utils/RenderState2D";
import { Vector3 } from "../../../layaAir/laya/maths/Vector3";
import { Camera } from "../../../layaAir/laya/d3/core/Camera";

/**
 * Bridge3D坐标转换工具类
 * 处理2D逻辑坐标与3D世界坐标之间的转换
 *
 * @remarks
 * LayaAir的坐标系统：
 * - Stage逻辑坐标：stage.width × stage.height（用户设置的逻辑尺寸）
 * - Canvas渲染坐标：RenderState2D.width × RenderState2D.height（实际渲染尺寸，可能经过缩放）
 * - 3D世界坐标：与Canvas渲染坐标对齐
 *
 * 当stage被缩放时（如适配不同屏幕），逻辑坐标与渲染坐标会不一致，需要转换。
 */
export class Bridge3DCoordinate {
    /**
     * 将2D逻辑坐标转换为3D世界坐标
     * @param x - 2D逻辑X坐标（相对于stage）
     * @param y - 2D逻辑Y坐标（相对于stage）
     * @param z - 3D世界Z坐标（默认0）
     * @param out - 输出向量（可选，不提供则创建新向量）
     * @returns 3D世界坐标
     *
     * @example
     * ```typescript
     * // Bridge3D在2D逻辑坐标(400, 300)
     * const worldPos = Bridge3DCoordinate.logicTo3D(400, 300, 0);
     * // worldPos现在是3D世界坐标，考虑了stage缩放
     * ```
     */
    static logicTo3D(x: number, y: number, z: number = 0, out?: Vector3): Vector3 {
        if (!out) {
            out = new Vector3();
        }

        const stage = ILaya.stage;
        const scaleX = stage.scaleX;
        const scaleY = stage.scaleY;

        // 2D逻辑坐标 → Canvas渲染坐标（3D世界坐标）
        out.x = x * scaleX;
        out.y = y * scaleY;
        out.z = z;

        return out;
    }

    /**
     * 将3D世界坐标转换为2D逻辑坐标
     * @param worldPos - 3D世界坐标
     * @param outX - 输出2D逻辑X坐标的数组（可选）
     * @param outY - 输出2D逻辑Y坐标的数组（可选）
     * @returns {x: number, y: number} 2D逻辑坐标
     *
     * @example
     * ```typescript
     * const worldPos = new Vector3(800, 600, 0);
     * const logicPos = Bridge3DCoordinate.worldTo2D(worldPos);
     * // logicPos.x, logicPos.y 是2D逻辑坐标
     * ```
     */
    static worldTo2D(worldPos: Vector3): { x: number, y: number } {
        const stage = ILaya.stage;
        const scaleX = stage.scaleX;
        const scaleY = stage.scaleY;

        // 3D世界坐标（Canvas渲染坐标） → 2D逻辑坐标
        return {
            x: worldPos.x / scaleX,
            y: worldPos.y / scaleY
        };
    }

    /**
     * 获取当前的坐标缩放比例
     * @returns {scaleX: number, scaleY: number} X和Y方向的缩放比例
     *
     * @remarks
     * - scaleX = RenderState2D.width / stage.width
     * - scaleY = RenderState2D.height / stage.height
     * - 当stage适配屏幕时，这些值可能不为1
     */
    static getScale(): { scaleX: number, scaleY: number } {
        const stage = ILaya.stage;
        return {
            scaleX: stage.scaleX,
            scaleY: stage.scaleY
        };
    }

    /**
     * 获取当前的渲染尺寸信息
     * @returns 包含逻辑尺寸、渲染尺寸和缩放比例的对象
     */
    static getRenderInfo(): {
        logicWidth: number,
        logicHeight: number,
        renderWidth: number,
        renderHeight: number,
        scaleX: number,
        scaleY: number
    } {
        const stage = ILaya.stage;
        return {
            logicWidth: stage.width,
            logicHeight: stage.height,
            renderWidth: RenderState2D.width,
            renderHeight: RenderState2D.height,
            scaleX: stage.scaleX,
            scaleY: stage.scaleY
        };
    }

    /**
     * 将2D屏幕坐标转换为3D世界坐标（考虑相机投影）
     * @param screenX - 屏幕X坐标（像素）
     * @param screenY - 屏幕Y坐标（像素）
     * @param camera - Bridge3D相机
     * @param depth - 深度值（默认0，表示Z=0平面）
     * @param out - 输出向量（可选）
     * @returns 3D世界坐标
     *
     * @remarks
     * 此方法用于将鼠标点击等屏幕坐标转换为3D世界坐标
     */
    static screenTo3D(screenX: number, screenY: number, camera: Camera, depth: number = 0, out?: Vector3): Vector3 {
        if (!out) {
            out = new Vector3();
        }

        // 屏幕坐标 → NDC坐标
        const renderWidth = RenderState2D.width;
        const renderHeight = RenderState2D.height;
        const ndcX = (screenX / renderWidth) * 2 - 1;
        const ndcY = 1 - (screenY / renderHeight) * 2;  // Y轴翻转

        // 对于正交投影，直接计算世界坐标
        if (camera.orthographic) {
            const halfHeight = camera.orthographicVerticalSize * 0.5;
            const halfWidth = halfHeight * camera.aspectRatio;

            // NDC → View Space
            const viewX = ndcX * halfWidth;
            const viewY = ndcY * halfHeight;

            // View Space → World Space（需要相机的变换矩阵）
            const camPos = camera.transform.position;
            out.x = camPos.x + viewX;
            out.y = camPos.y + viewY;
            out.z = depth;
        }

        return out;
    }

    /**
     * 调试输出当前坐标系统信息
     */
    static debugInfo(): void {
        const info = Bridge3DCoordinate.getRenderInfo();
        console.log("=== Bridge3D Coordinate System Info ===");
        console.log(`Logic Size: ${info.logicWidth} × ${info.logicHeight}`);
        console.log(`Render Size: ${info.renderWidth} × ${info.renderHeight}`);
        console.log(`Scale: ${info.scaleX.toFixed(3)} × ${info.scaleY.toFixed(3)}`);
        console.log("=======================================");
    }
}
