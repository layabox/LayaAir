import { Texture2D } from "../resource/Texture2D";
import { EmptyFactory, ISpineFactory } from "./interface/ISpineFactory";

export class SpineConst {
    /**
     * @en Spine runtime version.
     * @zh Spine 运行时版本。
     */
    static VERSION = "3.8";
    
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
    static factory: ISpineFactory = new EmptyFactory();
}

export enum ESpineRenderMode {
    Normal = "normal",
    Optimize = "optimize",
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
