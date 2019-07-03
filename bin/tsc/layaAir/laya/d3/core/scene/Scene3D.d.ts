import { Sprite } from "../../../display/Sprite";
import { Context } from "../../../resource/Context";
import { ICreateResource } from "../../../resource/ICreateResource";
import { Texture2D } from "../../../resource/Texture2D";
import { Handler } from "../../../utils/Handler";
import { Timer } from "../../../utils/Timer";
import { ISubmit } from "../../../webgl/submit/ISubmit";
import { Input3D } from "../../Input3D";
import { Vector3 } from "../../math/Vector3";
import { PhysicsSimulation } from "../../physics/PhysicsSimulation";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { TextureCube } from "../../resource/TextureCube";
import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap";
/**
 * <code>Scene3D</code> 类用于实现场景。
 */
export declare class Scene3D extends Sprite implements ISubmit, ICreateResource {
    /**Hierarchy资源。*/
    static HIERARCHY: string;
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
    static REFLECTIONMODE_SKYBOX: number;
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
     * 加载场景,注意:不缓存。
     * @param url 模板地址。
     * @param complete 完成回调。
     */
    static load(url: string, complete: Handler): void;
    /** 当前创建精灵所属遮罩层。*/
    currentCreationLayer: number;
    /** 是否启用灯光。*/
    enableLight: boolean;
    parallelSplitShadowMaps: ParallelSplitShadowMap[];
    private _time;
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
     */
    _setCreateURL(url: string): void;
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
     *
     */
    renderSubmit(): number;
    /**
     *
     */
    getRenderType(): number;
    /**
     *
     */
    releaseRender(): void;
    /**
     *
     */
    reUse(context: Context, pos: number): number;
}
