import { Sprite } from "../display/Sprite";
import { ParticleSetting } from "./ParticleSetting";
import { Context } from "../resource/Context";
import { EmitterBase } from "./emitter/EmitterBase";
/**
 * <code>Particle2D</code> 类是2D粒子播放类
 *
 */
export declare class Particle2D extends Sprite {
    /**@private */
    private _matrix4;
    /**@private */
    private _particleTemplate;
    /**@private */
    private _canvasTemplate;
    /**@private */
    private _emitter;
    /**是否自动播放*/
    autoPlay: boolean;
    tempCmd: any;
    /**
     * 创建一个新的 <code>Particle2D</code> 类实例。
     * @param setting 粒子配置数据
     */
    constructor(setting: ParticleSetting);
    /**
     * 设置 粒子文件地址
     * @param path 粒子文件地址
     */
    url: string;
    /**
     * 加载粒子文件
     * @param url 粒子文件地址
     */
    load(url: string): void;
    /**
     * 设置粒子配置数据
     * @param settings 粒子配置数据
     */
    setParticleSetting(setting: ParticleSetting): void;
    /**
     * 获取粒子发射器
     */
    readonly emitter: EmitterBase;
    /**
     * 播放
     */
    play(): void;
    /**
     * 停止
     */
    stop(): void;
    /**@private */
    private _loop;
    /**
     * 时钟前进
     * @param passedTime 时钟前进时间
     */
    advanceTime(passedTime?: number): void;
    customRender(context: Context, x: number, y: number): void;
    destroy(destroyChild?: boolean): void;
}
