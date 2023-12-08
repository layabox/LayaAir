
import { Config3D } from "../../../Config3D";
import { ILaya3D } from "../../../ILaya3D";
import { Node } from "../../display/Node";
import { Event } from "../../events/Event";
import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "../../resource/BaseTexture";
import { PostProcess } from "../component/PostProcess";
import { DepthPass, DepthTextureMode } from "../depthMap/DepthPass";
import { Cluster } from "../graphics/renderPath/Cluster";
import { BoundFrustum } from "../math/BoundFrustum";
import { Ray } from "../math/Ray";
import { Viewport } from "../math/Viewport";
import { Picker } from "../utils/Picker";
import { BaseCamera } from "./BaseCamera";
import { DirectionLightCom } from "./light/DirectionLightCom";
import { ShadowMode } from "./light/ShadowMode";
import { ShadowUtils } from "./light/ShadowUtils";
import { BlitScreenQuadCMD } from "./render/command/BlitScreenQuadCMD";
import { CommandBuffer } from "./render/command/CommandBuffer";
import { RenderContext3D } from "./render/RenderContext3D";
import { Scene3D } from "./scene/Scene3D";
import { Scene3DShaderDeclaration } from "./scene/Scene3DShaderDeclaration";
import { Transform3D } from "./Transform3D";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ILaya } from "../../../ILaya";
import { ShadowLightType } from "../shadowMap/ShadowLightType";
import { TextureCube } from "../../resource/TextureCube";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "../../resource/Texture2D";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { RenderTexture } from "../../resource/RenderTexture";
import { Stat } from "../../utils/Stat";

/**
 * 相机清除标记。
 */
export enum CameraClearFlags {
    /**固定颜色。*/
    SolidColor,
    /**天空。*/
    Sky,
    /**仅深度。*/
    DepthOnly,
    /**不清除。*/
    Nothing,
    /**只清理颜色 */
    ColorOnly,
}

/**
 * 相机事件标记
 */
export enum CameraEventFlags {
    //BeforeDepthTexture,
    //AfterDepthTexture,
    //BeforeDepthNormalsTexture,
    //AfterDepthNormalTexture,
    /**在渲染非透明物体之前。*/
    BeforeForwardOpaque = 0,
    /**在渲染天空盒之前。*/
    BeforeSkyBox = 2,
    /**在渲染透明物体之前。*/
    BeforeTransparent = 4,
    /**在后期处理之前。*/
    BeforeImageEffect = 6,
    /**所有渲染之后。*/
    AfterEveryThing = 8,
}

/**
 * <code>Camera</code> 类用于创建摄像机。
 */
export class Camera extends BaseCamera {
    /** @internal */
    static _tempVector20: Vector2 = new Vector2();
    /** @internal*/
    static _context3DViewPortCatch: Viewport = new Viewport(0, 0, 0, 0);
    static _contextScissorPortCatch: Vector4 = new Vector4(0, 0, 0, 0);

    /** @internal */
    static __updateMark: number = 0;
    static set _updateMark(value: number) {
        Camera.__updateMark = value;
    }

    static get _updateMark(): number {
        return Camera.__updateMark;
    }

    /** @internal 深度贴图管线*/
    static depthPass: DepthPass;

    /**
     * 根据相机、scene信息获得scene中某一位置的渲染结果
     * @param camera 相机
     * @param scene 需要渲染的场景
     * @param shader 着色器
     * @param replacementTag 替换标记。
     */
    static drawRenderTextureByScene(camera: Camera, scene: Scene3D, renderTexture: RenderTexture, shader: Shader3D = null, replaceFlag: string = null): RenderTexture {
        if (!renderTexture) return null;
        Scene3D._updateMark++;
        //@ts-ignore
        scene._prepareSceneToRender();
        scene._setCullCamera(camera);
        let recoverTexture = camera.renderTarget;
        camera.renderTarget = renderTexture;

        var viewport: Viewport = camera.viewport;
        var needInternalRT: boolean = camera._needInternalRenderTexture();
        var context: RenderContext3D = RenderContext3D._instance;
        var scene: Scene3D = context.scene = scene
        context.pipelineMode = context.configPipeLineMode;
        context.replaceTag = replaceFlag;
        context.customShader = shader;

        if (needInternalRT) {
            camera._internalRenderTexture = RenderTexture.createFromPool(viewport.width, viewport.height, camera._getRenderTextureFormat(), camera.depthTextureFormat, false, camera.msaa ? 4 : 1, false, camera._needRenderGamma(camera._getRenderTextureFormat()));
            camera._internalRenderTexture.filterMode = FilterMode.Bilinear;
        }
        else {
            camera._internalRenderTexture = null;
        }
        scene._componentDriver.callPreRender();
        var needShadowCasterPass: boolean = camera._renderShadowMap(scene, context);
        camera._preRenderMainPass(context, scene, needInternalRT, viewport);
        camera._renderMainPass(context, viewport, scene, shader, replaceFlag, needInternalRT);
        camera._aftRenderMainPass(needShadowCasterPass);
        camera.renderTarget = recoverTexture;
        scene.recaculateCullCamera();
        scene._componentDriver.callPostRender();
        if (camera._internalRenderTexture)
            (!camera._internalRenderTexture._inPool) && RenderTexture.recoverToPool(camera._internalRenderTexture);
        return renderTexture;
    }

    /**
     * get PixelTexture
     * @param texture 
     * @returns 
     */
    static getTexturePixel(texture: Texture2D): ArrayBufferView {
        let coverFilter = texture.filterMode;
        texture.filterMode = FilterMode.Point;
        let rtFormat = RenderTargetFormat.R8G8B8;
        let pixelData;
        let size = texture.width * texture.height;
        switch (texture.format) {
            case TextureFormat.R32G32B32A32:
            case TextureFormat.R16G16B16A16:
                rtFormat = RenderTargetFormat.R32G32B32A32;
                pixelData = new Float32Array(size * 4);
                break;
            case TextureFormat.R32G32B32:
            case TextureFormat.R16G16B16:
                rtFormat = RenderTargetFormat.R32G32B32;
                pixelData = new Float32Array(size * 3);
                break;
            case TextureFormat.R5G6B5:
            case TextureFormat.R8G8B8:
                rtFormat = RenderTargetFormat.R8G8B8;
                pixelData = new Uint8Array(size * 3);
                break;
            default:
                rtFormat = RenderTargetFormat.R8G8B8A8;
                pixelData = new Uint8Array(size * 4);
                break;
        }
        let rt = new RenderTexture(texture.width, texture.height, rtFormat, RenderTargetFormat.None, false, 0, false);
        var blit: BlitScreenQuadCMD = BlitScreenQuadCMD.create(texture, rt);
        blit.setContext(RenderContext3D._instance);
        blit.run();
        blit.recover();
        texture.filterMode = coverFilter;
        rt.getData(0, 0, texture.width, texture.height, pixelData);
        rt.destroy();//删除
        return pixelData;
    }

    /**
     * 根据场景中的位置
     * @param position 
     * @param scene 
     * @param renderCubeSize 
     * @param format 
     * @returns bake front left right up down
     */
    static drawTextureCubePixelByScene(camera: Camera, scene: Scene3D, renderCubeSize: number, format: TextureFormat, cullingMask: number): ArrayBufferView[] {
        let rtFormat = RenderTargetFormat.R8G8B8;
        let pixelData;
        let size = renderCubeSize * renderCubeSize;
        let bytelength;
        switch (format) {
            case TextureFormat.R32G32B32A32:
            case TextureFormat.R16G16B16A16:
                rtFormat = RenderTargetFormat.R32G32B32A32;
                size *= 4;
                bytelength = 4;
                break;
            case TextureFormat.R32G32B32:
            case TextureFormat.R16G16B16:
                rtFormat = RenderTargetFormat.R32G32B32;
                size *= 3;
                bytelength = 4;
                break;
            case TextureFormat.R5G6B5:
            case TextureFormat.R8G8B8:
                rtFormat = RenderTargetFormat.R8G8B8;
                size *= 3;
                bytelength = 1;
                break;
            case TextureFormat.R8G8B8A8:
                rtFormat = RenderTargetFormat.R8G8B8A8;
                pixelData = new Uint8Array(size * 4);
                size *= 4;
                bytelength = 1;
                break;
            default:
                throw "Type is not supported";
                break;
        }
        let rt = new RenderTexture(renderCubeSize, renderCubeSize, rtFormat, RenderTargetFormat.DEPTH_16, false, 0, false, false);
        camera.fieldOfView = 90;
        camera.cullingMask = cullingMask;
        // bake 0,1,0,0
        //front 0,0,0,1
        //left 0,0.7071068,0,0.7071068
        //right 0,0.7071068,0,-0.7071068
        //up 0,0.7071068,-0.7071068,0
        //down 0,-0.7071068,-0.7071068,0
        let pixels: ArrayBufferView[] = [];
        let quaterionArray = [
            new Quaternion(0, 1, 0, 0),
            new Quaternion(0, 0, 0, 1),
            new Quaternion(0, 0.7071068, 0, 0.7071068),
            new Quaternion(0, 0.7071068, 0, -0.7071068),
            new Quaternion(0, 0.7071068, -0.7071068, 0),
            new Quaternion(0, -0.7071068, -0.7071068, 0),
        ];
        for (var i = 0; i < 6; i++) {
            camera.transform.rotation = quaterionArray[i];
            this.drawRenderTextureByScene(camera, scene, rt);
            if (bytelength == 4)
                pixelData = new Float32Array(size);
            else
                pixelData = new Uint8Array(size);
            pixels[i] = rt.getData(0, 0, renderCubeSize, renderCubeSize, pixelData);
        }
        rt.destroy();
        return pixels;
    }

    static drawTextureCubeByScene(camera: Camera, position: Vector3, scene: Scene3D, renderCubeSize: number, format: TextureFormat, cullingMask: number = 0): TextureCube {
        camera.transform.position = position;
        let pixels = this.drawTextureCubePixelByScene(camera, scene, renderCubeSize, format, cullingMask);
        let finalformat: TextureFormat;
        switch (format) {
            case TextureFormat.R32G32B32A32:
            case TextureFormat.R16G16B16A16:
                finalformat = TextureFormat.R32G32B32A32;
                break;
            case TextureFormat.R32G32B32:
            case TextureFormat.R16G16B16:
                finalformat = TextureFormat.R32G32B32;
                break;
            case TextureFormat.R5G6B5:
            case TextureFormat.R8G8B8:
                finalformat = TextureFormat.R8G8B8;
                break;
            case TextureFormat.R8G8B8A8:
                finalformat = TextureFormat.R8G8B8A8;
                break;
            default:
                throw "Type is not supported";
        }
        let textureCube = new TextureCube(renderCubeSize, format, true, false);
        textureCube.setPixelsData(pixels, false, false);
        return textureCube;
    }

    /**
     * @internal
     */
    static __init__(): void {
        Camera.depthPass = new DepthPass();
    }


    /** @internal */
    protected _aspectRatio: number;
    /** @internal */
    protected _viewport: Viewport;
    /** @internal */
    protected _rayViewport: Viewport;
    /** @internal */
    protected _normalizedViewport: Viewport;
    /** @internal */
    protected _viewMatrix: Matrix4x4;
    /** @internal */
    protected _projectionMatrix: Matrix4x4;
    /** @internal */
    protected _projectionViewMatrix: Matrix4x4;
    /** @internal */
    protected _boundFrustum: BoundFrustum;
    /** @internal */
    private _updateViewMatrix: boolean = true;
    /** @internal */
    protected _postProcess: PostProcess = null;
    /** @internal */
    protected _enableHDR: boolean = false;
    /** @internal */
    private _viewportParams: Vector4 = new Vector4();
    /** @internal */
    private _projectionParams: Vector4 = new Vector4();
    /** @internal*/
    protected _needBuiltInRenderTexture: boolean = false;
    /**@internal */
    protected _msaa: boolean = false;
    /**@internal */
    private _fxaa: boolean = false;
    /** @internal*/
    private _depthTextureMode: DepthTextureMode;
    /** @internal */
    _offScreenRenderTexture: RenderTexture = null;
    /** @internal */
    _internalRenderTexture: RenderTexture = null;
    /** @internal　是否直接使用渲染深度贴图*/
    _canBlitDepth: boolean = false;
    /**@internal */
    _internalCommandBuffer: CommandBuffer = new CommandBuffer();
    /**深度贴图模式 */
    protected _depthTextureFormat: RenderTargetFormat = RenderTargetFormat.DEPTH_16;
    /** 深度贴图*/
    private _depthTexture: BaseTexture;
    /** 深度法线贴图*/
    private _depthNormalsTexture: RenderTexture;

    /** 非透明物体贴图 */
    private _opaqueTexture: RenderTexture;
    /** 是否开启非透明物体通道 */
    private _opaquePass: boolean;


    private _cameraEventCommandBuffer: { [key: string]: CommandBuffer[] } = {};
    /**@internal 实现CommanBuffer的阴影渲染 */
    private _shadowCasterCommanBuffer: CommandBuffer[] = [];

    /** @internal */
    _clusterXPlanes: Vector3[];
    /** @internal */
    _clusterYPlanes: Vector3[];
    /** @internal */
    _clusterPlaneCacheFlag: Vector2 = new Vector2(-1, -1);
    /** @internal */
    _screenOffsetScale: Vector4 = new Vector4();

    /**是否允许渲染。*/
    enableRender: boolean = true;
    /**清除标记。*/
    clearFlag: CameraClearFlags = CameraClearFlags.SolidColor;
    /**是否缓存上一帧的Depth纹理 */
    _cacheDepth: boolean
    /**cache 上一帧纹理 */
    _cacheDepthTexture: RenderTexture;

    /**
     * 横纵比。
     */
    get aspectRatio(): number {
        if (this._aspectRatio === 0) {
            var vp: Viewport = this.viewport;
            return vp.width / vp.height;
        }
        return this._aspectRatio;
    }

    set aspectRatio(value: number) {
        if (value < 0)
            throw new Error("Camera: the aspect ratio has to be a positive real number.");
        this._aspectRatio = value;
        this._calculateProjectionMatrix();
    }

    /**
     * 获取屏幕像素坐标的视口。
     */
    get viewport(): Viewport {//TODO:优化
        if (this._offScreenRenderTexture)
            this._calculationViewport(this._normalizedViewport, this._offScreenRenderTexture.width, this._offScreenRenderTexture.height);
        else
            this._calculationViewport(this._normalizedViewport, this.clientWidth, this.clientHeight);//屏幕尺寸会动态变化,需要重置
        return this._viewport;
    }

    set viewport(value: Viewport) {
        var width: number;
        var height: number;
        if (this._offScreenRenderTexture) {
            width = this._offScreenRenderTexture.width;
            height = this._offScreenRenderTexture.height;
        } else {
            width = this.clientWidth;
            height = this.clientHeight;
        }
        this._normalizedViewport.x = value.x / width;
        this._normalizedViewport.y = value.y / height;
        this._normalizedViewport.width = value.width / width;
        this._normalizedViewport.height = value.height / height;
        this._calculationViewport(this._normalizedViewport, width, height);
        this._calculateProjectionMatrix();
    }

    get clientWidth(): number {
        ILaya.stage.needUpdateCanvasSize();
        if (Config3D.customResolution)
            return Config3D.pixelRatio * Config3D._resoluWidth | 0;
        else
            return RenderContext3D.clientWidth * Config3D.pixelRatio | 0;
    }

    get clientHeight(): number {
        ILaya.stage.needUpdateCanvasSize();
        if (Config3D.customResolution)
            return Config3D.pixelRatio * Config3D._resoluHeight | 0;
        else
            return RenderContext3D.clientHeight * Config3D.pixelRatio | 0;
    }



    /**
     * 多重采样抗锯齿
     */
    set msaa(value: boolean) {
        LayaGL.renderEngine.getCapable(RenderCapable.MSAA) ? this._msaa = value : this._msaa = false;
    }


    get msaa(): boolean {
        return this._msaa && Stat.enablemsaa;
    }

    /**
     * 空间抗锯齿
     */
    set fxaa(value: boolean) {
        this._fxaa = value;
    }

    get fxaa(): boolean {
        return this._fxaa;
    }

    /**
     * 裁剪空间的视口。
     */
    get normalizedViewport(): Viewport {
        return this._normalizedViewport;
    }

    set normalizedViewport(value: Viewport) {
        var width: number;
        var height: number;
        if (this._offScreenRenderTexture) {
            width = this._offScreenRenderTexture.width;
            height = this._offScreenRenderTexture.height;
        } else {
            width = this.clientWidth;
            height = this.clientHeight;
        }
        if (this._normalizedViewport !== value)
            value.cloneTo(this._normalizedViewport);
        this._calculationViewport(value, width, height);
        this._calculateProjectionMatrix();
    }

    /**
     * 获取视图矩阵。
     */
    get viewMatrix(): Matrix4x4 {
        if (this._updateViewMatrix) {
            var scale: Vector3 = this.transform.getWorldLossyScale();
            var scaleX: number = scale.x;
            var scaleY: number = scale.y;
            var scaleZ: number = scale.z;
            var viewMatE: Float32Array = this._viewMatrix.elements;

            this.transform.worldMatrix.cloneTo(this._viewMatrix)
            viewMatE[0] /= scaleX;//忽略缩放
            viewMatE[1] /= scaleX;
            viewMatE[2] /= scaleX;
            viewMatE[4] /= scaleY;
            viewMatE[5] /= scaleY;
            viewMatE[6] /= scaleY;
            viewMatE[8] /= scaleZ;
            viewMatE[9] /= scaleZ;
            viewMatE[10] /= scaleZ;
            this._viewMatrix.invert(this._viewMatrix);
            this._updateViewMatrix = false;
        }
        return this._viewMatrix;
    }

    /**
     * 投影矩阵。
     */
    get projectionMatrix(): Matrix4x4 {
        return this._projectionMatrix;
    }

    set projectionMatrix(value: Matrix4x4) {
        this._projectionMatrix = value;
        this._useUserProjectionMatrix = true;
    }

    /**
     * 获取视图投影矩阵。
     */
    get projectionViewMatrix(): Matrix4x4 {
        Matrix4x4.multiply(this.projectionMatrix, this.viewMatrix, this._projectionViewMatrix);
        return this._projectionViewMatrix;
    }

    /**
     * 获取摄像机视锥。
     */
    get boundFrustum(): BoundFrustum {
        this._boundFrustum.matrix = this.projectionViewMatrix;
        return this._boundFrustum;
    }

    /**
     * 自定义渲染场景的渲染目标。
     */
    get renderTarget(): RenderTexture {
        return this._offScreenRenderTexture;
    }

    set renderTarget(value: RenderTexture) {
        var lastValue: RenderTexture = this._offScreenRenderTexture;
        if (lastValue !== value) {
            (lastValue) && (lastValue._isCameraTarget = false);
            (value) && (value._isCameraTarget = true);
            this._offScreenRenderTexture = value;
            this._calculateProjectionMatrix();
        }
    }

    /**
     * 后期处理。
     */
    get postProcess(): PostProcess {
        return this._postProcess;
    }

    set postProcess(value: PostProcess) {
        this._postProcess = value;
        //if (!value) return;
        //value && value._init(this);
    }

    /**
     * 是否开启HDR。
     * 开启后对性能有一定影响。
     */
    get enableHDR(): boolean {
        return this._enableHDR;
    }

    set enableHDR(value: boolean) {
        if (value && !LayaGL.renderEngine.getCapable(RenderCapable.RenderTextureFormat_R16G16B16A16)) {
            console.warn("Camera:can't enable HDR in this device.");
            return;
        }
        this._enableHDR = value;
    }

    /**
     * 是否使用正在渲染的RenderTexture为CommandBuffer服务，设置为true
     * 一般和CommandBuffer一起使用
     */
    get enableBuiltInRenderTexture(): boolean {
        return this._needBuiltInRenderTexture;
    }

    set enableBuiltInRenderTexture(value: boolean) {
        this._needBuiltInRenderTexture = value;
    }

    /**
     * 深度贴图模式
     */
    get depthTextureMode(): DepthTextureMode {
        return this._depthTextureMode;
    }

    set depthTextureMode(value: DepthTextureMode) {
        this._depthTextureMode = value;
    }

    /**
     * 设置OpaquePass模式
     */
    set opaquePass(value: boolean) {
        if (value == this._opaquePass)
            return;
        if (!value) {
            this._shaderValues.setTexture(BaseCamera.OPAQUETEXTURE, null);
            this._opaqueTexture && RenderTexture.recoverToPool(this._opaqueTexture);
        }
        this._opaquePass = value;
    }

    get opaquePass() {
        return this._opaquePass;
    }

    /**
     * 深度贴图格式
     */
    get depthTextureFormat(): RenderTargetFormat {
        return this._depthTextureFormat;
    }
    set depthTextureFormat(value: RenderTargetFormat) {
        this._depthTextureFormat = value;
    }


    /**
     * 设置是否使用内置的深度贴图(TODO:如果开启,只可在后期使用深度贴图，不可在渲染流程中使用)
     */
    set enableBlitDepth(value: boolean) {
        if (value == this._canBlitDepth)
            return;
        this._canBlitDepth = value;
        this._cacheDepth = value;
        this._internalRenderTexture && RenderTexture.recoverToPool(this._internalRenderTexture);
        (!this._internalRenderTexture._inPool) && (this._internalRenderTexture = RenderTexture.createFromPool(this.viewport.width, this.viewport.height, this._getRenderTextureFormat(), this.depthTextureFormat, false, this.msaa ? 4 : 1, this._canBlitDepth, this._needRenderGamma(this._getRenderTextureFormat())));
        if (!value) {
            if (this._cacheDepthTexture)
                this._cacheDepthTexture._inPool ? 0 : RenderTexture.recoverToPool(this._cacheDepthTexture);
        }

    }
    get enableBlitDepth() {
        return this._canBlitDepth;
    }
    get canblitDepth() {
        return this._canBlitDepth && this._internalRenderTexture && this._internalRenderTexture.depthStencilFormat != null;
    }

    /**
     * 创建一个 <code>Camera</code> 实例。
     * @param	aspectRatio 横纵比。
     * @param	nearPlane 近裁面。
     * @param	farPlane 远裁面。
     */
    constructor(aspectRatio: number = 0, nearPlane: number = 0.3, farPlane: number = 1000) {
        super(nearPlane, farPlane);
        this._viewMatrix = new Matrix4x4();
        this._projectionMatrix = new Matrix4x4();
        this._projectionViewMatrix = new Matrix4x4();
        this._viewport = new Viewport(0, 0, 0, 0);
        this._normalizedViewport = new Viewport(0, 0, 1, 1);
        this._rayViewport = new Viewport(0, 0, 0, 0);
        this._aspectRatio = aspectRatio;
        this._boundFrustum = new BoundFrustum(new Matrix4x4());
        this._depthTextureMode = 0;
        this._calculateProjectionMatrix();
        ILaya.stage.on(Event.RESIZE, this, this._onScreenSizeChanged);
        this.transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        this.opaquePass = false;
    }

    /**
     * @internal
     */
    private _calculationViewport(normalizedViewport: Viewport, width: number, height: number): void {
        var lx: number = normalizedViewport.x * width;//不应限制x范围
        var ly: number = normalizedViewport.y * height;//不应限制y范围
        var rx: number = lx + Math.max(normalizedViewport.width * width, 0);
        var ry: number = ly + Math.max(normalizedViewport.height * height, 0);

        var ceilLeftX: number = Math.ceil(lx);
        var ceilLeftY: number = Math.ceil(ly);
        var floorRightX: number = Math.floor(rx);
        var floorRightY: number = Math.floor(ry);

        var pixelLeftX: number = ceilLeftX - lx >= 0.5 ? Math.floor(lx) : ceilLeftX;
        var pixelLeftY: number = ceilLeftY - ly >= 0.5 ? Math.floor(ly) : ceilLeftY;
        var pixelRightX: number = rx - floorRightX >= 0.5 ? Math.ceil(rx) : floorRightX;
        var pixelRightY: number = ry - floorRightY >= 0.5 ? Math.ceil(ry) : floorRightY;

        this._viewport.x = pixelLeftX;
        this._viewport.y = pixelLeftY;
        this._viewport.width = pixelRightX - pixelLeftX;
        this._viewport.height = pixelRightY - pixelLeftY;
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    protected _calculateProjectionMatrix(): void {
        if (!this._useUserProjectionMatrix) {
            if (this._orthographic) {
                var halfHeight: number = this.orthographicVerticalSize * 0.5;
                var halfWidth: number = halfHeight * this.aspectRatio;
                Matrix4x4.createOrthoOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, this.nearPlane, this.farPlane, this._projectionMatrix);
            } else {
                Matrix4x4.createPerspective(3.1416 * this.fieldOfView / 180.0, this.aspectRatio, this.nearPlane, this.farPlane, this._projectionMatrix);
            }
        }
    }

    /**
     *	通过蒙版值获取蒙版是否显示。
     * 	@param  layer 层。
     * 	@return 是否显示。
     */
    _isLayerVisible(layer: number): boolean {
        return (Math.pow(2, layer) & this.cullingMask) != 0;
    }

    /**
     * @internal
     */
    _onTransformChanged(flag: number): void {
        flag &= Transform3D.TRANSFORM_WORLDMATRIX;//过滤有用TRANSFORM标记
        (flag) && (this._updateViewMatrix = true);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);
        var clearFlagData: any = data.clearFlag;
        (clearFlagData !== undefined) && (this.clearFlag = clearFlagData);
        var viewport: any[] = data.viewport;
        this.normalizedViewport = new Viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
        var enableHDR: boolean = data.enableHDR;
        (enableHDR !== undefined) && (this.enableHDR = enableHDR);
    }

    clone(): Camera {
        let camera = <Camera>super.clone();
        camera.clearFlag = this.clearFlag;
        this.clearColor.cloneTo(camera.clearColor);
        camera.clearColor = camera.clearColor;
        camera.viewport = this.viewport;
        this.normalizedViewport.cloneTo(camera.normalizedViewport);
        camera.enableHDR = this.enableHDR;
        camera.farPlane = this.farPlane;
        camera.nearPlane = this.nearPlane;
        camera.fieldOfView = this.fieldOfView;
        camera.orthographic = this.orthographic;
        camera._cameraEventCommandBuffer = this._cameraEventCommandBuffer;
        camera.opaquePass = this.opaquePass;
        //Object.assign(camera._cameraEventCommandBuffer, this._cameraEventCommandBuffer);
        return camera;
    }

    /**
     * @internal
     */
    _getCanvasWidth(): number {
        if (this._offScreenRenderTexture)
            return this._offScreenRenderTexture.width;
        else
            return this.clientWidth;
    }

    /**
     * @internal
     */
    _getCanvasHeight(): number {
        if (this._offScreenRenderTexture)
            return this._offScreenRenderTexture.height;
        else
            return this.clientHeight;
    }

    /**
     * @internal
     */
    _getRenderTexture(): RenderTexture {
        return this._internalRenderTexture || this._offScreenRenderTexture;
    }

    /**
     * 渲染结果是否是Gamma
     * @param rt 
     */
    _needRenderGamma(rt: RenderTargetFormat) {
        switch (rt) {
            case RenderTargetFormat.R8G8B8:
            case RenderTargetFormat.R8G8B8A8:
                return true;
            default:
                return false;
        }
    }

    /**
     * @internal
     */
    _needInternalRenderTexture(): boolean {
        return (this._postProcess && this._postProcess.enable) || this._enableHDR || this._needBuiltInRenderTexture ? true : false;//condition of internal RT
    }

    /**
     * @internal
     */
    _getRenderTextureFormat(): RenderTargetFormat {
        if (this._enableHDR)
            return RenderTargetFormat.R16G16B16A16;
        else
            return RenderTargetFormat.R8G8B8A8;
    }

    /**
     * update Camera Render
     * @param context 
     */
    _updateCameraRenderData(context: RenderContext3D) {
        this._prepareCameraToRender();
        this._applyViewProject(context, this.viewMatrix, this._projectionMatrix);
    }


    /**
     * @override
     * @internal
     */
    _prepareCameraToRender(): void {
        super._prepareCameraToRender();
        var vp: Viewport = this.viewport;
        this._viewportParams.setValue(vp.x, vp.y, vp.width, vp.height);
        this._projectionParams.setValue(this._nearPlane, this._farPlane, RenderContext3D._instance.invertY ? -1 : 1, 1 / this.farPlane);
        this._shaderValues.setVector(BaseCamera.VIEWPORT, this._viewportParams);
        this._shaderValues.setVector(BaseCamera.PROJECTION_PARAMS, this._projectionParams);
    }

    /**
     * @internal
     */
    _applyViewProject(context: RenderContext3D, viewMat: Matrix4x4, proMat: Matrix4x4): void {
        var projectView: Matrix4x4;
        if (context.invertY) {
            Matrix4x4.multiply(BaseCamera._invertYScaleMatrix, proMat, BaseCamera._invertYProjectionMatrix);
            Matrix4x4.multiply(BaseCamera._invertYProjectionMatrix, viewMat, BaseCamera._invertYProjectionViewMatrix);
            proMat = BaseCamera._invertYProjectionMatrix;
            projectView = BaseCamera._invertYProjectionViewMatrix;
        }
        else {
            Matrix4x4.multiply(proMat, viewMat, this._projectionViewMatrix);
            projectView = this._projectionViewMatrix;
        }

        context.viewMatrix = viewMat;
        context.projectionMatrix = proMat;
        context.projectionViewMatrix = projectView;
        this._shaderValues.setMatrix4x4(BaseCamera.VIEWMATRIX, viewMat);
        this._shaderValues.setMatrix4x4(BaseCamera.PROJECTMATRIX, proMat);
        this._shaderValues.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, projectView);
    }

    /**
     * @internal
     */
    _updateClusterPlaneXY(): void {
        var fieldOfView: number = this.fieldOfView;
        var aspectRatio: number = this.aspectRatio;
        if (this._clusterPlaneCacheFlag.x !== fieldOfView || this._clusterPlaneCacheFlag.y !== aspectRatio) {
            var clusterCount: Vector3 = Config3D.lightClusterCount;
            var xSlixe: number = clusterCount.x, ySlice: number = clusterCount.y;
            var xCount: number = xSlixe + 1, yCount: number = ySlice + 1;
            var xPlanes: Vector3[] = this._clusterXPlanes, yPlanes: Vector3[] = this._clusterYPlanes;

            if (!xPlanes) {
                xPlanes = this._clusterXPlanes = new Array(xCount);
                yPlanes = this._clusterYPlanes = new Array(yCount);
                for (var i: number = 0; i < xCount; i++)
                    xPlanes[i] = new Vector3();
                for (var i: number = 0; i < yCount; i++)
                    yPlanes[i] = new Vector3();
            }
            var halfY = Math.tan((this.fieldOfView / 2) * Math.PI / 180);
            var halfX = this.aspectRatio * halfY;
            var yLengthPerCluster = 2 * halfY / ySlice;
            var xLengthPerCluster = 2 * halfX / xSlixe;
            for (var i: number = 0; i < xCount; i++) {
                var angle: number = -halfX + xLengthPerCluster * i;
                var bigHypot: number = Math.sqrt(1 + angle * angle);
                var normX: number = 1 / bigHypot;
                var xPlane: Vector3 = xPlanes[i];
                xPlane.setValue(normX, 0, -angle * normX);
            }
            //start from top is more similar to light pixel data
            for (var i: number = 0; i < yCount; i++) {
                var angle: number = halfY - yLengthPerCluster * i;
                var bigHypot: number = Math.sqrt(1 + angle * angle);
                var normY: number = -1 / bigHypot;
                var yPlane: Vector3 = yPlanes[i];
                yPlane.setValue(0, normY, -angle * normY);
            }

            this._clusterPlaneCacheFlag.x = fieldOfView;
            this._clusterPlaneCacheFlag.y = aspectRatio;
        }
    }


    /**
     * 调用渲染命令流
     * @param event 
     * @param renderTarget 
     * @param context 
     */
    _applyCommandBuffer(event: number, context: RenderContext3D) {
        if (!Stat.enableCameraCMD)
            return;
        var commandBufferArray: CommandBuffer[] = this._cameraEventCommandBuffer[event];
        if (!commandBufferArray || commandBufferArray.length == 0)
            return;
        commandBufferArray.forEach(function (value) {
            value._context = context;
            value._apply();
        });
        (RenderTexture.currentActive) && (RenderTexture.currentActive._end());
        if (this._internalRenderTexture || this._offScreenRenderTexture)
            this._getRenderTexture()._start();
        else {
            LayaGL.textureContext.bindoutScreenTarget();
        }
        LayaGL.renderEngine.viewport(0, 0, context.viewport.width, context.viewport.height);
    }

    /**
     * apply 
     * @internal
     */
    _applyCasterPassCommandBuffer(context: RenderContext3D) {
        if (!this._shadowCasterCommanBuffer || this._shadowCasterCommanBuffer.length == 0)
            return;
        this._shadowCasterCommanBuffer.forEach(function (value) {
            value._context = context;
            value._apply();
        });
    }

    /**
    * @internal
    */
    _addCasterShadowCommandBuffer(commandBuffer: CommandBuffer) {
        if (this._shadowCasterCommanBuffer.indexOf(commandBuffer) < 0)
            this._shadowCasterCommanBuffer.push(commandBuffer);
    }

    /**
     * @internal
     * @param commandBuffer 
     */
    _removeCasterShadowCommandBuffer(commandBuffer: CommandBuffer) {
        var index: number = this._shadowCasterCommanBuffer.indexOf(commandBuffer);
        if (index != -1) this._shadowCasterCommanBuffer.splice(index, 1);
    }

    /**
     * 渲染阴影模式
     * @internal
     * @param scene 渲染场景
     * @param context 渲染上下文
     */
    _renderShadowMap(scene: Scene3D, context: RenderContext3D) {
        if (Scene3D._updateMark % scene._ShadowMapupdateFrequency != 0) {
            return false;
        }

        //render shadowMap
        var shadowCasterPass;
        var mainDirectLight: DirectionLightCom = scene._mainDirectionLight;
        var needShadowCasterPass: boolean = mainDirectLight && mainDirectLight.shadowMode !== ShadowMode.None && ShadowUtils.supportShadow() && Stat.enableShadow;
        if (needShadowCasterPass) {
            scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT)
            scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
            shadowCasterPass = ILaya3D.Scene3D._shadowCasterPass;
            shadowCasterPass.update(this, mainDirectLight, ShadowLightType.DirectionLight);
            shadowCasterPass.render(context, scene, ShadowLightType.DirectionLight, this);
        }
        else {
            scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
        }
        var spotMainLight = scene._mainSpotLight;
        var spotneedShadowCasterPass: boolean = spotMainLight && spotMainLight.shadowMode !== ShadowMode.None && ShadowUtils.supportShadow() && Stat.enableShadow;
        if (spotneedShadowCasterPass) {
            scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
            scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
            shadowCasterPass = ILaya3D.Scene3D._shadowCasterPass;
            shadowCasterPass.update(this, spotMainLight, ShadowLightType.SpotLight);
            shadowCasterPass.render(context, scene, ShadowLightType.SpotLight, this);
        }
        else {
            scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);
        }
        if (needShadowCasterPass)
            scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW);
        if (spotneedShadowCasterPass)
            scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT);

        return needShadowCasterPass || spotneedShadowCasterPass;

    }

    /**
     * 渲染主流程之前
     * @internal
     * @param context 渲染上下文
     * @param scene 渲染场景
     * @param needInternalRT 是否需要内部Rendertarget
     * @param viewport 视口
     */
    _preRenderMainPass(context: RenderContext3D, scene: Scene3D, needInternalRT: boolean, viewport: Viewport) {
        context.camera = this;
        context.cameraShaderValue = this._shaderValues;
        Camera._updateMark++;

        //TODO:webgl2 should use blitFramebuffer
        //TODO:if adjacent camera param can use same internal RT can merge
        //if need internal RT and no off screen RT and clearFlag is DepthOnly or Nothing, should grab the backBuffer
        if (needInternalRT && !this._offScreenRenderTexture && (this.clearFlag == CameraClearFlags.DepthOnly || this.clearFlag == CameraClearFlags.Nothing)) {
            if (RenderTexture.bindCanvasRender) {//解决iOS中使用CopyTexSubImage2D特别慢的bug
                if (RenderTexture.bindCanvasRender != this._internalRenderTexture) {
                    var blit: BlitScreenQuadCMD = BlitScreenQuadCMD.create(RenderTexture.bindCanvasRender, this._internalRenderTexture);
                    blit.setContext(context);
                    blit.run();
                    blit.recover();
                }
            } else {
                if (this._enableHDR) {//internal RT is HDR can't directly copy
                    var grabTexture: RenderTexture = RenderTexture.createFromPool(viewport.width, viewport.height, RenderTargetFormat.R8G8B8, RenderTargetFormat.DEPTH_16, false, 1);
                    grabTexture.filterMode = FilterMode.Bilinear;
                    this._renderEngine.copySubFrameBuffertoTex(grabTexture, 0, 0, 0, viewport.x, RenderContext3D.clientHeight - (viewport.y + viewport.height), viewport.width, viewport.height);
                    // this._renderEngine.bindTexture(gl.TEXTURE_2D, grabTexture._getSource());
                    // gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, viewport.x, RenderContext3D.clientHeight - (viewport.y + viewport.height), viewport.width, viewport.height);
                    var blit: BlitScreenQuadCMD = BlitScreenQuadCMD.create(grabTexture, this._internalRenderTexture);
                    blit.setContext(context);
                    blit.run();
                    blit.recover();
                    RenderTexture.recoverToPool(grabTexture);
                }
            }

        }
    }

    /**
     * 渲染主流程
     * @internal
     * @param context 渲染上下文
     * @param viewport 视口
     * @param scene 场景
     * @param shader shader
     * @param replacementTag 替换标签
     * @param needInternalRT 是否需要内部RT
     */
    _renderMainPass(context: RenderContext3D, viewport: Viewport, scene: Scene3D, shader: Shader3D, replacementTag: string, needInternalRT: boolean) {
        var renderTex: RenderTexture = this._getRenderTexture();//如果有临时renderTexture则画到临时renderTexture,最后再画到屏幕或者离屏画布,如果无临时renderTexture则直接画到屏幕或离屏画布
        if (renderTex && renderTex._isCameraTarget)//保证反转Y状态正确
            context.invertY = true;
        else
            context.invertY = false;
        context.viewport = viewport;
        //设置context的渲染目标
        context.destTarget = renderTex;
        this._prepareCameraToRender();
        var multiLighting: boolean = Config3D._multiLighting;
        (multiLighting) && (Cluster.instance.update(this, <Scene3D>(scene)));

        context.customShader = shader;
        context.replaceTag = replacementTag;
        scene._preCulling(context, this);

        this._applyViewProject(context, this.viewMatrix, this._projectionMatrix);
        if (this._cameraUniformData) {//需要在Depth之前更新数据
            this._cameraUniformUBO && this._cameraUniformUBO.setDataByUniformBufferData(this._cameraUniformData);
        }
        // if (this.depthTextureMode != 0) {
        //     //TODO:是否可以不多次
        this._renderDepthMode(context);
        // }

        // todo layame temp
        (renderTex) && (renderTex._start());


        scene._clear(context);

        this._applyCommandBuffer(CameraEventFlags.BeforeForwardOpaque, context);

        this.recoverRenderContext3D(context, renderTex);
        Stat.enableOpaque && scene._renderScene(context, ILaya3D.Scene3D.SCENERENDERFLAG_RENDERQPAQUE);
        this._applyCommandBuffer(CameraEventFlags.BeforeSkyBox, context);
        this._opaquePass && this._createOpaqueTexture(renderTex, context);
        this.recoverRenderContext3D(context, renderTex);
        scene._renderScene(context, ILaya3D.Scene3D.SCENERENDERFLAG_SKYBOX);
        this._applyCommandBuffer(CameraEventFlags.BeforeTransparent, context);

        this.recoverRenderContext3D(context, renderTex);
        Stat.enableTransparent && scene._renderScene(context, ILaya3D.Scene3D.SCENERENDERFLAG_RENDERTRANSPARENT);
        //scene._componentDriver.callPostRender();//TODO:duo相机是否重复
        this._applyCommandBuffer(CameraEventFlags.BeforeImageEffect, context);
        (renderTex) && (renderTex._end());

        if (needInternalRT && Stat.enablePostprocess) {
            if (this._postProcess && this._postProcess.enable) {
                this._postProcess.commandContext = context;
                this._postProcess._render(this);
                this._postProcess._applyPostProcessCommandBuffers();
            } else if (this._enableHDR || this._needBuiltInRenderTexture) {
                var canvasWidth: number = this._getCanvasWidth(), canvasHeight: number = this._getCanvasHeight();
                if (this._offScreenRenderTexture) {
                    this._screenOffsetScale.setValue(viewport.x / canvasWidth, (canvasHeight - viewport.y - viewport.height) / canvasHeight, viewport.width / canvasWidth, viewport.height / canvasHeight);
                    this._internalCommandBuffer._camera = this;
                    this._internalCommandBuffer._context = context;
                    this._internalCommandBuffer.blitScreenQuad(this._internalRenderTexture, this._offScreenRenderTexture, this._screenOffsetScale, null, null, 0);
                    this._internalCommandBuffer._apply();
                    this._internalCommandBuffer.clear();
                }
            }
        }
        if (this._offScreenRenderTexture) {
            RenderTexture.bindCanvasRender = null;
        } else
            RenderTexture.bindCanvasRender = this._internalRenderTexture;
        this._applyCommandBuffer(CameraEventFlags.AfterEveryThing, context);

        // if (renderTex && renderTex._isCameraTarget)//保证反转Y状态正确
        //     context.invertY = false;
    }

    recoverRenderContext3D(context: RenderContext3D, renderTexture: RenderTexture) {
        const cacheViewPor = Camera._context3DViewPortCatch;
        const cacheScissor = Camera._contextScissorPortCatch;
        context.changeViewport(cacheViewPor.x, cacheViewPor.y, cacheViewPor.width, cacheViewPor.height);
        context.changeScissor(cacheScissor.x, cacheScissor.y, cacheScissor.z, cacheScissor.w);
        context.destTarget = renderTexture;
    }

    /**
     * 根据camera的深度贴图模式更新深度贴图
     * @internal
     */
    _renderDepthMode(context: RenderContext3D) {
        var cameraDepthMode = this._depthTextureMode;
        if (this._postProcess && this._postProcess.enable) {
            cameraDepthMode |= this._postProcess.cameraDepthTextureMode;
        }
        if ((cameraDepthMode & DepthTextureMode.Depth) != 0) {
            // todo
            if (!this.canblitDepth || !this._internalRenderTexture.depthStencilTexture) {
                Camera.depthPass.update(this, DepthTextureMode.Depth, this._depthTextureFormat);
                Camera.depthPass.render(context, DepthTextureMode.Depth);
            }
            else {
                this.depthTexture = this._cacheDepthTexture.depthStencilTexture;
                //@ts-ignore;
                Camera.depthPass._depthTexture = this.depthTexture;
                Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.Depth, this);
            }
        }
        if ((cameraDepthMode & DepthTextureMode.DepthNormals) != 0) {
            Camera.depthPass.update(this, DepthTextureMode.DepthNormals, this._depthTextureFormat);
            Camera.depthPass.render(context, DepthTextureMode.DepthNormals);
        }
    }

    /**
     * @internal
     * 深度贴图
     */
    get depthTexture(): BaseTexture {
        return this._depthTexture;
    }

    set depthTexture(value: BaseTexture) {
        this._depthTexture = value;
    }

    /**
     * @internal
     * 深度法线贴图
     */
    get depthNormalTexture(): RenderTexture {
        return this._depthNormalsTexture;
    }

    set depthNormalTexture(value: RenderTexture) {
        this._depthNormalsTexture = value;
    }


    /**
     * @internal
     * @param needShadowPass 
     */
    _aftRenderMainPass(needShadowPass: Boolean) {
        // if (needShadowPass)
        //     ILaya3D.Scene3D._shadowCasterPass.cleanUp();
        if (this._cacheDepth && this._internalRenderTexture) {
            if (this._cacheDepthTexture)
                this._cacheDepthTexture._inPool ? 0 : RenderTexture.recoverToPool(this._cacheDepthTexture);
            this._cacheDepthTexture = this._internalRenderTexture;
        }
        Camera.depthPass.cleanUp();
    }


    _createOpaqueTexture(currentTarget: RenderTexture, renderContext: RenderContext3D) {
        if (!this._opaqueTexture) {
            let tex = this._getRenderTexture();
            this._opaqueTexture = RenderTexture.createFromPool(tex.width, tex.height, tex.colorFormat, RenderTargetFormat.None, false, 1, false, true);
            this._shaderValues.setTexture(BaseCamera.OPAQUETEXTURE, this._opaqueTexture);
        }
        var blit: BlitScreenQuadCMD = BlitScreenQuadCMD.create(currentTarget, this._opaqueTexture);
        blit.setContext(renderContext);
        blit.run();
        blit.recover();
    }

    /**
     * @override
     * @param shader 着色器
     * @param replacementTag 替换标记。
     */
    render(shader: Shader3D = null, replacementTag: string = null): void {
        if (!this.activeInHierarchy) //custom render should protected with activeInHierarchy=true
            return;

        var viewport: Viewport = this.viewport;
        var needInternalRT: boolean = this._needInternalRenderTexture();
        var context: RenderContext3D = RenderContext3D._instance;
        var scene: Scene3D = context.scene = <Scene3D>this._scene;
        scene._setCullCamera(this);
        context.pipelineMode = context.configPipeLineMode;
        context.replaceTag = replacementTag;
        context.customShader = shader;
        let texFormat = this._getRenderTextureFormat();

        if (needInternalRT) {
            if (this.msaa) {
                this._internalRenderTexture = RenderTexture.createFromPool(viewport.width, viewport.height, texFormat, this._depthTextureFormat, false, 4, this.canblitDepth, this._needRenderGamma(texFormat));
                this._internalRenderTexture.filterMode = FilterMode.Bilinear;
            } else {
                this._internalRenderTexture = RenderTexture.createFromPool(viewport.width, viewport.height, texFormat, this._depthTextureFormat, false, 1, this.canblitDepth, this._needRenderGamma(texFormat));
                this._internalRenderTexture.filterMode = FilterMode.Bilinear;
            }
        }
        else {
            this._internalRenderTexture = null;
        }
        scene._componentDriver.callPreRender();
        var needShadowCasterPass: boolean = this._renderShadowMap(scene, context);
        this._preRenderMainPass(context, scene, needInternalRT, viewport);
        this._renderMainPass(context, viewport, scene, shader, replacementTag, needInternalRT);
        this._aftRenderMainPass(needShadowCasterPass);
        scene._componentDriver.callPostRender();
    }


    /**
     * 计算从屏幕空间生成的射线。
     * @param point 屏幕空间的位置位置。
     * @param out  输出射线。
     */
    viewportPointToRay(point: Vector2, out: Ray): void {
        this._rayViewport.x = this.viewport.x;
        this._rayViewport.y = this.viewport.y;
        this._rayViewport.width = ILaya.stage._width;
        this._rayViewport.height = ILaya.stage._height;
        Picker.calculateCursorRay(point, this._rayViewport, this._projectionMatrix, this.viewMatrix, null, out);
    }

    /** 
     * 计算从裁切空间生成的射线。
     * @param point 裁切空间的位置。
     * @param out  输出射线。
     */
    normalizedViewportPointToRay(point: Vector2, out: Ray): void {
        var finalPoint: Vector2 = Camera._tempVector20;
        var vp: Viewport = this.normalizedViewport;
        point.x = point.x * Config3D.pixelRatio;
        point.y = point.y * Config3D.pixelRatio;
        finalPoint.x = point.x * vp.width;
        finalPoint.y = point.y * vp.height;

        Picker.calculateCursorRay(finalPoint, this.viewport, this._projectionMatrix, this.viewMatrix, null, out);
    }

    /**
     * 将一个点从世界空间转换到视口空间。
     * @param position 世界空间的坐标。
     * @param out  x、y、z为视口空间坐标,w为相对于摄像机的z轴坐标。
     */
    worldToViewportPoint(position: Vector3, out: Vector4): void {
        Matrix4x4.multiply(this._projectionMatrix, this._viewMatrix, this._projectionViewMatrix);
        this.viewport.project(position, this._projectionViewMatrix, out);
        var r = Config3D.pixelRatio;
        let _wr = (out.x - this.viewport.x) / r;
        let _hr = (out.y - this.viewport.y) / r;
        out.x = _wr + this.viewport.x;
        out.y = _hr + this.viewport.y;

        out.x = (out.x / ILaya.stage.clientScaleX) | 0;
        out.y = (out.y / ILaya.stage.clientScaleY) | 0;
    }

    /**
     * 将一个点从世界空间转换到归一化视口空间。
     * @param position 世界空间的坐标。
     * @param out  x、y、z为归一化视口空间坐标,w为相对于摄像机的z轴坐标。
     */
    worldToNormalizedViewportPoint(position: Vector3, out: Vector4): void {
        this.worldToViewportPoint(position, out);
        out.x = out.x / ILaya.stage.width;
        out.y = out.y / ILaya.stage.height;
    }

    /**
     * 转换2D屏幕坐标系统到3D正交投影下的坐标系统，注:只有正交模型下有效。
     * @param   source 源坐标。
     * @param   out 输出坐标。
     * @return 是否转换成功。
     */
    convertScreenCoordToOrthographicCoord(source: Vector3, out: Vector3): boolean {//TODO:是否应该使用viewport宽高
        if (this._orthographic) {
            var clientWidth: number = this.clientWidth;
            var clientHeight: number = this.clientHeight;
            var ratioX: number = this.orthographicVerticalSize * this.aspectRatio / clientWidth;
            var ratioY: number = this.orthographicVerticalSize / clientHeight;
            out.x = (-clientWidth / 2 + source.x * ILaya.stage.clientScaleX) * ratioX;
            out.y = (clientHeight / 2 - source.y * ILaya.stage.clientScaleY) * ratioY;
            out.z = (this.nearPlane - this.farPlane) * (source.z + 1) / 2 - this.nearPlane;
            Vector3.transformCoordinate(out, this.transform.worldMatrix, out);
            return true;
        } else {
            return false;
        }
    }

    /**
     * @inheritDoc
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        this._needInternalRenderTexture() && this._internalRenderTexture && (!this._internalRenderTexture._inPool) && RenderTexture.recoverToPool(this._internalRenderTexture);
        this._offScreenRenderTexture = null;
        this.transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        ILaya.stage.off(Event.RESIZE, this, this._onScreenSizeChanged);
        this._cameraEventCommandBuffer = {};
        this._shaderValues.destroy();
        if (RenderContext3D._instance.camera == this) {
            RenderContext3D._instance.cameraShaderValue = null;
            RenderContext3D._instance.camera = null;
        }
        super.destroy(destroyChild);
    }

    /**
     * 增加camera渲染节点渲染缓存
     * @param event 相机事件标志
     * @param commandBuffer 渲染命令流
     */
    addCommandBuffer(event: CameraEventFlags, commandBuffer: CommandBuffer): void {
        var commandBufferArray: CommandBuffer[] = this._cameraEventCommandBuffer[event];
        if (!commandBufferArray) commandBufferArray = this._cameraEventCommandBuffer[event] = [];
        if (commandBufferArray.indexOf(commandBuffer) < 0)
            commandBufferArray.push(commandBuffer);
        commandBuffer._camera = this;
        if (commandBuffer.casterShadow) {
            this._addCasterShadowCommandBuffer(commandBuffer);
        }
    }

    /**
     * 移除camera渲染节点渲染缓存
     * @param event 相机事件标志
     * @param commandBuffer 渲染命令流
     */
    removeCommandBuffer(event: CameraEventFlags, commandBuffer: CommandBuffer): void {
        var commandBufferArray: CommandBuffer[] = this._cameraEventCommandBuffer[event];
        if (commandBufferArray) {
            var index: number = commandBufferArray.indexOf(commandBuffer);
            if (index != -1) commandBufferArray.splice(index, 1);

            commandBuffer.casterShadow && this._removeCasterShadowCommandBuffer(commandBuffer);
        }
        else
            throw "Camera:unknown event.";
    }

    /**
     * 移除camera相机节点的所有渲染缓存
     * @param event 相机事件标志
     */
    removeCommandBuffers(event: CameraEventFlags): void {
        if (this._cameraEventCommandBuffer[event])
            this._cameraEventCommandBuffer[event].length = 0;
    }

    /**
     * @internal
     */
    protected _create(): Node {
        return new Camera();
    }

    /** @internal [NATIVE]*/
    _boundFrustumBuffer: Float32Array;
}

