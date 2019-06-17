import { ParticleTemplateBase } from "../ParticleTemplateBase";
/**
 * <code>EmitterBase</code> 类是粒子发射器类
 */
export declare class EmitterBase {
    /**
     * 积累的帧时间
     */
    protected _frameTime: number;
    /**
     * 粒子发射速率
     */
    protected _emissionRate: number;
    /**
     * 当前剩余发射时间
     */
    protected _emissionTime: number;
    /**
     * 发射粒子最小时间间隔
     */
    minEmissionTime: number;
    /**@private */
    _particleTemplate: ParticleTemplateBase;
    /**
     * 设置粒子粒子模板
     * @param particleTemplate 粒子模板
     *
     */
    particleTemplate: ParticleTemplateBase;
    /**
     * 设置粒子发射速率
     * @param emissionRate 粒子发射速率 (个/秒)
     */
    /**
    * 获取粒子发射速率
    * @return 发射速率  粒子发射速率 (个/秒)
    */
    emissionRate: number;
    /**
     * 开始发射粒子
     * @param duration 发射持续的时间(秒)
     */
    start(duration?: number): void;
    /**
     * 停止发射粒子
     * @param clearParticles 是否清理当前的粒子
     */
    stop(): void;
    /**
     * 清理当前的活跃粒子
     * @param clearTexture 是否清理贴图数据,若清除贴图数据将无法再播放
     */
    clear(): void;
    /**
     * 发射一个粒子
     *
     */
    emit(): void;
    /**
     * 时钟前进
     * @param passedTime 前进时间
     *
     */
    advanceTime(passedTime?: number): void;
}
