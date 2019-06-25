import { Sprite } from "../../../display/Sprite";
import { Context } from "../../../resource/Context";
import { ICreateResource } from "../../../resource/ICreateResource";
import { Texture2D } from "../../../resource/Texture2D";
import { Handler } from "../../../utils/Handler";
import { Timer } from "../../../utils/Timer";
import { ISubmit } from "../../../webgl/submit/ISubmit";
import { SubmitKey } from "../../../webgl/submit/SubmitKey";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { CastShadowList } from "../../CastShadowList";
import { Script3D } from "../../component/Script3D";
import { SimpleSingletonList } from "../../component/SimpleSingletonList";
import { Input3D } from "../../Input3D";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { PhysicsSettings } from "../../physics/PhysicsSettings";
import { PhysicsSimulation } from "../../physics/PhysicsSimulation";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { TextureCube } from "../../resource/TextureCube";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap";
import { BaseCamera } from "../BaseCamera";
import { Camera } from "../Camera";
import { LightSprite } from "../light/LightSprite";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderQueue } from "../render/RenderQueue";
import { BoundsOctree } from "././BoundsOctree";
/**
 * <code>Scene3D</code> 类用于实现场景。
 */
export declare class Scene3D extends Sprite implements ISubmit, ICreateResource {
    /**Hierarchy资源。*/
    static HIERARCHY: string;
    /**@private */
    static physicsSettings: PhysicsSettings;
    /** 是否开启八叉树裁剪。*/
    static octreeCulling: boolean;
    /** 八叉树初始化尺寸。*/
    static octreeInitialSize: number;
    /** 八叉树初始化中心。*/
    static octreeInitialCenter: Vector3;
    /** 八叉树最小尺寸。*/
    static octreeMinNodeSize: number;
    /** 八叉树松散值。*/
    static octreeLooseness: number;
    /**@private */
    static REFLECTIONMODE_SKYBOX: number;
    /**@private */
    static REFLECTIONMODE_CUSTOM: number;
    static FOGCOLOR: number;
    static FOGSTART: number;
    static FOGRANGE: number;
    static LIGHTDIRECTION: number;
    static LIGHTDIRCOLOR: number;
    static POINTLIGHTPOS: number;
    static POINTLIGHTRANGE: number;
    static POINTLIGHTATTENUATION: number;
    static POINTLIGHTCOLOR: number;
    static SPOTLIGHTPOS: number;
    static SPOTLIGHTDIRECTION: number;
    static SPOTLIGHTSPOTANGLE: number;
    static SPOTLIGHTRANGE: number;
    static SPOTLIGHTCOLOR: number;
    static SHADOWDISTANCE: number;
    static SHADOWLIGHTVIEWPROJECT: number;
    static SHADOWMAPPCFOFFSET: number;
    static SHADOWMAPTEXTURE1: number;
    static SHADOWMAPTEXTURE2: number;
    static SHADOWMAPTEXTURE3: number;
    static AMBIENTCOLOR: number;
    static REFLECTIONTEXTURE: number;
    static REFLETIONINTENSITY: number;
    static TIME: number;
    static ANGLEATTENUATIONTEXTURE: number;
    static RANGEATTENUATIONTEXTURE: number;
    static POINTLIGHTMATRIX: number;
    static SPOTLIGHTMATRIX: number;
    /**
     * @private
     */
    static __init__(): void;
    /**
     * 加载场景,注意:不缓存。
     * @param url 模板地址。
     * @param complete 完成回调。
     */
    static load(url: string, complete: Handler): void;
    /**@private */
    private _url;
    /**@private */
    private _group;
    /** @private */
    private _lights;
    /** @private */
    private _lightmaps;
    /** @private */
    private _skyRenderer;
    /** @private */
    private _reflectionMode;
    /** @private */
    private _enableLightCount;
    /** @private */
    private _renderTargetTexture;
    /** @private */
    private _enableFog;
    /**@private */
    _physicsSimulation: PhysicsSimulation;
    /**@private */
    private _input;
    /**@private */
    private _timer;
    /**@private */
    _octree: BoundsOctree;
    /** @private 只读,不允许修改。*/
    _collsionTestList: number[];
    /** @private */
    _shaderValues: ShaderData;
    /** @private */
    _renders: SimpleSingletonList;
    /** @private */
    _opaqueQueue: RenderQueue;
    /** @private */
    _transparentQueue: RenderQueue;
    /** @private 相机的对象池*/
    _cameraPool: BaseCamera[];
    /**@private */
    _animatorPool: SimpleSingletonList;
    /**@private */
    _scriptPool: Script3D[];
    /**@private */
    _tempScriptPool: Script3D[];
    /**@private */
    _needClearScriptPool: boolean;
    /** @private */
    _castShadowRenders: CastShadowList;
    /** 当前创建精灵所属遮罩层。*/
    currentCreationLayer: number;
    /** 是否启用灯光。*/
    enableLight: boolean;
    parallelSplitShadowMaps: ParallelSplitShadowMap[];
    /**@private */
    _debugTool: PixelLineSprite3D;
    /**@private */
    _key: SubmitKey;
    private _time;
    /**@private	[NATIVE]*/
    _cullingBufferIndices: Int32Array;
    /**@private	[NATIVE]*/
    _cullingBufferResult: Int32Array;
    /**@private [Editer]*/
    _pickIdToSprite: any;
    /**
     * @private
     * [Editer]
     */
    _allotPickColorByID(id: number, pickColor: Vector4): void;
    /**
     * @private
     * [Editer]
     */
    _searchIDByPickColor(pickColor: Vector4): number;
    /**
     * 获取资源的URL地址。
     * @return URL地址。
     */
    readonly url: string;
    /**
     * 获取是否允许雾化。
     * @return 是否允许雾化。
     */
    /**
    * 设置是否允许雾化。
    * @param value 是否允许雾化。
    */
    enableFog: boolean;
    /**
     * 获取雾化颜色。
     * @return 雾化颜色。
     */
    /**
    * 设置雾化颜色。
    * @param value 雾化颜色。
    */
    fogColor: Vector3;
    /**
     * 获取雾化起始位置。
     * @return 雾化起始位置。
     */
    /**
    * 设置雾化起始位置。
    * @param value 雾化起始位置。
    */
    fogStart: number;
    /**
     * 获取雾化范围。
     * @return 雾化范围。
     */
    /**
    * 设置雾化范围。
    * @param value 雾化范围。
    */
    fogRange: number;
    /**
     * 获取环境光颜色。
     * @return 环境光颜色。
     */
    /**
    * 设置环境光颜色。
    * @param value 环境光颜色。
    */
    ambientColor: Vector3;
    /**
     * 获取天空渲染器。
     * @return 天空渲染器。
     */
    readonly skyRenderer: SkyRenderer;
    /**
     * 获取反射贴图。
     * @return 反射贴图。
     */
    /**
    * 设置反射贴图。
    * @param 反射贴图。
    */
    customReflection: TextureCube;
    /**
     * 获取反射强度。
     * @return 反射强度。
     */
    /**
    * 设置反射强度。
    * @param 反射强度。
    */
    reflectionIntensity: number;
    /**
     * 获取物理模拟器。
     * @return 物理模拟器。
     */
    readonly physicsSimulation: PhysicsSimulation;
    /**
     * 获取反射模式。
     * @return 反射模式。
     */
    /**
    * 设置反射模式。
    * @param value 反射模式。
    */
    reflectionMode: number;
    /**
     * 获取场景时钟。
     */
    /**
    * 设置场景时钟。
    */
    timer: Timer;
    /**
     *	获取输入。
     * 	@return  输入。
     */
    readonly input: Input3D;
    /**
     * 创建一个 <code>Scene3D</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _setLightmapToChildNode;
    /**
     *@private
     */
    private _update;
    /**
     * @private
     */
    private _binarySearchIndexInCameraPool;
    /**
     * @private
     */
    _setCreateURL(url: string): void;
    /**
     * @private
     */
    _getGroup(): string;
    /**
     * @private
     */
    _setGroup(value: string): void;
    /**
     * @private
     */
    private _clearScript;
    /**
     * @private
     */
    private _updateScript;
    /**
     * @private
     */
    private _lateUpdateScript;
    /**
     * @private
     */
    _addScript(script: Script3D): void;
    /**
     * @private
     */
    _removeScript(script: Script3D): void;
    /**
     * @private
     */
    _preRenderScript(): void;
    /**
     * @private
     */
    _postRenderScript(): void;
    /**
     * @private
     */
    protected _prepareSceneToRender(): void;
    /**
     * @private
     */
    _addCamera(camera: BaseCamera): void;
    /**
     * @private
     */
    _removeCamera(camera: BaseCamera): void;
    /**
     * @private
     */
    _preCulling(context: RenderContext3D, camera: Camera): void;
    /**
     * @private
     */
    _clear(gl: WebGLContext, state: RenderContext3D): void;
    /**
     * @private
     */
    _renderScene(gl: WebGLContext, state: RenderContext3D, customShader?: Shader3D, replacementTag?: string): void;
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * @inheritDoc
     */
    protected _onActive(): void;
    /**
     * @inheritDoc
     */
    protected _onInActive(): void;
    /**
     * @private
     */
    _addLight(light: LightSprite): void;
    /**
     * @private
     */
    _removeLight(light: LightSprite): void;
    /**
     * @private
     */
    _addRenderObject(render: BaseRender): void;
    /**
     * @private
     */
    _removeRenderObject(render: BaseRender): void;
    /**
     * @private
     */
    _addShadowCastRenderObject(render: BaseRender): void;
    /**
     * @private
     */
    _removeShadowCastRenderObject(render: BaseRender): void;
    /**
     * @private
     */
    _getRenderQueue(index: number): RenderQueue;
    /**
     * 设置光照贴图。
     * @param value 光照贴图。
     */
    setlightmaps(value: Texture2D[]): void;
    /**
     * 获取光照贴图浅拷贝列表。
     * @return 获取光照贴图浅拷贝列表。
     */
    getlightmaps(): Texture2D[];
    /**
     * @inheritDoc
     */
    destroy(destroyChild?: boolean): void;
    /**
     * @inheritDoc
     */
    render(ctx: Context, x: number, y: number): void;
    /**
     * @private
     */
    renderSubmit(): number;
    /**
     * @private
     */
    getRenderType(): number;
    /**
     * @private
     */
    releaseRender(): void;
    /**
     * @private
     */
    reUse(context: Context, pos: number): number;
}
