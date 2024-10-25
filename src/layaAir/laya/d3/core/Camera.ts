import { Config3D } from "../../../Config3D";
import { Node } from "../../display/Node";
import { Event } from "../../events/Event";
import { BaseTexture } from "../../resource/BaseTexture";
import { PostProcess } from "../component/PostProcess";
import { DepthPass } from "../depthMap/DepthPass";
import { BoundFrustum } from "../math/BoundFrustum";
import { Ray } from "../math/Ray";
import { Picker } from "../utils/Picker";
import { BaseCamera } from "./BaseCamera";
import { CommandBuffer } from "./render/command/CommandBuffer";
import { RenderContext3D } from "./render/RenderContext3D";
import { Scene3D } from "./scene/Scene3D";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable";
import { ILaya } from "../../../ILaya";
import { TextureCube } from "../../resource/TextureCube";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "../../resource/Texture2D";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { DepthTextureMode, RenderTexture } from "../../resource/RenderTexture";
import { Stat } from "../../utils/Stat";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { LayaGL } from "../../layagl/LayaGL";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";
import { IRender3DProcess } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ICameraNodeData } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { Transform3D } from "./Transform3D";
import { Cluster } from "../graphics/renderPath/Cluster";
import { Viewport } from "../../maths/Viewport";
import { RenderPassStatisticsInfo } from "../../RenderEngine/RenderEnum/RenderStatInfo";

/**
 * @en Camera clear flags.
 * @zh 相机清除标记。
 */
export enum CameraClearFlags {
    /**
     * @en Solid color.
     * @zh 固定颜色。
     */
    SolidColor,
    /**
     * @en Sky.
     * @zh 天空。
     */
    Sky,
    /**
     * @en Depth only.
     * @zh 仅深度。
     */
    DepthOnly,
    /**
     * @en Do not clear.
     * @zh 不清除。
     */
    Nothing,
    /**
     * @en Clear color only.
     * @zh 只清理颜色。
     */
    ColorOnly,
}

/**
 * @en Camera event flags.
 * @zh 相机事件标记。
 */
export enum CameraEventFlags {
    //BeforeDepthTexture,
    //AfterDepthTexture,
    //BeforeDepthNormalsTexture,
    //AfterDepthNormalTexture,
    /**
     * @en Before rendering opaque objects.
     * @zh 在渲染非透明物体之前。
     */
    BeforeForwardOpaque = 0,
    /**
     * @en Before rendering the skybox.
     * @zh 在渲染天空盒之前。
     */
    BeforeSkyBox = 2,
    /**
     * @en Before rendering transparent objects.
     * @zh 在渲染透明物体之前。
     */
    BeforeTransparent = 4,
    /**
     * @en Before applying image effects.
     * @zh 在后期处理之前。
     */
    BeforeImageEffect = 6,
    /**
     * @en After all rendering is complete.
     * @zh 所有渲染之后。
     */
    AfterEveryThing = 8,
}

/**
 * @en The Camera class is used to create cameras.
 * @zh Camera 类用于创建摄像机。
 */
export class Camera extends BaseCamera {

    /** @internal*/
    static _context3DViewPortCatch: Viewport = new Viewport(0, 0, 0, 0);
    /**@internal */
    static _contextScissorPortCatch: Vector4 = new Vector4(0, 0, 0, 0);

    /**
     * @internal
     * @en Update flag
     * @zh 更新标志位
     */
    static get _updateMark(): number {
        return RenderContext3D._instance._contextOBJ.cameraUpdateMask;
    }

    static set _updateMark(value: number) {
        RenderContext3D._instance._contextOBJ.cameraUpdateMask = value;
    }



    /** 
     * @internal 
     * @en Depth map pipeline
     * @zh 深度贴图管线
     */
    static depthPass: DepthPass;

    /**
     * @en Get the rendering result of a certain position in the scene based on camera and scene information.
     * @param camera The camera
     * @param scene The scene to be rendered
     * @param renderTexture The render texture to draw to
     * @returns The rendered texture
     * @zh 根据相机、场景信息获得场景中某一位置的渲染结果。
     * @param camera 相机
     * @param scene 需要渲染的场景
     * @param renderTexture 要绘制到的渲染纹理
     * @returns 渲染后的纹理
     */
    static drawRenderTextureByScene(camera: Camera, scene: Scene3D, renderTexture: RenderTexture): RenderTexture {
        if (!renderTexture) return null;
        Scene3D._updateMark++;

        if (!scene.parent)
            scene._update();
        else {
            scene.sceneRenderableManager.renderUpdate();
            scene.skyRenderer.renderUpdate(RenderContext3D._instance);
        }

        //@ts-ignore
        scene._prepareSceneToRender();
        scene._setCullCamera(camera);
        let recoverTexture = camera.renderTarget;
        camera.renderTarget = renderTexture;

        let originScene = camera.scene;

        camera._scene = scene;

        camera.render(scene);
        camera.renderTarget = recoverTexture;
        scene.recaculateCullCamera();
        scene._componentDriver.callPostRender();

        camera._aftRenderMainPass();

        camera._scene = originScene;

        return renderTexture;
    }

    /**
     * @deprecated 请使用getTexturePixelAsync函数代替
     * get PixelTexture
     * 获得纹理的像素
     * @param texture 纹理
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
        let rt = RenderTexture.createFromPool(texture.width, texture.height, rtFormat, RenderTargetFormat.None, false, 0, false);
        let cmd = new CommandBuffer();
        cmd.blitScreenQuad(texture, rt);
        cmd.context = RenderContext3D._instance;
        cmd._applyOne();
        texture.filterMode = coverFilter;
        rt.getData(0, 0, texture.width, texture.height, pixelData);
        rt.destroy();//删除
        return pixelData;
    }

    /**
     * @en Get the pixels of a texture asynchronously
     * @param texture The texture
     * @returns A promise that resolves with the pixel data
     * @zh 获得纹理的像素
     * @param texture 纹理
     * @returns 解析为像素数据的 Promise
     */
    static getTexturePixelAsync(texture: Texture2D): Promise<ArrayBufferView> {
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
        let rt = RenderTexture.createFromPool(texture.width, texture.height, rtFormat, RenderTargetFormat.None, false, 0, false);
        let cmd = new CommandBuffer();
        cmd.blitScreenQuad(texture, rt);
        cmd.context = RenderContext3D._instance;
        cmd._applyOne();
        texture.filterMode = coverFilter;
        const pd = rt.getDataAsync(0, 0, texture.width, texture.height, pixelData);
        rt.destroy();//删除
        return pd;
    }

    /**
     * @en Draw scene content based on the camera's position in the scene and return it
     * @param camera The camera
     * @param scene The scene
     * @param renderCubeSize The pixel size of the cube texture
     * @param format The color format
     * @param cullingMask The culling mask
     * @returns Output texture pixels in order: back, front, left, right, up, down
     * @zh 根据场景中相机的位置绘制场景内容并返回
     * @param camera 相机
     * @param scene 场景
     * @param renderCubeSize 立方体纹理像素大小
     * @param format 颜色格式
     * @param cullingMask 剔除遮罩
     * @returns 输出纹理像素顺序：后、前、左、右、上、下
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
                throw new Error("Type is not supported");
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

    /**
     * @en Draw the content of a specified scene to a cube map texture.
     * @param camera The camera used for rendering.
     * @param position The position of the camera.
     * @param scene The specified scene to render.
     * @param renderCubeSize The size of the cube map texture.
     * @param format The format of the cube map texture.
     * @param cullingMask The culling mask for the camera. Default is 0.
     * @returns The created cube map texture.
     * @zh 绘制指定场景的内容到立方体贴图。
     * @param camera 用于渲染的相机。
     * @param position 相机的位置。
     * @param scene 要渲染的指定场景。
     * @param renderCubeSize 立方体贴图的大小。
     * @param format 立方体贴图的格式。
     * @param cullingMask 相机的剔除遮罩。默认值为0。
     * @returns 创建的立方体贴图。
     */
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
                throw new Error("Type is not supported");
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
    /**
     * @internal
     * @en Whether to directly use the rendered depth map
     * @zh 是否直接使用渲染深度贴图
     */
    _canBlitDepth: boolean = false;
    /**@internal */
    _internalCommandBuffer: CommandBuffer = new CommandBuffer();
    /**
     * @internal
     * @protected
     * @en Depth texture format
     * @zh 深度贴图格式
     */
    protected _depthTextureFormat: RenderTargetFormat = RenderTargetFormat.DEPTH_32; //兼容WGSL
    /**
     * @en Depth texture
     * @zh 深度贴图
     */
    private _depthTexture: BaseTexture;
    /**
     * @en Depth normals texture
     * @zh 深度法线贴图
     */
    private _depthNormalsTexture: RenderTexture;

    /**
     * @internal
     * @en Opaque objects texture
     * @zh 非透明物体贴图
     */
    _opaqueTexture: RenderTexture;
    /**
     * @en Whether to enable the opaque objects pass
     * @zh 是否开启非透明物体通道
     */
    private _opaquePass: boolean;

    /** @internal */
    _cameraEventCommandBuffer: { [key: string]: CommandBuffer[] } = {};
    /**
     * @internal
     * @en Implement shadow rendering using CommandBuffer
     * @zh 实现CommandBuffer的阴影渲染
     */
    private _shadowCasterCommanBuffer: CommandBuffer[] = [];

    /** @internal */
    _clusterXPlanes: Vector3[];
    /** @internal */
    _clusterYPlanes: Vector3[];
    /** @internal */
    _clusterPlaneCacheFlag: Vector2 = new Vector2(-1, -1);
    /** @internal */
    _screenOffsetScale: Vector4 = new Vector4();

    /**
     * @en Whether rendering is allowed.
     * @zh 是否允许渲染。
     */
    enableRender: boolean = true;
    /**
     * @en Clear flag.
     * @zh 清除标记。
     */
    clearFlag: CameraClearFlags = CameraClearFlags.SolidColor;
    /**
     * @internal
     * @en Whether to cache the depth texture from the previous frame.
     * @zh 是否缓存上一帧的深度纹理。
     */
    _cacheDepth: boolean
    /**
     * @internal
     * @en Cached texture from the previous frame.
     * @zh 缓存的上一帧纹理。
     */
    _cacheDepthTexture: RenderTexture;

    _renderDataModule: ICameraNodeData;

    private _Render3DProcess: IRender3DProcess;

    /**
     * @en The near clipping plane of the camera.
     * @param value The distance to the near clipping plane.
     * @zh 相机的近裁剪平面。
     * @param value 近裁剪平面的距离。
     */
    set nearPlane(value: number) {
        super.nearPlane = value;
        this._renderDataModule.nearplane = value;
    }

    get nearPlane() {
        return this._nearPlane;
    }

    /**
     * @en The far clipping plane of the camera.
     * @param value The distance to the far clipping plane.
     * @zh 相机的远裁剪平面。
     * @param value 远裁剪平面的距离。
     */
    set farPlane(value: number) {
        super.farPlane = value;
        this._renderDataModule.farplane = value;
    }

    get farPlane() {
        return this._farPlane;
    }

    /**
     * @en Set the field of view of the camera.
     * @param value The field of view in degrees.
     * @zh 设置相机的视野。
     * @param value 单位为度。
     */
    set fieldOfView(value: number) {
        super.fieldOfView = value;
        this._renderDataModule.fieldOfView = value;
    }

    get fieldOfView() {
        return this._fieldOfView;
    }

    /**
     * @en The aspect ratio of the camera.
     * @zh 相机的横纵比。
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
        this._renderDataModule.aspectRatio = value;
        this._calculateProjectionMatrix();
    }

    /**
     * @en The viewport in screen pixel coordinates.
     * @zh 屏幕像素坐标的视口。
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

    /**
     * @en The display width of the camera.
     * @zh 相机显示宽度。
     */
    get clientWidth(): number {
        ILaya.stage.needUpdateCanvasSize();
        if (Config3D.customResolution)
            return Config3D.pixelRatio * Config3D._resoluWidth | 0;
        else
            return RenderContext3D.clientWidth * Config3D.pixelRatio | 0;
    }

    /**
     * @en The display height of the camera.
     * @zh 相机显示高度。
     */
    get clientHeight(): number {
        ILaya.stage.needUpdateCanvasSize();
        if (Config3D.customResolution)
            return Config3D.pixelRatio * Config3D._resoluHeight | 0;
        else
            return RenderContext3D.clientHeight * Config3D.pixelRatio | 0;
    }



    /**
     * @en Multi-sample anti-aliasing.
     * @zh 多重采样抗锯齿。
     */
    set msaa(value: boolean) {
        LayaGL.renderEngine.getCapable(RenderCapable.MSAA) ? this._msaa = value : this._msaa = false;
    }


    get msaa(): boolean {
        return this._msaa && Stat.enablemsaa;
    }

    /**
     * @en Space anti-aliasing.
     * @zh 空间抗锯齿
     */
    set fxaa(value: boolean) {
        this._fxaa = value;
    }

    get fxaa(): boolean {
        return this._fxaa;
    }

    /**
     * @en The viewport in clip space.
     * @zh 裁剪空间的视口。
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
     * @en Get the view matrix.
     * @zh 视图矩阵。
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
            if (this.skyRenderElement._renderElementOBJ)
                this.skyRenderElement.calculateViewMatrix(this._viewMatrix);
        }
        return this._viewMatrix;
    }

    /**
     * @en The projection matrix.
     * @zh 投影矩阵。
     */
    get projectionMatrix(): Matrix4x4 {
        return this._projectionMatrix;
    }

    set projectionMatrix(value: Matrix4x4) {
        this._projectionMatrix = value;
        this._useUserProjectionMatrix = true;
    }

    /**
     * @en The projection view matrix.
     * @zh 视图投影矩阵。
     */
    get projectionViewMatrix(): Matrix4x4 {
        Matrix4x4.multiply(this.projectionMatrix, this.viewMatrix, this._projectionViewMatrix);
        this._renderDataModule.setProjectionViewMatrix(this._projectionViewMatrix);
        return this._projectionViewMatrix;
    }

    /**
     * @en The bound frustum of the camera.
     * @zh 摄像机视锥。
     */
    get boundFrustum(): BoundFrustum {
        this._boundFrustum.matrix = this.projectionViewMatrix;
        return this._boundFrustum;
    }

    /**
     * @en Customize the rendering target for the scene.
     * @zh 自定义渲染场景的渲染目标。
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
     * @en Post processing.
     * @zh 后期处理。
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
     * @en Whether to enable HDR. Enabling it has a certain impact on performance.
     * @zh 是否开启HDR。开启后对性能有一定影响。
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
     * @en Whether to use the RenderTexture being rendered for CommandBuffer service. Set to true when used with CommandBuffer.
     * @zh 是否使用正在渲染的 RenderTexture 为 CommandBuffer 服务。通常与 CommandBuffer 一起使用时设置为 true。
     */
    get enableBuiltInRenderTexture(): boolean {
        return this._needBuiltInRenderTexture;
    }

    set enableBuiltInRenderTexture(value: boolean) {
        this._needBuiltInRenderTexture = value;
    }

    /**
     * @en The depth texture mode for the camera.
     * @zh 相机的深度纹理模式。
     */
    get depthTextureMode(): DepthTextureMode {
        return this._depthTextureMode;
    }

    set depthTextureMode(value: DepthTextureMode) {
        this._depthTextureMode = value;
        if (!LayaGL.renderEngine.getCapable(RenderCapable.RenderTextureFormat_Depth)) {
            this._depthTextureMode &= ~DepthTextureMode.Depth;
        }
    }

    /**
     * @en Set the Opaque Pass mode for the camera.
     * @zh 相机的不透明通道模式。
     */
    set opaquePass(value: boolean) {
        if (value == this._opaquePass)
            return;
        if (!value) {
            this._shaderValues.setTexture(BaseCamera.OPAQUETEXTURE, Texture2D.blackTexture);
            this._shaderValues.setVector(BaseCamera.OPAQUETEXTUREPARAMS, Vector4.ONE);
            this._opaqueTexture && RenderTexture.recoverToPool(this._opaqueTexture);
            this._opaqueTexture = null;
        }
        this._opaquePass = value;
    }

    get opaquePass() {
        return this._opaquePass;
    }

    opaqueTextureSize: number = 512;

    /**
     * @en The format of the depth texture.
     * @zh 深度纹理的格式。
     */
    get depthTextureFormat(): RenderTargetFormat {
        return this._depthTextureFormat;
    }
    set depthTextureFormat(value: RenderTargetFormat) {
        this._depthTextureFormat = value;
    }


    /**
     * @en Enable or disable the use of built-in depth texture (TODO: If enabled, the depth texture can only be used in post-processing, not in the rendering process).
     * @zh 设置是否使用内置的深度纹理（TODO:如果开启，深度纹理只能在后期处理中使用，不能在渲染流程中使用）。
     */
    set enableBlitDepth(value: boolean) {
        if (value == this._canBlitDepth)
            return;
        this._canBlitDepth = value;
        this._cacheDepth = value;
        this._internalRenderTexture && RenderTexture.recoverToPool(this._internalRenderTexture);
        this._internalRenderTexture = RenderTexture.createFromPool(this.viewport.width, this.viewport.height, this._getRenderTextureFormat(), this.depthTextureFormat, false, this.msaa ? 4 : 1, this._canBlitDepth, this._needRenderGamma(this._getRenderTextureFormat()));
        if (!value) {
            if (this._cacheDepthTexture)
                this._cacheDepthTexture._inPool ? 0 : RenderTexture.recoverToPool(this._cacheDepthTexture);
        }

    }
    get enableBlitDepth() {
        return this._canBlitDepth;
    }

    /**
     * @en Whether the camera can blit (draw) the depth texture.
     * @zh 相机是否可以绘制深度纹理。
     */
    get canblitDepth() {
        return this._canBlitDepth && this._internalRenderTexture && this._internalRenderTexture.depthStencilFormat != null;
    }

    /**
     * @en Creates an instance of the Camera.
     * @param aspectRatio The aspect ratio of the camera view.
     * @param nearPlane The near clipping plane distance.
     * @param farPlane The far clipping plane distance.
     * @zh 创建一个Camera实例。
     * @param	aspectRatio 横纵比。
     * @param	nearPlane 近裁面。
     * @param	farPlane 远裁面。
     */
    constructor(aspectRatio: number = 0, nearPlane: number = 0.3, farPlane: number = 1000) {
        super(nearPlane, farPlane);
        this._renderDataModule = Laya3DRender.Render3DModuleDataFactory.createCameraModuleData();
        this._Render3DProcess = Laya3DRender.Render3DPassFactory.createRender3DProcess();
        this._renderDataModule.transform = this.transform;
        this._viewMatrix = new Matrix4x4();
        this._projectionMatrix = new Matrix4x4();
        this._projectionViewMatrix = new Matrix4x4();
        this._viewport = new Viewport(0, 0, 0, 0);
        this._normalizedViewport = new Viewport(0, 0, 1, 1);
        this._rayViewport = new Viewport(0, 0, 0, 0);
        this._aspectRatio = aspectRatio;
        this._boundFrustum = new BoundFrustum(new Matrix4x4());
        this.depthTextureMode = 0;
        this.opaquePass = false;
        this._calculateProjectionMatrix();
        ILaya.stage.on(Event.RESIZE, this, this._onScreenSizeChanged);
        this.transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        this.opaquePass = false;
        this._internalCommandBuffer.context = RenderContext3D._instance;
        this._renderDataModule.farplane = this.farPlane;
        this._renderDataModule.nearplane = this.nearPlane;
        this._renderDataModule.fieldOfView = this.fieldOfView;
        this._renderDataModule.aspectRatio = this.aspectRatio;
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
            if (this.skyRenderElement._renderElementOBJ)
                this.skyRenderElement.caluclateProjectionMatrix(this._projectionMatrix, this.aspectRatio, this.nearPlane, this.farPlane, this.fieldOfView, this.orthographic);
        }
    }

    /**
     * @internal
     * @en Check if a layer is visible based on the culling mask.
     * @param layer The layer to check.
     * @returns Whether the layer is visible.
     * @zh 通过蒙版值获取蒙版是否显示。
     * @param layer 要检查的图层。
     * @returns 图层是否可见。
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
     * @en Clone the camera.
     * @zh 克隆相机。
     */
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
        camera.orthographicVerticalSize = this.orthographicVerticalSize;
        camera.opaquePass = this.opaquePass;
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
     * @internal
     * @en Determine if the render result needs gamma correction.
     * @param rt The render target format to check.
     * @returns Whether gamma correction is needed for the given render target format.
     * @zh 判断渲染结果是否需要 Gamma 校正。
     * @param rt 要检查的渲染目标格式。
     * @returns 给定的渲染目标格式是否需要 Gamma 校正。
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
        let needInternalRT = this.enableBuiltInRenderTexture;
        if (this.renderTarget) {
            if (this.msaa) {
                needInternalRT = needInternalRT || !(this.renderTarget.samples > 1);
            }
            if (this.enableHDR) {
                switch (this.renderTarget.format) {
                    case TextureFormat.R16G16B16A16:
                    case TextureFormat.R16G16B16:
                    case TextureFormat.R32G32B32A32:
                    case TextureFormat.R32G32B32:
                        break;
                    default:
                        needInternalRT = true;
                        break;
                }
            }
            if (this.postProcess && this.postProcess.enable && this.postProcess.effects.length > 0) {
                needInternalRT = true;
            }
            if (this.normalizedViewport.width != 1 || this.normalizedViewport.height != 1 || this.normalizedViewport.x != 0 || this.normalizedViewport.y != 0) {
                needInternalRT = true;
            }
        }

        return needInternalRT;//condition of internal RT
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
     * @internal
     * update Camera Render
     * @param context 
     */
    _updateCameraRenderData(context: RenderContext3D) {
        this._prepareCameraToRender();
        this._applyViewProject(this.viewMatrix, this._projectionMatrix, context.invertY);
        this._contextApply(context);
    }


    /**
     * @override
     * @internal
     */
    _prepareCameraToRender(): void {
        super._prepareCameraToRender();
        var vp: Viewport = this.viewport;
        this._viewportParams.setValue(vp.x, vp.y, vp.width, vp.height);
        let invertY = LayaGL.renderEngine._screenInvertY ? !RenderContext3D._instance.invertY : RenderContext3D._instance.invertY;
        // let invertY = RenderContext3D._instance.invertY;
        this._projectionParams.setValue(this._nearPlane, this._farPlane, invertY ? -1 : 1, 1 / this.farPlane);
        this._shaderValues.setVector(BaseCamera.VIEWPORT, this._viewportParams);
        this._shaderValues.setVector(BaseCamera.PROJECTION_PARAMS, this._projectionParams);
    }

    /**
     * @internal
     * @param context 
     */
    _contextApply(context: RenderContext3D) {
        context.viewMatrix = this.viewMatrix;
        context.projectionMatrix = this.projectionMatrix;
        context.projectionViewMatrix = this.projectionViewMatrix;
    }

    /**
     * @internal
     */
    _applyViewProject(viewMat: Matrix4x4, proMat: Matrix4x4, invertY: boolean): void {
        var projectView: Matrix4x4;
        if (invertY) {
            Matrix4x4.multiply(BaseCamera._invertYScaleMatrix, proMat, BaseCamera._invertYProjectionMatrix);
            Matrix4x4.multiply(BaseCamera._invertYProjectionMatrix, viewMat, BaseCamera._invertYProjectionViewMatrix);
            proMat = BaseCamera._invertYProjectionMatrix;
            projectView = BaseCamera._invertYProjectionViewMatrix;
        }
        else {
            Matrix4x4.multiply(proMat, viewMat, this._projectionViewMatrix);
            this._renderDataModule.setProjectionViewMatrix(this._projectionViewMatrix);
            projectView = this._projectionViewMatrix;
        }
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

    // /**
    //  * apply 
    //  * @internal
    //  */
    // _applyCasterPassCommandBuffer(context: RenderContext3D) {
    //     if (!this._shadowCasterCommanBuffer || this._shadowCasterCommanBuffer.length == 0)
    //         return;
    //     this._shadowCasterCommanBuffer.forEach(function (value) {
    //         value._context = context;
    //         value._apply();
    //     });
    // }

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
     * @internal
     * @en Pre-render process for the main rendering pass.
     * @param context The rendering context.
     * @param scene The scene to be rendered.
     * @param needInternalRT Whether an internal render target is needed.
     * @param viewport The viewport for rendering.
     * @zh 主渲染流程之前的预处理过程。
     * @param context 渲染上下文。
     * @param scene 要渲染的场景。
     * @param needInternalRT 是否需要内部渲染目标。
     * @param viewport 渲染的视口。
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
                    this._internalCommandBuffer.clear();
                    this._internalCommandBuffer.blitScreenQuad(RenderTexture.bindCanvasRender, this._internalRenderTexture);
                    this._internalCommandBuffer._applyOne();

                }
            } else {
                if (this._enableHDR) {//internal RT is HDR can't directly copy
                    var grabTexture: RenderTexture = RenderTexture.createFromPool(viewport.width, viewport.height, RenderTargetFormat.R8G8B8, RenderTargetFormat.DEPTH_16, false, 1);
                    grabTexture.filterMode = FilterMode.Bilinear;
                    this._renderEngine.copySubFrameBuffertoTex(grabTexture._texture, 0, 0, 0, viewport.x, RenderContext3D.clientHeight - (viewport.y + viewport.height), viewport.width, viewport.height);
                    this._internalCommandBuffer.clear();
                    this._internalCommandBuffer.blitScreenQuad(grabTexture, this._internalRenderTexture);
                    this._internalCommandBuffer._apply(true);
                    RenderTexture.recoverToPool(grabTexture);
                }
            }
        }
    }

    /**
     * @internal
     * @en The depth texture of the camera.
     * @zh 相机的深度纹理。
     */
    get depthTexture(): BaseTexture {
        return this._depthTexture;
    }

    set depthTexture(value: BaseTexture) {
        this._depthTexture = value;
    }
    /**
     * @internal
     * @en The depth-normal texture of the camera.
     * @zh 相机的深度法线纹理。
     */
    get depthNormalTexture(): RenderTexture {
        return this._depthNormalsTexture;
    }

    set depthNormalTexture(value: RenderTexture) {
        this._depthNormalsTexture = value;
    }


    /**
     * @internal
     */
    _aftRenderMainPass() {
        // if (needShadowPass)
        //     ILaya3D.Scene3D._shadowCasterPass.cleanUp();
        if (this._cacheDepth && this._internalRenderTexture) {
            if (this._cacheDepthTexture)
                this._cacheDepthTexture._inPool ? 0 : RenderTexture.recoverToPool(this._cacheDepthTexture);
            this._cacheDepthTexture = this._internalRenderTexture;
        }
        else {
            this._internalRenderTexture && RenderTexture.recoverToPool(this._internalRenderTexture);
        }

        // Camera.depthPass.cleanUp();
    }


    /**
     * @internal
     * @en Create the opaque pass texture.
     * @zh 创建不透明通道纹理。
     */
    _createOpaqueTexture() {
        if (!this._opaqueTexture) {
            let tex = this._getRenderTexture();
            // this._opaqueTexture = RenderTexture.createFromPool(tex.width, tex.height, tex.colorFormat, RenderTargetFormat.None, false, 1, false, true);
            let size = this.opaqueTextureSize;
            this._opaqueTexture = RenderTexture.createFromPool(size, size, tex.colorFormat, RenderTargetFormat.None, true, 1, false, true);
            this._opaqueTexture.filterMode = FilterMode.Bilinear;
            this._opaqueTexture.wrapModeU = WrapMode.Clamp;
            this._opaqueTexture.wrapModeV = WrapMode.Clamp;
            this._shaderValues.setTexture(BaseCamera.OPAQUETEXTURE, this._opaqueTexture);

            let opaqueTexParams = new Vector4();
            opaqueTexParams.x = this._opaqueTexture.width;
            opaqueTexParams.y = this._opaqueTexture.height;
            opaqueTexParams.z = this._opaqueTexture.maxMipmapLevel;

            this._shaderValues.setVector(BaseCamera.OPAQUETEXTUREPARAMS, opaqueTexParams);
        }
    }


    /**
     * @override
     * @en Render the scene.
     * @param scene The scene to render.
     * @zh 渲染场景。
     * @param scene 要渲染的场景。
     */
    render(scene: Scene3D): void {
        // set context
        let context = RenderContext3D._instance;
        context.scene = scene;
        context.camera = this;
        scene._setCullCamera(this);

        let viewport = this.viewport;
        let needInternalRT = this._needInternalRenderTexture();

        // create internal rt if needed
        if (needInternalRT) {
            let multiSampler = this.msaa ? 4 : 1;
            let frameFormat = this._getRenderTextureFormat();
            let depthFormat = this.depthTextureFormat;
            let gamma = this._needRenderGamma(frameFormat);
            let internalRT = RenderTexture.createFromPool(viewport.width, viewport.height, frameFormat, depthFormat, false, multiSampler, this.canblitDepth, gamma);
            internalRT.filterMode = FilterMode.Bilinear;

            this._internalRenderTexture = internalRT;
        }
        else {
            this._internalRenderTexture = null;
        }

        if (this.opaquePass && !this._opaqueTexture) {
            this._createOpaqueTexture();
        }

        context.invertY = false;
        let renderRT = this._getRenderTexture();
        if (renderRT) {
            context.invertY = renderRT._isCameraTarget ? !LayaGL.renderEngine._screenInvertY : false;
        }

        // camera data 
        this._prepareCameraToRender();
        this._applyViewProject(this.viewMatrix, this.projectionMatrix, context.invertY);
        this._contextApply(context);
        // todo proterty name
        if (this._cameraUniformData && this._cameraUniformUBO) {
            this._cameraUniformUBO.setDataByUniformBufferData(this._cameraUniformData);
        }

        if (this.clearFlag == CameraClearFlags.Sky) {
            scene.skyRenderer.setRenderElement(this.skyRenderElement);
            this.skyRenderElement.renderpre(context);
        }

        scene._componentDriver.callPreRender();
        this._preRenderMainPass(context, scene, needInternalRT, viewport);

        let multiLight = Config3D._multiLighting;
        if (multiLight) {
            Cluster.instance.update(this, scene);
        }
        var time = performance.now();//T_CameraRender Stat
        this._Render3DProcess.fowardRender(context._contextOBJ, this);
        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_CameraRender] += (performance.now() - time);//Stat

        scene._componentDriver.callPostRender();
    }

    /**
     * @en Calculate a ray from screen space.
     * @param point The position in screen space.
     * @param out The output ray.
     * @zh 计算从屏幕空间生成的射线。
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
     * @en Calculate a ray from normalized viewport space.
     * @param point The position in normalized viewport space.
     * @param out The output ray.
     * @zh 计算从归一化视口空间生成的射线。
     * @param point 裁切空间的位置。
     * @param out  输出射线。
     */
    normalizedViewportPointToRay(point: Vector2, out: Ray): void {
        var vp: Viewport = this.normalizedViewport;
        point.x = point.x * Config3D.pixelRatio;
        point.y = point.y * Config3D.pixelRatio;
        _tempVector20.x = point.x * vp.width;
        _tempVector20.y = point.y * vp.height;

        Picker.calculateCursorRay(_tempVector20, this.viewport, this._projectionMatrix, this.viewMatrix, null, out);
    }

    /**
     * @en Transform a point from world space to viewport space.
     * @param position The coordinate in world space.
     * @param out x, y, z are viewport space coordinates, w is the z-axis coordinate relative to the camera.
     * @zh 将一个点从世界空间转换到视口空间。
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
     * @en Transform a point from world space to normalized viewport space.
     * @param position The coordinate in world space.
     * @param out x, y, z are normalized viewport space coordinates, w is the z-axis coordinate relative to the camera.
     * @zh 将一个点从世界空间转换到归一化视口空间。
     * @param position 世界空间的坐标。
     * @param out  x、y、z为归一化视口空间坐标,w为相对于摄像机的z轴坐标。
     */
    worldToNormalizedViewportPoint(position: Vector3, out: Vector4): void {
        this.worldToViewportPoint(position, out);
        out.x = out.x / ILaya.stage.width;
        out.y = out.y / ILaya.stage.height;
    }

    /**
     * @en Convert 2D screen coordinate system to 3D orthographic projection coordinate system. Note: Only valid under orthographic model.
     * @param source The source coordinate.
     * @param out The output coordinate.
     * @returns Whether the conversion was successful.
     * @zh 转换2D屏幕坐标系统到3D正交投影下的坐标系统，注：只有正交模型下有效。
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
     * @override
     * @inheritDoc
     * @en Destroy the Camera node.
     * @param destroyChild Whether to destroy child nodes.
     * @zh 删除Camera节点。
     * @param destroyChild 是否删除子节点
     */
    destroy(destroyChild: boolean = true): void {
        this._shaderValues.destroy();
        this._internalRenderTexture && (!this._internalRenderTexture._inPool) && RenderTexture.recoverToPool(this._internalRenderTexture);
        this._offScreenRenderTexture = null;
        if (this._opaqueTexture) {
            RenderTexture.recoverToPool(this._opaqueTexture);
        }
        this.transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        ILaya.stage.off(Event.RESIZE, this, this._onScreenSizeChanged);
        this._cameraEventCommandBuffer = {};
        if (RenderContext3D._instance.camera == this) {
            RenderContext3D._instance.cameraShaderValue = null;
            RenderContext3D._instance.camera = null;
        }
        super.destroy(destroyChild);
    }

    /**
     * @en Add a command buffer to the camera's rendering pipeline.
     * @param event The camera event flag.
     * @param commandBuffer The rendering command buffer.
     * @zh 增加camera渲染节点渲染缓存。
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
     * @en Remove a command buffer from the camera's rendering pipeline.
     * @param event The camera event flag.
     * @param commandBuffer The rendering command buffer to remove.
     * @zh 移除camera渲染节点渲染缓存。
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
     * @en Remove all command buffers for a specific camera event.
     * @param event The camera event flag.
     * @zh 移除camera相机节点的所有渲染缓存。
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


const _tempVector20: Vector2 = new Vector2();