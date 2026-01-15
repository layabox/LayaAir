import { Laya } from "../../Laya";
import { Texture2D } from "../resource/Texture2D";
import { ISpineFactory } from "./interface/ISpineFactory";
import { SpineShaderInit } from "./shader/SpineShaderInit";

export class SpineConst {

    /** @internal */
    static SPLIT_REGEX = /\r?\n/;
    /** @internal */
    static PMA_REGEX = /^pma:\s*(true|false)$/i;
    /**
     * @en Image defalut premultiplied alpha
     * @zh 图片默认预乘
     */
    static PREMULTIPLIED_ALPHA_DEFAULT = false;
    /**
     * @en Spine runtime version.
     * @zh Spine 运行时版本。
     */
    static VERSION = "3.8";
    /**
     * @en Version first of Spine
     * @zh Spine版本号
     */
    public static VersionFirst: number = 3;
    /**
     * @en Version second of Spine
     * @zh Spine版本号小数位
     */
    public static VersionSecond: number = 8;

    /**
     * @en Switch for normal rendering mode.
     * @zh 普通渲染模式的开关。
     */
    static normalRenderSwitch: boolean = false;

    /** optimise render的最大骨骼数 */
    static MAX_BONES = 100;

    /**
     * @en Switch for caching mode.
     * @zh 缓存模式的开关。
     */
    static cacheSwitch: boolean = false;

    /**
     * @en Spine factory.
     * @zh Spine 工厂。
     */
    static factory: ISpineFactory = null;

    /**
     * @en Size of each vertex in the vertex array.
     * @zh 顶点数组中每个顶点的大小。
     */
    static VERTEXSIZE: number = 8;
    /**
     * @en Size of each vertex in the vertex array with Two Color.
     * @zh 双顶点色模式顶点数组中每个顶点的大小。
     */
    static VERTEX_TWOCOLOR: number = 12;

    /**
     * @en Initial capacity of the vertex array.
     * @zh 顶点数组的初始容量。
     */
    static VERTEX_INITIAL_CAPACITY: number = 128;

    /**
     * @en The number of vertices for normal rendering.
     * @zh 普通渲染中顶点的数量。
     */
    static NORMAL_VERTEX_LENGTH: number = 1024;
    
    /**
     * @en Maximum number of vertices. Limited by 64K indexbuffer constraint.
     * @zh 最大顶点数。
     */
    static NORMAL_MAX_VERTEX: number = 10922;//64*1024/3/2 

    /**
     * @en The number of vertices for a bone in the optimized Spine rendering.
     * @zh 优化后的 Spine 渲染中，一个骨骼的顶点数。
     */
    static VERTEX_BONE: number = 22;
    /**
     * @en The number of vertices for a rigid body in the optimized Spine rendering.
     * @zh 优化后的 Spine 渲染中，一个刚体的顶点数。
     */
    static VERTEX_RIGIDBODY: number = 9;

    /**
     * @en The step of the spine animation.
     * @zh Spine 动画的步长。
     */
    static SPINE_STEP: number = 1 / 30;

    /**
     * @en Indicates if slot is needed
     * @zh 是否需要插槽
     */
    static NEED_SLOT: boolean = false;
}

export enum ESpineRenderMode {
    /** 普通渲染模式 */
    Normal = "normal",
    /** 优化渲染模式 */
    Optimize = "optimize",
    /** 烘焙渲染模式 */
    Bake = "bake",
}

export enum ESpineRenderState {
    Stopped = 0,
    Paused = 1,
    Playing = 2,
}

export type TSpineBakeData = {
    bonesNums: number;
    aniOffsetMap: { [key: string]: number };
    texture2d?: Texture2D;
    simpPath?: string;
}

Laya.addAfterInitCallback(() => {
    let versionString = SpineConst.VERSION.split('.');
    let versionNumber = Math.floor(Number(versionString[0]));
    let versionNumber2 = Math.floor(Number(versionString[1]));
 
    SpineConst.VersionFirst = versionNumber;
    SpineConst.VersionSecond = versionNumber2;

    if (versionNumber >= 4 && versionNumber2 >= 1) {
        SpineConst.NEED_SLOT = true;
    }

    SpineShaderInit.init();
});
