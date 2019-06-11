import { Sprite3D } from "././Sprite3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector4 } from "../math/Vector4";
import { SkyRenderer } from "../resource/models/SkyRenderer";
import { Shader3D } from "../shader/Shader3D";
import { ShaderData } from "../shader/ShaderData";
import { Node } from "laya/display/Node";
/**
 * <code>BaseCamera</code> 类用于创建摄像机的父类。
 */
export declare class BaseCamera extends Sprite3D {
    /** @private */
    private static _tempMatrix4x40;
    static CAMERAPOS: number;
    static VIEWMATRIX: number;
    static PROJECTMATRIX: number;
    static VIEWPROJECTMATRIX: number;
    static VPMATRIX_NO_TRANSLATE: number;
    static CAMERADIRECTION: number;
    static CAMERAUP: number;
    /**渲染模式,延迟光照渲染，暂未开放。*/
    static RENDERINGTYPE_DEFERREDLIGHTING: string;
    /**渲染模式,前向渲染。*/
    static RENDERINGTYPE_FORWARDRENDERING: string;
    /**清除标记，固定颜色。*/
    static CLEARFLAG_SOLIDCOLOR: number;
    /**清除标记，天空。*/
    static CLEARFLAG_SKY: number;
    /**清除标记，仅深度。*/
    static CLEARFLAG_DEPTHONLY: number;
    /**清除标记，不清除。*/
    static CLEARFLAG_NONE: number;
    /** @private */
    protected static _invertYScaleMatrix: Matrix4x4;
    /** @private */
    protected static _invertYProjectionMatrix: Matrix4x4;
    /** @private */
    protected static _invertYProjectionViewMatrix: Matrix4x4;
    /** @private 渲染顺序。*/
    _renderingOrder: number;
    /**@private 近裁剪面。*/
    private _nearPlane;
    /**@private 远裁剪面。*/
    private _farPlane;
    /**@private 视野。*/
    private _fieldOfView;
    /**@private 正交投影的垂直尺寸。*/
    private _orthographicVerticalSize;
    /**@private */
    private _skyRenderer;
    /**@private */
    private _forward;
    /**@private */
    private _up;
    /**@private */
    protected _orthographic: boolean;
    /**@private 是否使用用户自定义投影矩阵，如果使用了用户投影矩阵，摄像机投影矩阵相关的参数改变则不改变投影矩阵的值，需调用ResetProjectionMatrix方法。*/
    protected _useUserProjectionMatrix: boolean;
    /** @private */
    _shaderValues: ShaderData;
    /**清楚标记。*/
    clearFlag: number;
    /**摄像机的清除颜色,默认颜色为CornflowerBlue。*/
    clearColor: Vector4;
    /** 可视层位标记遮罩值,支持混合 例:cullingMask=Math.pow(2,0)|Math.pow(2,1)为第0层和第1层可见。*/
    cullingMask: number;
    /** 渲染时是否用遮挡剔除。 */
    useOcclusionCulling: boolean;
    /**
     * 获取天空渲染器。
     * @return 天空渲染器。
     */
    readonly skyRenderer: SkyRenderer;
    /**
     * 获取视野。
     * @return 视野。
     */
    /**
    * 设置视野。
    * @param value 视野。
    */
    fieldOfView: number;
    /**
     * 获取近裁面。
     * @return 近裁面。
     */
    /**
    * 设置近裁面。
    * @param value 近裁面。
    */
    nearPlane: number;
    /**
     * 获取远裁面。
     * @return 远裁面。
     */
    /**
    * 设置远裁面。
    * @param value 远裁面。
    */
    farPlane: number;
    /**
     * 获取是否正交投影矩阵。
     * @return 是否正交投影矩阵。
     */
    /**
    * 设置是否正交投影矩阵。
    * @param 是否正交投影矩阵。
    */
    orthographic: boolean;
    /**
     * 获取正交投影垂直矩阵尺寸。
     * @return 正交投影垂直矩阵尺寸。
     */
    /**
    * 设置正交投影垂直矩阵尺寸。
    * @param 正交投影垂直矩阵尺寸。
    */
    orthographicVerticalSize: number;
    renderingOrder: number;
    /**
     * 创建一个 <code>BaseCamera</code> 实例。
     * @param	fieldOfView 视野。
     * @param	nearPlane 近裁面。
     * @param	farPlane 远裁面。
     */
    constructor(nearPlane?: number, farPlane?: number);
    /**
     * 通过RenderingOrder属性对摄像机机型排序。
     */
    _sortCamerasByRenderingOrder(): void;
    /**
     * @private
     */
    protected _calculateProjectionMatrix(): void;
    /**
     * @private
     */
    protected _onScreenSizeChanged(): void;
    /**
     * @private
     */
    _prepareCameraToRender(): void;
    /**
     * @private
     */
    _prepareCameraViewProject(vieMat: Matrix4x4, proMat: Matrix4x4, viewProject: Matrix4x4, vieProNoTraSca: Matrix4x4): void;
    /**
     * 相机渲染。
     * @param	shader 着色器。
     * @param   replacementTag 着色器替换标记。
     */
    render(shader?: Shader3D, replacementTag?: string): void;
    /**
     * 增加可视图层,layer值为0到31层。
     * @param layer 图层。
     */
    addLayer(layer: number): void;
    /**
     * 移除可视图层,layer值为0到31层。
     * @param layer 图层。
     */
    removeLayer(layer: number): void;
    /**
     * 增加所有图层。
     */
    addAllLayers(): void;
    /**
     * 移除所有图层。
     */
    removeAllLayers(): void;
    resetProjectionMatrix(): void;
    /**
     * @inheritDoc
     */
    protected _onActive(): void;
    /**
     * @inheritDoc
     */
    protected _onInActive(): void;
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * @inheritDoc
     */
    destroy(destroyChild?: boolean): void;
    /**
     * @private
     */
    protected _create(): Node;
}
