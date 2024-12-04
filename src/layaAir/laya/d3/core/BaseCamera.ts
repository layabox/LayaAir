import { Node } from "../../display/Node";
import { Event } from "../../events/Event";
import { Config3D } from "../../../Config3D";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { UniformBufferParamsType, UnifromBufferData } from "../../RenderEngine/UniformBufferData";
import { Scene3D } from "./scene/Scene3D";
import { Sprite3D } from "./Sprite3D";
import { UniformBufferObject } from "../../RenderEngine/UniformBufferObject";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { ILaya } from "../../../ILaya";
import { Color } from "../../maths/Color";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDataType, ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { IRenderEngine } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderEngine";
import { CommandUniformMap } from "../../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";
import { SkyRenderElement } from "./render/SkyRenderElement";

/**
 * @en The `BaseCamera` class is used to create the parent class of cameras.
 * @zh `BaseCamera` 类用于创建摄像机的父类。
 */
export class BaseCamera extends Sprite3D {
    /**
     * @internal
     * @en CameraUniformBlock Map
     * @zh 相机UniformBlock映射
     */
    static cameraUniformMap: CommandUniformMap;
    /**Camera Uniform PropertyID */
    /**@internal */
    static CAMERAPOS: number;
    /**@internal */
    static VIEWMATRIX: number;
    /**@internal */
    static PROJECTMATRIX: number;
    /**@internal */
    static VIEWPROJECTMATRIX: number;
    /**@internal */
    static CAMERADIRECTION: number;
    /**@internal */
    static CAMERAUP: number;
    /**@internal */
    static VIEWPORT: number;
    /**@internal */
    static PROJECTION_PARAMS: number;
    /**@internal */
    static OPAQUETEXTURE: number
    /**@internal */
    static OPAQUETEXTUREPARAMS: number;
    /**@internal */
    static DEPTHTEXTURE: number;
    /**@internal */
    static DEPTHNORMALSTEXTURE: number;
    /**@internal */
    static DEPTHZBUFFERPARAMS: number;
    /**@internal */
    static CAMERAUNIFORMBLOCK: number;
    /**Camera Define*/
    /**@internal */
    static SHADERDEFINE_DEPTH: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_DEPTHNORMALS: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_ORTHOGRAPHIC: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_FXAA: ShaderDefine;
    /**@internal */
    static RENDERINGTYPE_SHADERDEFINE_FXAA: string = "FXAA";
    /**渲染模式,延迟光照渲染，暂未开放。*/
    static RENDERINGTYPE_DEFERREDLIGHTING: string = "DEFERREDLIGHTING";
    /**
     * @en Rendering mode: Forward rendering.
     * @zh 渲染模式：前向渲染。
     */
    static RENDERINGTYPE_FORWARDRENDERING: string = "FORWARDRENDERING";
    /**@internal */
    protected static _invertYScaleMatrix: Matrix4x4 = new Matrix4x4(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);//Matrix4x4.createScaling(new Vector3(1, -1, 1), _invertYScaleMatrix);
    /**@internal */
    protected static _invertYProjectionMatrix: Matrix4x4 = new Matrix4x4();
    /**@internal */
    protected static _invertYProjectionViewMatrix: Matrix4x4 = new Matrix4x4();

    /**@internal */
    static CameraUBOData: UnifromBufferData;
    /**
     * @internal
     * @en Initialize shader information
     * @zh 初始化着色器信息
     */
    static shaderValueInit() {
        BaseCamera.SHADERDEFINE_DEPTH = Shader3D.getDefineByName("DEPTHMAP");
        BaseCamera.SHADERDEFINE_DEPTHNORMALS = Shader3D.getDefineByName("DEPTHNORMALSMAP");
        BaseCamera.SHADERDEFINE_ORTHOGRAPHIC = Shader3D.getDefineByName("CAMERAORTHOGRAPHIC");
        BaseCamera.SHADERDEFINE_FXAA = Shader3D.getDefineByName("FXAA");
        let camerauniformMap = BaseCamera.cameraUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseCamera");

        BaseCamera.CAMERAPOS = Shader3D.propertyNameToID("u_CameraPos");
        BaseCamera.VIEWMATRIX = Shader3D.propertyNameToID("u_View");
        BaseCamera.VIEWPROJECTMATRIX = Shader3D.propertyNameToID("u_ViewProjection");
        BaseCamera.PROJECTMATRIX = Shader3D.propertyNameToID("u_Projection");
        BaseCamera.CAMERADIRECTION = Shader3D.propertyNameToID("u_CameraDirection");
        BaseCamera.CAMERAUP = Shader3D.propertyNameToID("u_CameraUp");
        BaseCamera.VIEWPORT = Shader3D.propertyNameToID("u_Viewport");
        BaseCamera.PROJECTION_PARAMS = Shader3D.propertyNameToID("u_ProjectionParams");
        BaseCamera.DEPTHTEXTURE = Shader3D.propertyNameToID("u_CameraDepthTexture");
        BaseCamera.DEPTHNORMALSTEXTURE = Shader3D.propertyNameToID("u_CameraDepthNormalsTexture");
        BaseCamera.OPAQUETEXTURE = Shader3D.propertyNameToID("u_CameraOpaqueTexture");
        BaseCamera.OPAQUETEXTUREPARAMS = Shader3D.propertyNameToID("u_OpaqueTextureParams");
        BaseCamera.DEPTHZBUFFERPARAMS = Shader3D.propertyNameToID("u_ZBufferParams");
        BaseCamera.CAMERAUNIFORMBLOCK = Shader3D.propertyNameToID(UniformBufferObject.UBONAME_CAMERA);
        if (Config3D._uniformBlock) {
            camerauniformMap.addShaderBlockUniform(BaseCamera.CAMERAUNIFORMBLOCK, UniformBufferObject.UBONAME_CAMERA, [
                {
                    id: BaseCamera.VIEWMATRIX,
                    propertyName: "u_View",
                    uniformtype: ShaderDataType.Matrix4x4
                },
                {
                    id: BaseCamera.PROJECTMATRIX,
                    propertyName: "u_Projection",
                    uniformtype: ShaderDataType.Matrix4x4
                },
                {
                    id: BaseCamera.VIEWPROJECTMATRIX,
                    propertyName: "u_ViewProjection",
                    uniformtype: ShaderDataType.Matrix4x4
                },

                {
                    id: BaseCamera.PROJECTION_PARAMS,
                    propertyName: "u_ProjectionParams",
                    uniformtype: ShaderDataType.Vector4
                },
                {
                    id: BaseCamera.VIEWPORT,
                    propertyName: "u_Viewport",
                    uniformtype: ShaderDataType.Vector4
                },
                {
                    id: BaseCamera.CAMERADIRECTION,
                    propertyName: "u_CameraDirection",
                    uniformtype: ShaderDataType.Vector3
                },
                {
                    id: BaseCamera.CAMERAUP,
                    propertyName: "u_CameraUp",
                    uniformtype: ShaderDataType.Vector3
                },
                {
                    id: BaseCamera.CAMERAPOS,
                    propertyName: "u_CameraPos",
                    uniformtype: ShaderDataType.Vector3
                }
            ]);
        } else {
            camerauniformMap.addShaderUniform(BaseCamera.CAMERAPOS, "u_CameraPos", ShaderDataType.Vector3);
            camerauniformMap.addShaderUniform(BaseCamera.VIEWMATRIX, "u_View", ShaderDataType.Matrix4x4);
            camerauniformMap.addShaderUniform(BaseCamera.PROJECTMATRIX, "u_Projection", ShaderDataType.Matrix4x4);
            camerauniformMap.addShaderUniform(BaseCamera.VIEWPROJECTMATRIX, "u_ViewProjection", ShaderDataType.Matrix4x4);
            camerauniformMap.addShaderUniform(BaseCamera.CAMERADIRECTION, "u_CameraDirection", ShaderDataType.Vector3);
            camerauniformMap.addShaderUniform(BaseCamera.CAMERAUP, "u_CameraUp", ShaderDataType.Vector3);
            camerauniformMap.addShaderUniform(BaseCamera.VIEWPORT, "u_Viewport", ShaderDataType.Vector4);
            camerauniformMap.addShaderUniform(BaseCamera.PROJECTION_PARAMS, "u_ProjectionParams", ShaderDataType.Vector4);
        }
        camerauniformMap.addShaderUniform(BaseCamera.DEPTHTEXTURE, "u_CameraDepthTexture", ShaderDataType.Texture2D);
        camerauniformMap.addShaderUniform(BaseCamera.DEPTHNORMALSTEXTURE, "u_CameraDepthNormalsTexture", ShaderDataType.Texture2D);
        camerauniformMap.addShaderUniform(BaseCamera.OPAQUETEXTURE, "u_CameraOpaqueTexture", ShaderDataType.Texture2D);
        camerauniformMap.addShaderUniform(BaseCamera.OPAQUETEXTUREPARAMS, "u_OpaqueTextureParams", ShaderDataType.Vector4);
        camerauniformMap.addShaderUniform(BaseCamera.DEPTHZBUFFERPARAMS, "u_ZBufferParams", ShaderDataType.Vector4);
    }

    /**
     * @internal
     * @en Create BaseCamera UniformBuffer
     * @returns {UnifromBufferData} The created UniformBufferData for the camera
     * @zh 创建BaseCamera的UniformBuffer
     * @returns {UnifromBufferData} 为相机创建的UniformBufferData
     */
    static createCameraUniformBlock() {
        if (!BaseCamera.CameraUBOData) {
            let uniformPara: Map<string, UniformBufferParamsType> = new Map<string, UniformBufferParamsType>();
            uniformPara.set("u_View", UniformBufferParamsType.Matrix4x4);
            uniformPara.set("u_Projection", UniformBufferParamsType.Matrix4x4);
            uniformPara.set("u_ViewProjection", UniformBufferParamsType.Matrix4x4);
            uniformPara.set("u_ProjectionParams", UniformBufferParamsType.Vector4);
            uniformPara.set("u_Viewport", UniformBufferParamsType.Vector4);
            uniformPara.set("u_CameraDirection", UniformBufferParamsType.Vector3);
            uniformPara.set("u_CameraUp", UniformBufferParamsType.Vector3);
            uniformPara.set("u_CameraPos", UniformBufferParamsType.Vector3);

            let uniformMap = new Map<number, UniformBufferParamsType>();
            uniformPara.forEach((value, key) => {
                uniformMap.set(Shader3D.propertyNameToID(key), value);
            })
            BaseCamera.CameraUBOData = new UnifromBufferData(uniformMap);
        }

        return BaseCamera.CameraUBOData;
    }
    /**
     * @en Initialize the Camera
     * @zh 初始化相机
     */
    static __init__() {
        BaseCamera.shaderValueInit();
    }

    /**
     * @internal
     * @en Rendering order.
     * @zh 渲染顺序。
     */
    _renderingOrder: number
    /** @internal */
    _cameraUniformData: UnifromBufferData;
    /** @internal */
    _cameraUniformUBO: UniformBufferObject;
    /**
     * @en Near clipping plane.
     * @zh 近裁剪面。
     */
    protected _nearPlane: number;
    /**
     * @en Far clipping plane.
     * @zh 远裁剪面。
     */
    protected _farPlane: number;
    /**
     * @en Render engine.
     * @zh 渲染引擎。
     */
    protected _renderEngine: IRenderEngine;
    /**
     * @internal
     * @en The opening height at the farthest point of the camera.
     * @zh 相机最远处的开合高度。
     */
    private _yrange: number;
    /**
     * @en Field of view.
     * @zh 视野。
     */
    protected _fieldOfView: number;
    /**
     * @en Vertical size of orthographic projection.
     * @zh 正交投影的垂直尺寸。
     */
    private _orthographicVerticalSize: number;

    private _skyRenderElement: SkyRenderElement;

    /**
     * @en Forward vector.
     * @zh 前向量。
     */
    _forward: Vector3 = new Vector3();
    /**
     * @en Up vector.
     * @zh 上向量。
     */
    _up: Vector3 = new Vector3();
    /**
     * @en Whether the camera uses orthographic projection.
     * @zh 是否使用正交投影。
     */
    protected _orthographic: boolean;
    /**
     * @internal
     * @en Whether to use a user-defined projection matrix. If a user projection matrix is used, changes to camera projection-related parameters will not affect the projection matrix value. The ResetProjectionMatrix method needs to be called to update it.
     * @zh 是否使用用户自定义投影矩阵。如果使用了用户投影矩阵，摄像机投影矩阵相关的参数改变则不改变投影矩阵的值，需调用ResetProjectionMatrix方法来更新。
     */
    protected _useUserProjectionMatrix: boolean;

    /**
     * @internal
     * @en Shader data.
     * @zh 着色器数据。
     */
    _shaderValues: ShaderData;

    /** @internal */
    _linearClearColor: Color;
    /**
     * @en The clear color of the camera. The default color is CornflowerBlue.
     * @zh 摄像机的清除颜色。默认颜色为CornflowerBlue。
     */
    private _clearColor: Color;
    public get clearColor(): Color {
        return this._clearColor;
    }
    public set clearColor(value: Color) {
        this._clearColor = value;
        value.toLinear(this._linearClearColor);
    }
    /**
     * @en The culling mask value for visible layers, supporting mixed values. For example, cullingMask = Math.pow(2,0) | Math.pow(2,1) means layers 0 and 1 are visible.
     * @zh 可视层位标记遮罩值,支持混合 例:cullingMask=Math.pow(2,0)|Math.pow(2,1)为第0层和第1层可见。
     */
    private _cullingMask: number;

    /**
     * @internal
     * @en Static mask
     * @zh 静态遮罩
     */
    staticMask: number;

    /**
     * @en Whether to use occlusion culling during rendering.
     * @zh 渲染时是否使用遮挡剔除。
     */
    useOcclusionCulling: boolean;

    /**
     * @en Sky renderer element.
     * @zh 天空渲染器。
     */
    get skyRenderElement(): SkyRenderElement {
        return this._skyRenderElement;
    }

    /**
     * @en Field of view.
     * @zh 视野。
     */
    get fieldOfView(): number {
        return this._fieldOfView;
    }

    set fieldOfView(value: number) {
        this._fieldOfView = value;
        this._calculateProjectionMatrix();
        this._caculateMaxLocalYRange();
    }

    /**
     * @en Maximum local distance.
     * @zh 最大本地距离。
     */
    get maxlocalYDistance(): number {
        return this._yrange;
    }

    /**
     * @en Near clipping plane.
     * @zh 近裁剪面。
     */
    get nearPlane(): number {
        return this._nearPlane;
    }

    set nearPlane(value: number) {
        this._nearPlane = value;
        this._calculateProjectionMatrix();
    }

    /**
     * @en Far clipping plane.
     * @zh 远裁剪面。
     */
    get farPlane(): number {
        return this._farPlane;
    }

    set farPlane(vaule: number) {
        this._farPlane = vaule;
        this._calculateProjectionMatrix();
        this._caculateMaxLocalYRange();
    }

    /**
     * @en Whether to use orthographic projection matrix.
     * @zh 是否使用正交投影矩阵。
     */
    get orthographic(): boolean {
        return this._orthographic;
    }

    set orthographic(vaule: boolean) {
        this._orthographic = vaule;
        this._calculateProjectionMatrix();
        if (vaule) {
            this._shaderValues.addDefine(BaseCamera.SHADERDEFINE_ORTHOGRAPHIC);
        } else
            this._shaderValues.removeDefine(BaseCamera.SHADERDEFINE_ORTHOGRAPHIC);
    }

    /**
     * @en Vertical size of the orthographic projection.
     * @zh 正交投影的垂直尺寸。
     */
    get orthographicVerticalSize(): number {
        return this._orthographicVerticalSize;
    }

    set orthographicVerticalSize(vaule: number) {
        this._orthographicVerticalSize = vaule;
        this._calculateProjectionMatrix();
    }

    /**
     * @en Culling mask.
     * @zh 剔除遮罩。
     */
    get cullingMask() {
        return this._cullingMask;
    }

    set cullingMask(value: number) {
        this._cullingMask = value;
    }

    /**
     * @en Rendering order.
     * @zh 渲染顺序。
     */
    get renderingOrder(): number {
        return this._renderingOrder;
    }

    set renderingOrder(value: number) {
        this._renderingOrder = value;
        this._sortCamerasByRenderingOrder();
    }

    /**
     * @en Constructor function.
     * @param nearPlane The near clipping plane. Default value is 0.3.
     * @param farPlane The far clipping plane. Default value is 1000.
     * @zh 构造函数。
     * @param nearPlane 近裁剪面。默认值为 0.3。
     * @param farPlane 远裁剪面。默认值为 1000。
     */
    constructor(nearPlane: number = 0.3, farPlane: number = 1000) {
        super();
        this._shaderValues = LayaGL.renderDeviceFactory.createShaderData(null);

        this._linearClearColor = new Color();
        this.clearColor = new Color(100 / 255, 149 / 255, 237 / 255, 255 / 255);

        this._fieldOfView = 60;
        this._useUserProjectionMatrix = false;


        this._orthographicVerticalSize = 10;
        this.renderingOrder = 0;

        this._nearPlane = nearPlane;
        this._farPlane = farPlane;

        this.cullingMask = 2147483647/*int.MAX_VALUE*/;
        this.staticMask = 0xffffffff;
        this.useOcclusionCulling = true;
        this._renderEngine = LayaGL.renderEngine;
        this._orthographic = false;
        if (Config3D._uniformBlock) {
            this._cameraUniformUBO = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_CAMERA, 0);
            this._cameraUniformData = BaseCamera.createCameraUniformBlock();
            if (!this._cameraUniformUBO) {
                this._cameraUniformUBO = UniformBufferObject.create(UniformBufferObject.UBONAME_CAMERA, BufferUsage.Dynamic, this._cameraUniformData.getbyteLength(), false);
            }
            this._shaderValues._addCheckUBO(UniformBufferObject.UBONAME_CAMERA, this._cameraUniformUBO, this._cameraUniformData);
            this._shaderValues.setUniformBuffer(BaseCamera.CAMERAUNIFORMBLOCK, this._cameraUniformUBO);
        }

        this._skyRenderElement = new SkyRenderElement();
    }

    private _caculateMaxLocalYRange() {
        let halffield = 3.1416 * this.fieldOfView / 180.0 / 2;
        let dist = this.farPlane;
        this._yrange = Math.tan(halffield) * dist * 2;
    }

    /**
     * @internal
     */
    protected _calculateProjectionMatrix(): void {
    }

    /**
     * @internal
     */
    protected _onScreenSizeChanged(): void {
        this._calculateProjectionMatrix();
    }

    /**
     * @internal
     */
    protected _create(): Node {
        return new BaseCamera();
    }

    /**
     * @internal
     * @en Sort cameras by their RenderingOrder property.
     * @zh 通过 RenderingOrder 属性对摄像机进行排序。
     */
    _sortCamerasByRenderingOrder(): void {
        if (this.displayedInStage) {
            var cameraPool: BaseCamera[] = this.scene._cameraPool;//TODO:可优化，从队列中移除再加入
            var n: number = cameraPool.length - 1;
            for (var i: number = 0; i < n; i++) {
                if (cameraPool[i].renderingOrder > cameraPool[n].renderingOrder) {
                    var tempCamera: BaseCamera = cameraPool[i];
                    cameraPool[i] = cameraPool[n];
                    cameraPool[n] = tempCamera;
                }
            }
        }
    }

    /**
     * @internal
     */
    _prepareCameraToRender(): void {
        //var cameraSV: ShaderData = this._shaderValues;
        this.transform.getForward(this._forward);
        this.transform.getUp(this._up);
        this._shaderValues.setVector3(BaseCamera.CAMERAPOS, this.transform.position);
        this._shaderValues.setVector3(BaseCamera.CAMERADIRECTION, this._forward);
        this._shaderValues.setVector3(BaseCamera.CAMERAUP, this._up);
    }

    // /**
    //  * @internal
    //  */
    // _setShaderValue(index: number, value: any) {
    // 	if (this._cameraUniformData && this._cameraUniformData._has(index))
    // 		this._cameraUniformData._setData(index, value);
    // 	this._shaderValues.setValueData(index, value);
    // }

    // /**
    //  * @internal
    //  */
    // _getShaderValue(index: number): any {
    // 	return this._shaderValues.getValueData(index);
    // }


    /**
     * @en Camera rendering.
     * @param scene The scene to render.
     * @zh 相机渲染。
     * @param scene 要渲染的场景。
     */
    render(scene: Scene3D): void {
    }

    /**
     * @en Add a visible layer, layer value ranges from 0 to 31.
     * @param layer The layer to add.
     * @zh 增加可视图层，layer值为0到31层。
     * @param layer 要添加的图层。
     */
    addLayer(layer: number): void {
        this.cullingMask |= Math.pow(2, layer);
    }

    /**
     * @en Remove a visible layer, layer value ranges from 0 to 31.
     * @param layer The layer to remove.
     * @zh 移除可视图层，layer值为0到31层。
     * @param layer 要移除的图层。
     */
    removeLayer(layer: number): void {
        this.cullingMask &= ~Math.pow(2, layer);
    }

    /**
     * @en Add all layers.
     * @zh 增加所有图层。
     */
    addAllLayers(): void {
        this.cullingMask = 2147483647/*int.MAX_VALUE*/;
    }

    /**
     * @en Remove all layers.
     * @zh 移除所有图层。
     */
    removeAllLayers(): void {
        this.cullingMask = 0;
    }

    /**
     * @en Recalculate the projection matrix.
     * @zh 重新计算投影矩阵。
     */
    resetProjectionMatrix(): void {
        this._useUserProjectionMatrix = false;
        this._calculateProjectionMatrix();
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onActive(): void {
        ((<Scene3D>this._scene))._addCamera(this);
        super._onActive();
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onInActive(): void {
        ((<Scene3D>this._scene))._removeCamera(this);
        super._onInActive();
    }

    /**
     * @inheritDoc
     * @override
     * @en Destroy the camera.
     * @param destroyChild Whether to destroy child nodes.
     * @zh 销毁相机。
     * @param destroyChild 是否销毁子节点。
     */
    destroy(destroyChild: boolean = true): void {
        //postProcess = null;
        //AmbientLight = null;
        this._skyRenderElement.destroy();
        this._skyRenderElement = null;

        ILaya.stage.off(Event.RESIZE, this, this._onScreenSizeChanged);
        super.destroy(destroyChild);
    }
}

