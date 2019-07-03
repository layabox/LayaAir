import { PostProcess } from "../component/PostProcess";
import { BoundFrustum } from "../math/BoundFrustum";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Ray } from "../math/Ray";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Viewport } from "../math/Viewport";
import { RenderTexture } from "../resource/RenderTexture";
import { Shader3D } from "../shader/Shader3D";
import { BaseCamera } from "./BaseCamera";
import { CommandBuffer } from "./render/command/CommandBuffer";
/**
 * <code>Camera</code> 类用于创建摄像机。
 */
export declare class Camera extends BaseCamera {
    private _aspectRatio;
    private _viewport;
    private _normalizedViewport;
    private _viewMatrix;
    private _projectionMatrix;
    private _projectionViewMatrix;
    private _boundFrustum;
    private _updateViewMatrix;
    private _postProcess;
    private _enableHDR;
    /**是否允许渲染。*/
    enableRender: boolean;
    /**
     * 获取横纵比。
     * @return 横纵比。
     */
    /**
    * 设置横纵比。
    * @param value 横纵比。
    */
    aspectRatio: number;
    /**
     * 获取屏幕像素坐标的视口。
     * @return 屏幕像素坐标的视口。
     */
    /**
    * 设置屏幕像素坐标的视口。
    * @param 屏幕像素坐标的视口。
    */
    viewport: Viewport;
    /**
     * 获取裁剪空间的视口。
     * @return 裁剪空间的视口。
     */
    /**
    * 设置裁剪空间的视口。
    * @return 裁剪空间的视口。
    */
    normalizedViewport: Viewport;
    /**
     * 获取视图矩阵。
     * @return 视图矩阵。
     */
    readonly viewMatrix: Matrix4x4;
    /**获取投影矩阵。*/
    /**设置投影矩阵。*/
    projectionMatrix: Matrix4x4;
    /**
     * 获取视图投影矩阵。
     * @return 视图投影矩阵。
     */
    readonly projectionViewMatrix: Matrix4x4;
    /**
     * 获取摄像机视锥。
     */
    readonly boundFrustum: BoundFrustum;
    /**
     * 获取自定义渲染场景的渲染目标。
     * @return 自定义渲染场景的渲染目标。
     */
    /**
    * 设置自定义渲染场景的渲染目标。
    * @param value 自定义渲染场景的渲染目标。
    */
    renderTarget: RenderTexture;
    /**
     * 获取后期处理。
     * @return 后期处理。
     */
    /**
    * 设置后期处理。
    * @param value 后期处理。
    */
    postProcess: PostProcess;
    /**
     * 获取是否开启HDR。
     */
    /**
    * 设置是否开启HDR。
    */
    enableHDR: boolean;
    /**
     * 创建一个 <code>Camera</code> 实例。
     * @param	aspectRatio 横纵比。
     * @param	nearPlane 近裁面。
     * @param	farPlane 远裁面。
     */
    constructor(aspectRatio?: number, nearPlane?: number, farPlane?: number);
    /**
     *	通过蒙版值获取蒙版是否显示。
     * 	@param  layer 层。
     * 	@return 是否显示。
     */
    _isLayerVisible(layer: number): boolean;
    private _calculationViewport;
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * @inheritDoc
     */
    protected _calculateProjectionMatrix(): void;
    /**
     * @inheritDoc
     */
    render(shader?: Shader3D, replacementTag?: string): void;
    /**
     * 计算从屏幕空间生成的射线。
     * @param	point 屏幕空间的位置位置。
     * @return  out  输出射线。
     */
    viewportPointToRay(point: Vector2, out: Ray): void;
    /**
     * 计算从裁切空间生成的射线。
     * @param	point 裁切空间的位置。。
     * @return  out  输出射线。
     */
    normalizedViewportPointToRay(point: Vector2, out: Ray): void;
    /**
     * 计算从世界空间准换三维坐标到屏幕空间。
     * @param	position 世界空间的位置。
     * @return  out  输出位置。
     */
    worldToViewportPoint(position: Vector3, out: Vector3): void;
    /**
     * 计算从世界空间准换三维坐标到裁切空间。
     * @param	position 世界空间的位置。
     * @return  out  输出位置。
     */
    worldToNormalizedViewportPoint(position: Vector3, out: Vector3): void;
    /**
     * 转换2D屏幕坐标系统到3D正交投影下的坐标系统，注:只有正交模型下有效。
     * @param   source 源坐标。
     * @param   out 输出坐标。
     * @return 是否转换成功。
     */
    convertScreenCoordToOrthographicCoord(source: Vector3, out: Vector3): boolean;
    /**
     * @inheritDoc
     */
    destroy(destroyChild?: boolean): void;
    /**
     * 在特定渲染管线阶段添加指令缓存。
     */
    addCommandBuffer(event: number, commandBuffer: CommandBuffer): void;
    /**
     * 在特定渲染管线阶段移除指令缓存。
     */
    removeCommandBuffer(event: number, commandBuffer: CommandBuffer): void;
    /**
     * 在特定渲染管线阶段移除所有指令缓存。
     */
    removeCommandBuffers(event: number): void;
}
